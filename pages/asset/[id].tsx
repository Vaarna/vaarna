import axios from "axios";
import { AssetDetailed } from "component/AssetDetailed";
import { Loading } from "component/atom/Loading";
import { useRouter } from "next/router";
import { useSpaceId } from "store";
import useSWR from "swr";
import { AssetData, AssetDatas } from "type/assetData";
import { z } from "zod";

async function fetcher(
  url: string,
  spaceId: unknown,
  assetId: unknown
): Promise<AssetData> {
  const params = z
    .object({ spaceId: z.string(), assetId: z.string() })
    .parse({ spaceId, assetId });

  const { data } = await axios({ url, params });

  const parsed = AssetDatas.parse(data.data);

  if (parsed.length !== 1) {
    throw new Error("API returned incorrect number of items");
  }

  return parsed[0];
}

export default function Asset(): React.ReactNode {
  const router = useRouter();
  const { id } = router.query;

  const [spaceId, _] = useSpaceId<string>();
  const { data, error } = useSWR(
    () =>
      spaceId === undefined || id === undefined || Array.isArray(id)
        ? null
        : ["/api/v1/asset/data", spaceId, id],
    fetcher
  );

  if (error) {
    return <div>{JSON.stringify(error)}</div>;
  }
  if (!data) {
    return <Loading large />;
  }

  return <AssetDetailed asset={data} />;
}
