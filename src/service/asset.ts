import {
  GetObjectCommand,
  GetObjectCommandOutput,
  HeadObjectCommand,
  HeadObjectCommandOutput,
  S3Client,
} from "@aws-sdk/client-s3";
import { formatRFC7231 } from "date-fns";
import { NextApiResponse } from "next";
import { Readable } from "stream";
import { GetAssetHeaders, GetAssetQuery } from "type/api";

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

async function handleResponse(res: NextApiResponse, data: ApiResponse) {
  const { status, headers, body } = data;

  headers.forEach(({ name, value }) => res.setHeader(name, value));

  res.status(status);

  if (body instanceof Readable) {
    return body.pipe(res);
  }
  return res.end();
}

const assetBucket = "gm-screen";

export async function headAsset(
  query: GetAssetQuery,
  headers: GetAssetHeaders,
  res: NextApiResponse,
  override?: { status?: number }
) {
  const s3 = new S3Client({});
  const cmd = new HeadObjectCommand({
    Bucket: assetBucket,
    Key: query.assetId,
    // Range: headers.Range,
    // IfModifiedSince: headers["If-Modified-Since"],
    // IfNoneMatch: headers["If-None-Match"],
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
) {
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
      return headAsset(query, headers, res, { status: 304 });
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
