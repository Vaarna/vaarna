import { reverse } from "lodash";

export const sortBy = <T extends Record<string, unknown>>(
  vs: T[],
  ks: (string | { key: string; numeric: boolean })[]
): T[] => {
  const out = [...vs];

  for (const k of reverse(ks)) {
    const key = typeof k === "string" ? k : k.key;
    const opts = { numeric: false };
    if (typeof k !== "string") {
      opts.numeric = k.numeric;
    }

    out.sort((a, b) => {
      const av = a[key];
      const bv = b[key];

      if (
        (typeof av === "number" || typeof av === "bigint") &&
        (typeof bv === "number" || typeof bv === "bigint")
      ) {
        if (av < bv) return -1;
        if (av > bv) return 1;
        return 0;
      }

      if (typeof av !== "string") return 0;
      if (typeof bv !== "string") return 0;

      return av.localeCompare(bv, undefined, opts);
    });
  }

  return out;
};
