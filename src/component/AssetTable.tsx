import Link from "next/link";
import { AssetData, AssetDatas } from "type/assetData";
import bytes from "bytes";

const Row: React.FC<{ asset: AssetData }> = ({ asset }) => (
  <tr>
    <td>{asset.spaceId}</td>
    <td>
      <Link href={`/asset/${asset.assetId}`}>{asset.assetId}</Link>
    </td>
    <td>{asset.filename}</td>
    <td>{asset.kind}</td>
    <td style={{ textAlign: "right" }}>{bytes(asset.size)}</td>
    <td>{asset.contentType}</td>
  </tr>
);

export const AssetTable: React.FC<{ assets: AssetDatas }> = ({ assets }) => {
  return (
    <div className="simple-table">
      <table>
        <thead>
          <tr>
            <th>SpaceID</th>
            <th>AssetID</th>
            <th>Filename</th>
            <th>Kind</th>
            <th>Size</th>
            <th>Content Type</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <Row key={asset.assetId} asset={asset} />
          ))}
        </tbody>
      </table>
    </div>
  );
};