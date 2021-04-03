import Link from "next/link";
import { AssetData, AssetDatas } from "type/assetData";

const Row: React.FC<{ asset: AssetData }> = ({ asset }) => (
  <tr>
    <td>{asset.spaceId}</td>
    <td>
      <Link href={`/asset/${asset.assetId}`}>{asset.assetId}</Link>
    </td>
    <td>{asset.filename}</td>
    <td>{asset.kind}</td>
    <td>{asset.size}</td>
    <td>{asset.contentType}</td>
  </tr>
);

export const AssetTable: React.FC<{ assets: AssetDatas }> = ({ assets }) => {
  return (
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
          <Row asset={asset} />
        ))}
      </tbody>
    </table>
  );
};
