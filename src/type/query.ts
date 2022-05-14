import { z } from "zod";

export const QueryParameterString = z.union([
  z.array(z.string()),
  z.string(),
  z.undefined().transform((_v) => null),
]);
export type QueryParameterString = z.infer<typeof QueryParameterString>;

export const QueryParameterStringUuid = z.union([
  z.array(z.string().uuid()),
  z.string().uuid(),
  z.undefined().transform((_v) => null),
]);
export type QueryParameterStringUuid = z.infer<typeof QueryParameterStringUuid>;
