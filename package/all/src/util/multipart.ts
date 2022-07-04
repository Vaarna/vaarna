import { IncomingMessage } from "http";
import { Form } from "multiparty";
import { z } from "zod";

const File = z
  .array(
    z.object({
      fieldName: z.string(),
      originalFilename: z.string(),
      path: z.string(),
      size: z.number().int(),
      headers: z.object({
        "content-disposition": z.string(),
        "content-type": z.string(),
      }),
    })
  )
  .refine(
    (v) => v.length === 1,
    "multiparty did not return exactly one file for every file field"
  )
  .transform((v) => v[0]);

export const ParsedMultipartBody = z.object({
  fields: z.record(z.any()),
  files: z.record(File),
});
export type ParsedMultipartBody = z.infer<typeof ParsedMultipartBody>;

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
