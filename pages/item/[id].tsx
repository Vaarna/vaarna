import axios from "axios";
import { useRouter } from "next/router";
import { useContext } from "react";
import { Context } from "store";
import * as t from "zod";
import useSWR from "swr";

import SpaceSelector from "component/SpaceSelector";
import { Item, Items } from "type/item";

async function fetcher(
  url: string,
  spaceId: string,
  itemId: string
): Promise<Item> {
  const { data } = await axios({ url, params: { spaceId, itemId } });
  const parsed = Items.parse(data.data);
  if (parsed.length !== 1) {
    throw "item does not exist";
  }

  return parsed[0];
}

const useItem = (
  spaceId: string | undefined,
  id: string | string[] | undefined
) => {
  const parsed = t
    .object({ spaceId: t.string(), id: t.string() })
    .parse({ spaceId, id });

  return useSWR(["/api/v1/item", parsed.spaceId, parsed.id], fetcher);
};

export default function ItemC() {
  const [state, _] = useContext(Context);

  const router = useRouter();
  const { id } = router.query;

  const { data, error } = useItem(state.spaceId, id);

  if (error) return <h1>error</h1>;
  if (!data) return <h1>loading...</h1>;

  return (
    <>
      <SpaceSelector />
      <h1>
        {data.path} ({data.spaceId} - {id})
      </h1>
      <ul>
        <li>Created: {data.created}</li>
        <li>Updated: {data.updated}</li>
        <li>Type: {data.type}</li>
      </ul>
    </>
  );
}
