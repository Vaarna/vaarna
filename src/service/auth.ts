import {
  DeleteItemCommand,
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { OAuth2Client } from "google-auth-library";
import { Service, ServiceParams, dynamoDbConfig } from "./common";
import axios from "axios";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { NextApiRequest, NextApiResponse } from "next";
import { ProfileGoogle, User, Account, Session, UserItem } from "type/auth";
import config from "config";
import { ApiNotFoundError } from "type/error";
import { z } from "zod";

type AuthServiceParams = ServiceParams;

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

export class AuthService extends Service {
  readonly tableName: string;

  private readonly db: DynamoDBClient;
  private readonly googleClient: OAuth2Client;

  constructor(params: AuthServiceParams) {
    super(params, {
      tableName: config.USER_TABLE,
    });

    this.tableName = config.USER_TABLE;
    this.db = new DynamoDBClient(dynamoDbConfig(this.logger));
    this.googleClient = new OAuth2Client({
      clientId: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      redirectUri: `${config.BASE_URL}/api/auth/callback/google`,
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

  private async createUser(user: User): Promise<void> {
    try {
      const cmd = new PutItemCommand({
        TableName: this.tableName,
        Item: marshall(user),
        ConditionExpression: "attribute_not_exists(userId)",
      });
      await this.db.send(cmd);
    } catch (err) {
      const parsedErr = z
        .object({ name: z.literal("ConditionalCheckFailedException") })
        .safeParse(err);

      if (parsedErr.success) {
        this.logger.info(user, "user already exists");
      } else {
        this.logger.error({ thrown: err }, "failed to create user");
        throw err;
      }
    }
  }

  private async upsertAccount(account: Account): Promise<void> {
    try {
      const cmd = new PutItemCommand({
        TableName: this.tableName,
        Item: marshall(account),
        ConditionExpression: "attribute_not_exists(userId)",
      });
      await this.db.send(cmd);
    } catch (err) {
      const parsedErr = z
        .object({ name: z.literal("ConditionalCheckFailedException") })
        .safeParse(err);

      if (parsedErr.success) {
        this.logger.info(account, "account already exists, updating it");
        const cmd = new UpdateItemCommand({
          TableName: this.tableName,
          Key: marshall({
            userId: account.userId,
            sk: account.sk,
          }),
          UpdateExpression:
            "SET updated = :updated, profile = :profile, tokens = :tokens",
          ExpressionAttributeValues: marshall({
            ":updated": new Date().getTime(),
            ":profile": account.profile,
            ":tokens": account.tokens,
          }),
        });
        await this.db.send(cmd);
      } else {
        this.logger.error({ thrown: err }, "failed to created account");
        throw err;
      }
    }
  }

  private async getAccount(sk: string): Promise<UserItem | undefined> {
    const cmd = new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression: "sk = :sk",
      ExpressionAttributeValues: marshall({
        ":sk": sk,
      }),
      IndexName: "reverse",
    });

    const resp = await this.db.send(cmd);
    if (!resp.Items) {
      return undefined;
    }
    if (resp.Items.length !== 1) {
      return undefined;
    }

    return UserItem.parse(unmarshall(resp.Items[0]));
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

    const accountPrev = await this.getAccount(`account:google:${profile.id}`);
    const userId = accountPrev?.userId ?? uuidv4();

    const user = User.parse({
      ...profile,
      userId,
      sk: "user",
      email: profile.email,
      created: now,
      updated: now,
    });
    const account = Account.parse({
      userId,
      sk: `account:google:${profile.id}`,
      created: now,
      updated: now,
      email: profile.email,
      profile,
      tokens: r.tokens,
    });
    const sessionId = uuidv4();
    const session = Session.parse({
      userId,
      sk: `session:${sessionId}`,
      sessionId,
      userAgent: params.userAgent,
      created: now,
    });

    await Promise.all([this.createUser(user), this.upsertAccount(account)]);

    // TODO: should sessions have an expiration??
    const cmd = new PutItemCommand({
      TableName: this.tableName,
      Item: marshall(session),
    });
    await this.db.send(cmd);

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
    const { userId, sk } = await this.getSession(params.sessionId);

    const cmd = new DeleteItemCommand({
      TableName: this.tableName,
      Key: marshall({ userId, sk }),
    });

    await this.db.send(cmd);
  }

  async getSession(sessionId: string): Promise<Session> {
    const cmd = new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression: "sessionId = :sessionId",
      ExpressionAttributeValues: marshall({ ":sessionId": sessionId }),
      IndexName: "sessionId",
    });

    const resp = await this.db.send(cmd);
    if (!resp.Items) {
      throw new ApiNotFoundError(this.requestId, "session not found");
    }
    if (resp.Items.length !== 1) {
      throw new ApiNotFoundError(this.requestId, "session not found");
    }

    return Session.parse(unmarshall(resp.Items[0]));
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
