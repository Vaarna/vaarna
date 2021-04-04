import axios from "axios";
import { useRouter } from "next/router";
import { z } from "zod";

import { Item, Items } from "type/item";
import { useSpaceId } from "store";
import { useItem } from "hook/useItem";
import { ItemEditor } from "component/ItemEditor";

async function fetcher(
  url: string,
  spaceId: unknown,
  itemId: unknown
): Promise<Item> {
  const params = z
    .object({ spaceId: z.string(), itemId: z.string() })
    .parse({ spaceId, itemId });

  const { data } = await axios({ url, params });

  const parsed = Items.parse(data.data);
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

  const { item, setItem, error, inflight, loading, save, dirty } = useItem(
    spaceId ?? "",
    id as string
  );

  if (error) {
    return <div>{JSON.stringify(error)}</div>;
  }
  if (loading) {
    return <div>loading...</div>;
  }
  if (item === undefined) {
    return <div>no item was returned when one was expected</div>;
  }

  return (
    <ItemEditor
      item={item}
      setItem={setItem}
      inflight={inflight}
      save={save}
      loading={loading}
      dirty={dirty}
    />
  );
}
