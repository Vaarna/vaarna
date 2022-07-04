const envGet = (name: string, def?: string): string => {
  const out = process.env[name];
  if (out === undefined) {
    if (def === undefined) return "##UNSET##";
    return def;
  }

  return out;
};

const envGetBool = (name: string, def: boolean): boolean => {
  const out = process.env[name];
  if (out === undefined) {
    return def;
  }

  const trimmed = out.trim();
  return trimmed !== "" && trimmed !== "0" && trimmed.toLowerCase() !== "false";
};

const config = {
  S3_ENDPOINT: process.env.S3_ENDPOINT,
  S3_FORCE_PATH_STYLE: envGetBool("S3_FORCE_PATH_STYLE", false),
  DYNAMODB_ENDPOINT: process.env.DYNAMODB_ENDPOINT,

  ASSET_BUCKET: envGet("ASSET_BUCKET"),
  TABLE_NAME: envGet("TABLE_NAME"),
};

export default config;
