import axios from "axios";
import { AssetTable } from "component/AssetTable";
import { Loading } from "component/atom/Loading";
import { UploadContext } from "context/UploadProgress";
import { useContext } from "react";
import { useSpaceId } from "store";
import useSWR from "swr";

import { AssetDatas } from "type/assetData";

async function fetcher(url: string, spaceId: string): Promise<AssetDatas> {
  try {
    const { data } = await axios({ url, params: { spaceId } });
    return AssetDatas.parse(data.data).sort((a, b) =>
      a.filename.localeCompare(b.filename)
    );
  } catch {
    return [];
  }
}

export default function Asset(): React.ReactNode {
  const [spaceId, _] = useSpaceId();
  const { data, error } = useSWR(
    () => (!spaceId ? null : ["/api/asset/data", spaceId]),
    fetcher
  );
  const uploads = useContext(UploadContext);

  if (error) {
    return <div>{JSON.stringify(error)}</div>;
  }
  if (!data) {
    return <Loading large />;
  }

  return <AssetTable assets={data} uploads={uploads} />;
}
