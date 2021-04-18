import Link from "next/link";
import { AssetData, AssetDatas } from "type/assetData";
import bytes from "bytes";
import axios from "axios";
import { useSpaceId } from "store";
import { rootLogger } from "logger";
import { UploadProgress } from "context/UploadProgress";
import { AssetService } from "service/asset";
import { round } from "util/round";

type RowProps = { spaceId: string | undefined; asset: AssetData };

const Row: React.FC<RowProps> = ({ spaceId, asset }: RowProps) => (
  <tr>
    <td>
      <button
        disabled={!spaceId}
        onClick={() => {
          if (!spaceId) return;

          axios
            .post("/api/v1/table", { spaceId, assetId: asset.assetId, messages: [] })
            .then(() => {
              rootLogger.info(asset, `succesfully changed table to ${asset.assetId}`);
            })
            .catch((err) => {
              rootLogger.error(err, "failed to modify table");
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

type RowUploadProps = { spaceId: string | undefined; upload: UploadProgress };

const RowUpload: React.FC<RowUploadProps> = ({
  spaceId,
  upload: { loaded, total, done, filename, contentType, size },
}: RowUploadProps) => (
  <tr>
    <td>
      <button disabled>Show</button>
    </td>
    <td>{spaceId}</td>
    <td>
      {done ? (
        "File uploaded."
      ) : loaded >= total ? (
        "Server is processing file."
      ) : (
        <>
          {round((loaded / total) * 100, 2)}% {bytes(loaded)} / {bytes(total)}
        </>
      )}
    </td>
    <td>{filename}</td>
    <td>{AssetService.getKind(contentType)}</td>
    <td style={{ textAlign: "right" }}>{bytes(size)}</td>
    <td>{contentType}</td>
  </tr>
);

export type AssetTableProps = { assets: AssetDatas; uploads: UploadProgress[] };

export const AssetTable: React.FC<AssetTableProps> = ({
  assets,
  uploads,
}: AssetTableProps) => {
  const [spaceId, _] = useSpaceId<string>();

  type Data =
    | { type: "asset"; data: AssetData }
    | { type: "upload"; data: UploadProgress };

  const data: Data[] = [
    ...assets.map(
      (data) =>
        ({
          type: "asset",
          data,
        } as Data)
    ),
    ...uploads.map(
      (data) =>
        ({
          type: "upload",
          data,
        } as Data)
    ),
  ];
  data.sort((a, b) => a.data.filename.localeCompare(b.data.filename));

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
          {data.map((v) =>
            v.type === "asset" ? (
              <Row key={v.data.assetId} spaceId={spaceId} asset={v.data} />
            ) : (
              <RowUpload key={v.data.id} spaceId={spaceId} upload={v.data} />
            )
          )}
        </tbody>
      </table>
    </div>
  );
};
