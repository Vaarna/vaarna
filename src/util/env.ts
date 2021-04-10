export const envGet = (name: string, def?: string): string => {
  const out = process.env[name];
  if (out === undefined) {
    if (def !== undefined) return def;

    throw new Error(
      `environment variable ${name} is not defined and no default was given`
    );
  }

  return out;
};

export const envGetBool = (name: string, def?: boolean): boolean => {
  const out = process.env[name];
  if (out === undefined) {
    if (def !== undefined) return def;

    throw new Error(
      `environment variable ${name} is not defined and no default was given`
    );
  }

  const trimmed = out.trim();
  return trimmed !== "" && trimmed !== "0" && trimmed.toLowerCase() !== "false";
};
