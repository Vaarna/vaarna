import { AssetData } from "type/assetData";

export type AssetDetailedProps = { asset: AssetData };

export const AssetDetailed: React.FC<AssetDetailedProps> = ({
  asset,
}: AssetDetailedProps) => {
  const src = `/api/v1/asset?spaceId=${asset.spaceId}&assetId=${asset.assetId}`;

  return (
    <div>
      <h2>{asset.filename}</h2>
      <ul>
        <li>SpaceID: {asset.spaceId}</li>
        <li>AssetID: {asset.assetId}</li>
        <li>Content Type: {asset.contentType}</li>
        <li>Kind: {asset.kind}</li>
        <li>Size: {asset.size}</li>
      </ul>
      {asset.kind === "image" ? (
        <img src={src} style={{ maxWidth: "20rem" }} />
      ) : asset.kind === "video" ? (
        <video style={{ maxWidth: "20rem" }} controls>
          <source src={src} />
        </video>
      ) : asset.kind === "audio" ? (
        <audio style={{ maxWidth: "20rem" }} controls>
          <source src={src} />
        </audio>
      ) : undefined}
    </div>
  );
};
