export const S3_ENDPOINT = process.env.S3_ENDPOINT ?? "##UNSET##";
export const S3_FORCE_PATH_STYLE = (process.env.S3_FORCE_PATH_STYLE ?? "0") !== "0";

export const DYNAMODB_ENDPOINT = process.env.DYNAMODB_ENDPOINT ?? "##UNSET##";

export const ASSET_BUCKET = process.env.ASSET_BUCKET ?? "##UNSET##";
export const TABLE_NAME = process.env.TABLE_NAME ?? "##UNSET##";
