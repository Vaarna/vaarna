import axios, { AxiosInstance } from "axios";

export type FrontendOptions = Partial<{
  signal: AbortSignal;
  requestId: string;
}>;

const headers = (o?: FrontendOptions): Record<string, string> =>
  Object.fromEntries(
    [["X-Request-Id", o?.requestId]].filter((v) => v[1] !== undefined)
  );

export const fetchBase = (o?: FrontendOptions): AxiosInstance =>
  axios.create({
    headers: headers(o),
    signal: o?.signal,
  });
