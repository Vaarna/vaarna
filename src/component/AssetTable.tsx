import Link from "next/link";
import { AssetData, AssetDatas } from "type/assetData";
import bytes from "bytes";
import axios from "axios";
import { useSpaceId } from "store";

type RowProps = { spaceId: string | undefined; asset: AssetData };

const Row: React.FC<RowProps> = ({ spaceId, asset }: RowProps) => (
  <tr>
    <td>
      <button
        disabled={!spaceId}
        onClick={() => {
          if (!spaceId) return;

          axios
            .post("/api/v1/table", { spaceId, assetId: asset.assetId })
            .then(() => {
              console.log(`succesfully changed table to ${asset.assetId}`);
            })
            .catch((err) => {
              console.error(err);
            });
        }}
      >
        Show
      </button>
    </td>
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

export type AssetTableProps = { assets: AssetDatas };

export const AssetTable: React.FC<AssetTableProps> = ({
  assets,
}: AssetTableProps) => {
  const [spaceId, _] = useSpaceId<string>();

  return (
    <div className="simple-table">
      <table>
        <thead>
          <tr>
            <th>Show</th>
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
            <Row key={asset.assetId} spaceId={spaceId} asset={asset} />
          ))}
        </tbody>
      </table>
    </div>
  );
};
