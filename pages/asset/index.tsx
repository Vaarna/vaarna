import axios from "axios";
import { useSpaceId } from "store";
import useSWR from "swr";

import { AssetDatas } from "type/assetData";

async function fetcher(url: string, spaceId: string): Promise<AssetDatas> {
  try {
    const { data } = await axios({ url: url, params: { spaceId } });
    return AssetDatas.parse(data.data).sort((a, b) =>
      a.filename.localeCompare(b.filename)
    );
  } catch {
    return [];
  }
}

export default function ItemsC() {
  const [spaceId, _] = useSpaceId<string>();
  const { data, error, revalidate } = useSWR(
    ["/api/v1/asset/data", spaceId],
    fetcher
  );

  if (error) {
    return <div>{JSON.stringify(error)}</div>;
  }

  return (
    <>
      {data ? (
        data.map((v) => (
          <div>
            <h2>{v.filename}</h2>
            <ul>
              <li>SpaceID: {v.spaceId}</li>
              <li>AssetID: {v.assetId}</li>
              <li>Content Type: {v.contentType}</li>
              <li>Kind: {v.kind}</li>
              <li>Size: {v.size}</li>
            </ul>
            {v.kind === "image" ? (
              <img
                src={`/api/v1/asset?spaceId=${v.spaceId}&assetId=${v.assetId}`}
                style={{ maxWidth: "20rem" }}
              />
            ) : v.kind === "video" ? (
              <video style={{ maxWidth: "20rem" }} controls>
                <source
                  src={`/api/v1/asset?spaceId=${v.spaceId}&assetId=${v.assetId}`}
                />
              </video>
            ) : v.kind === "audio" ? (
              <audio style={{ maxWidth: "20rem" }} controls>
                <source
                  src={`/api/v1/asset?spaceId=${v.spaceId}&assetId=${v.assetId}`}
                />
              </audio>
            ) : undefined}
          </div>
        ))
      ) : (
        <div>loading...</div>
      )}
    </>
  );
}
