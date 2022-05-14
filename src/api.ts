import axios from "axios";
import { CreateSheet, CreateSpace, Sheet, Space } from "type/space";

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

const createSpace = async (sheet: CreateSpace, o?: Options): Promise<Space> => {
  const res = await a.post("/space", sheet, {
    headers: headers(o),
    signal: o?.signal,
  });

  return Space.parse(res.data);
};

const createSheet = async (
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

const defaults = {
  createSpace,
  createSheet,
};

export default defaults;
