import axios from "axios";
import { AssetDetailed } from "component/AssetDetailed";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
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
  console.log(parsed);

  if (parsed.length !== 1) {
    throw "API returned incorrect number of items";
  }

  return parsed[0];
}

export default function ItemC() {
  const router = useRouter();
  const { id } = router.query;

  const [spaceId, _] = useSpaceId<string>();
  const [asset, setAsset] = useState<AssetData | undefined>(undefined);
  const { data, error } = useSWR(["/api/v1/asset/data", spaceId, id], fetcher);

  useEffect(() => {
    const note = AssetData.safeParse(data);
    if (note.success) setAsset(note.data);
  }, [data]);

  if (error) {
    return <div>{JSON.stringify(error)}</div>;
  }

  return asset === undefined ? (
    <div>loading...</div>
  ) : (
    <AssetDetailed asset={asset} />
  );
}
