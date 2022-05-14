import { AssetData } from "type/space";

export function getKind(contentType: string): AssetData["kind"] {
  switch (contentType) {
    case "application/pdf":
      return "pdf";
  }

  const split = contentType.split("/");

  if (split.length !== 2) return "other";

  const [lhs, _rhs] = split;

  switch (lhs) {
    case "audio":
    case "video":
    case "image":
      return lhs;
  }

  return "other";
}
