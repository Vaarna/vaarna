import axios from "axios";
import { CreateSheet, Sheet, Space } from "type/sheet";

type Options = {
  signal?: AbortSignal;
  requestId?: string;
};

const a = axios.create({
  baseURL: "/api",
});

const headers = (o?: Options) =>
  Object.fromEntries(
    [["X-Request-Id", o?.requestId]].filter((v) => v[1] !== undefined)
  );

export const createSheet = async (
  { spaceId, sheet }: { spaceId: Space["spaceId"]; sheet: CreateSheet },
  o?: Options
): Promise<Sheet> => {
  const res = await a.post("/space/sheet", sheet, {
    params: { spaceId },
    headers: headers(o),
    signal: o?.signal,
  });

  return Sheet.parse(res.data.sheet);
};
