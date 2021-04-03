import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import {
  GetObjectCommand,
  GetObjectCommandOutput,
  HeadObjectCommand,
  HeadObjectCommandOutput,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from "@aws-sdk/client-s3";
import { marshall } from "@aws-sdk/util-dynamodb";
import { formatRFC7231 } from "date-fns";
import { NextApiResponse } from "next";
import { Readable } from "stream";
import { GetAssetHeaders, GetAssetQuery } from "type/asset";
import { AssetData, AssetDatas, GetAssetData } from "type/assetData";
import { getItemsFromTable } from "util/dynamodb";

function constructHeaders(
  res: HeadObjectCommandOutput | GetObjectCommandOutput
): ApiHeaders {
  const vals = [
    { name: "ETag", value: res.ETag },
    { name: "Last-Modified", value: res.LastModified },
    { name: "Accept-Ranges", value: res.AcceptRanges },
    { name: "Content-Type", value: res.ContentType },
    { name: "Content-Length", value: res.ContentLength },
    { name: "Content-Encoding", value: res.ContentEncoding },
    {
      name: "Content-Range",
      value: "ContentRange" in res ? res.ContentRange : undefined,
    },
    {
      name: "Cache-Control",
      value: "immutable, private, max-age=3600 stale-while-revalidate=3600",
    },
  ];

  const out = [];
  for (const { name, value } of vals) {
    if (value === undefined) continue;

    let v;
    if (typeof value === "string") v = value;
    else if (typeof value === "number") v = value;
    else v = formatRFC7231(value);

    out.push({
      name,
      value: v,
    });
  }

  return out;
}

export type ApiHeaders = {
  name: string;
  value: string | number | readonly string[];
}[];

export type ApiResponse = {
  status: number;
  headers: ApiHeaders;
  body: Readable | undefined;
};

async function handleResponse(
  res: NextApiResponse,
  data: ApiResponse
): Promise<void> {
  const { status, headers, body } = data;

  headers.forEach(({ name, value }) => res.setHeader(name, value));

  res.status(status);

  if (body instanceof Readable) {
    body.pipe(res);
  } else {
    return res.end();
  }
}

const assetBucket = "gm-screen";
const assetTable = "AssetData";

export async function headAsset(
  query: GetAssetQuery,
  res: NextApiResponse,
  override?: { status?: number }
): Promise<void> {
  const s3 = new S3Client({});
  const cmd = new HeadObjectCommand({
    Bucket: assetBucket,
    Key: query.assetId,
  });

  const data = await s3.send(cmd);

  return handleResponse(res, {
    headers: constructHeaders(data),
    status: override?.status ?? 200,
    body: undefined,
  });
}

export async function getAsset(
  query: GetAssetQuery,
  headers: GetAssetHeaders,
  res: NextApiResponse
): Promise<void> {
  const s3 = new S3Client({});
  const cmd = new GetObjectCommand({
    Bucket: assetBucket,
    Key: query.assetId,
    Range: headers.range,
    IfModifiedSince: headers["if-modified-since"],
    IfNoneMatch: headers["if-none-match"],
  });

  let data;
  try {
    data = await s3.send(cmd);
  } catch (error) {
    if (error?.$metadata?.httpStatusCode === 304) {
      return headAsset(query, res, { status: 304 });
    }

    throw error;
  }

  if (!data.Body) {
    throw "s3 did not return any data??";
  }

  return handleResponse(res, {
    headers: constructHeaders(data),
    status: data.ContentRange == undefined ? 200 : 206,
    body: data.Body as Readable,
  });
}

type UploadAssetParams = {
  assetId: string;
  filename: string;
  size: number;
  contentType: string;
};

export async function uploadAsset(
  body: Exclude<PutObjectCommandInput["Body"], undefined>,
  params: UploadAssetParams
): Promise<void> {
  const s3 = new S3Client({});
  const cmd = new PutObjectCommand({
    Bucket: assetBucket,
    Key: params.assetId,
    Body: body,
    ContentType: params.contentType,
    ContentLength: params.size,
    Metadata: {
      name: params.filename,
    },
  });

  const res = await s3.send(cmd);
}

export function getKind(contentType: string): AssetData["kind"] {
  const split = contentType.split("/");

  if (split.length !== 2) return "other";

  const lhs = split[0];
  switch (lhs) {
    case "audio":
    case "video":
    case "image":
      return lhs;
  }

  if (contentType === "application/pdf") return "pdf";

  return "other";
}

export async function createAssetData(asset: AssetData): Promise<void> {
  const dynamodb = new DynamoDBClient({});
  const cmd = new PutItemCommand({
    TableName: assetTable,
    Item: marshall({
      ...asset,
    }),
  });

  const res = await dynamodb.send(cmd);
}

export async function getAssetData(query: GetAssetData): Promise<AssetDatas> {
  const data = await getItemsFromTable({
    tableName: assetTable,
    partition: { key: "spaceId", value: query.spaceId },
    sort: { key: "assetId", value: query.assetId },
  });

  const parsedData = AssetDatas.safeParse(data);
  if (!parsedData.success) {
    throw "500";
  }

  return parsedData.data;
}
