import { IncomingMessage } from "http";
import { Form } from "multiparty";
import * as t from "zod";

const File = t
  .array(
    t.object({
      fieldName: t.string(),
      originalFilename: t.string(),
      path: t.string(),
      size: t.number().int(),
      headers: t.object({
        "content-disposition": t.string(),
        "content-type": t.string(),
      }),
    })
  )
  .refine(
    (v) => v.length === 1,
    "multiparty did not return exactly one file for every file field"
  )
  .transform((v) => v[0]);

export const ParsedMultipartBody = t.object({
  fields: t.record(t.any()),
  files: t.record(File),
});
export type ParsedMultipartBody = t.infer<typeof ParsedMultipartBody>;

export function parseMultipartBody(
  body: IncomingMessage
): Promise<ParsedMultipartBody> {
  return new Promise((resolve, reject) => {
    const form = new Form();
    form.parse(body, (error, fields, files) => {
      if (error) {
        return reject(error);
      }

      const out = ParsedMultipartBody.safeParse({ fields, files });
      if (!out.success) reject(out.error);
      else resolve(out.data);
    });
  });
}
