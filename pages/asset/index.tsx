import axios from "axios";
import { AssetTable } from "component/AssetTable";
import { Loading } from "component/atom/Loading";
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

export default function Asset(): React.ReactNode {
  const [spaceId, _] = useSpaceId<string>();
  const { data, error } = useSWR(["/api/v1/asset/data", spaceId], fetcher);

  if (error) {
    return <div>{JSON.stringify(error)}</div>;
  }
  if (!data) {
    return <Loading large />;
  }

  return <AssetTable assets={data} />;
}
