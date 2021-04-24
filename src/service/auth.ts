import {
  DeleteItemCommand,
  DynamoDBClient,
  PutItemCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { OAuth2Client } from "google-auth-library";
import { Service, ServiceConfig, dynamoDbConfig } from "./common";
import { envGet } from "util/env";
import axios from "axios";
import { z } from "zod";
import { marshall } from "@aws-sdk/util-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { NextApiRequest, NextApiResponse } from "next";

type AuthServiceConfig = {
  tableNameUser: string;
  tableNameSession: string;
} & ServiceConfig;

type SigninParams = {
  provider: string;
  state?: string;
};

type CallbackParams = {
  provider: string;
  code: string;
  state?: string;
  userAgent: string | undefined;
};

type CallbackOut = {
  cookie: string;
  redirect?: string;
};

type SignoutParams = {
  sessionId: string;
};

export const ProfileGoogle = z
  .object({
    id: z.string(),
    email: z.string().email(),
    name: z.string().optional(),
    given_name: z.string().optional(),
    family_name: z.string().optional(),
    picture: z.string().url().optional(),
  })
  .passthrough();
export type ProfileGoogle = z.infer<typeof ProfileGoogle>;

export const User = z.object({
  userId: z.string().email(),
  sk: z.literal("user"),
  created: z.number(),
  updated: z.number(),
  name: z.string().optional(),
  given_name: z.string().optional(),
  family_name: z.string().optional(),
  picture: z.string().url().optional(),
});
export type User = z.infer<typeof User>;

export class AuthService extends Service {
  readonly tableNameUser: string;
  readonly tableNameSession: string;

  private readonly db: DynamoDBClient;
  private readonly googleClient: OAuth2Client;

  constructor(config: AuthServiceConfig) {
    super(config, {
      tableNameUser: config.tableNameUser,
      tableNameSession: config.tableNameSession,
    });

    this.tableNameUser = config.tableNameUser;
    this.tableNameSession = config.tableNameSession;
    this.db = new DynamoDBClient(dynamoDbConfig(this.logger));
    this.googleClient = new OAuth2Client({
      clientId: envGet("GOOGLE_CLIENT_ID"),
      clientSecret: envGet("GOOGLE_CLIENT_SECRET"),
      redirectUri: "http://localhost:3000/api/auth/callback/google",
    });
  }

  signinUrl(params: SigninParams): string {
    if (params.provider === "google") {
      return this.googleClient.generateAuthUrl({
        scope: ["email", "profile"],
        access_type: "offline",
        state: params.state,
      });
    }

    throw new Error("unsupported provider");
  }

  private async callbackGoogle(params: CallbackParams): Promise<CallbackOut> {
    const now = new Date().getTime();
    const r = await this.googleClient.getToken(params.code);
    const profile = await axios
      .get("https://www.googleapis.com/oauth2/v1/userinfo?alt=json", {
        headers: { Authorization: `Bearer ${r.tokens.access_token}` },
      })
      .then((v) => v.data)
      .then(ProfileGoogle.parseAsync);

    const user = User.parse({
      ...profile,
      userId: profile.email,
      sk: "user",
      created: now,
      updated: now,
    });
    const account = {
      userId: profile.email,
      sk: `account:google:${profile.id}`,
      created: now,
      updated: now,
      profile,
      tokens: r.tokens,
    };
    const sessionId = uuidv4();

    try {
      const cmd = new PutItemCommand({
        TableName: this.tableNameUser,
        Item: marshall(user),
        ConditionExpression: "attribute_not_exists(userId)",
      });
      await this.db.send(cmd);
    } catch (err) {
      if (err?.name === "ConditionalCheckFailedException") {
        this.logger.info(user, "user already exists");
      } else {
        this.logger.error(err, "failed to create user");
        throw err;
      }
    }

    try {
      const cmd = new PutItemCommand({
        TableName: "User",
        Item: marshall(account),
        ConditionExpression: "attribute_not_exists(userId)",
      });
      await this.db.send(cmd);
    } catch (err) {
      if (err?.name === "ConditionalCheckFailedException") {
        this.logger.info(account, "account already exists");
        const cmd = new UpdateItemCommand({
          TableName: this.tableNameUser,
          Key: marshall({
            userId: profile.email,
            sk: `account:google:${profile.id}`,
          }),
          UpdateExpression:
            "SET updated = :updated, profile = :profile, tokens = :tokens",
          ExpressionAttributeValues: marshall({
            ":updated": now,
            ":profile": account.profile,
            ":tokens": account.tokens,
          }),
        });
        await this.db.send(cmd);
      } else {
        this.logger.error(err, "failed to created account");
        throw err;
      }
    }

    {
      // TODO: should sessions expire??
      const cmd = new PutItemCommand({
        TableName: this.tableNameSession,
        Item: marshall({
          sessionId,
          userId: profile.email,
          created: now,
          userAgent: params.userAgent,
        }),
      });
      await this.db.send(cmd);
    }

    return {
      cookie: `__Host-sessionId=${sessionId}; Max-Age=3600; Path=/; Secure; HttpOnly; SameSite=Strict;`,
      redirect: params.state,
    };
  }

  async callback(params: CallbackParams): Promise<CallbackOut> {
    if (params.provider === "google") {
      return this.callbackGoogle(params);
    }

    throw new Error("unsupported provider");
  }

  async signout(params: SignoutParams): Promise<void> {
    const cmd = new DeleteItemCommand({
      TableName: this.tableNameSession,
      Key: marshall({ sessionId: params.sessionId }),
    });

    await this.db.send(cmd);
  }

  static getSessionCookie(req: NextApiRequest): string | undefined {
    const sessionId = req.cookies["__Host-sessionId"];
    if (typeof sessionId === "string") return sessionId;
    return undefined;
  }

  static clearSessionCookie(res: NextApiResponse): void {
    res.setHeader(
      "Set-Cookie",
      "__Host-sessionId=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; Secure; HttpOnly; SameSite=Strict"
    );
  }
}
