import axios from "axios";
import { AssetDetailed } from "component/AssetDetailed";
import { AssetTable } from "component/AssetTable";
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

export default function Asset() {
  const [spaceId, _] = useSpaceId<string>();
  const { data, error, revalidate } = useSWR(
    ["/api/v1/asset/data", spaceId],
    fetcher
  );

  if (error) {
    return <div>{JSON.stringify(error)}</div>;
  }

  return data ? <AssetTable assets={data} /> : <div>loading...</div>;
}
