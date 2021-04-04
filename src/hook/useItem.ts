import axios from "axios";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { Item, Items } from "type/item";
import { z } from "zod";

async function fetcher(
  url: string,
  spaceId: string,
  itemId: string
): Promise<Item> {
  const { data } = await axios({ url, params: { spaceId, itemId } });

  const parsed = Items.parse(data.data);

  if (parsed.length !== 1) {
    throw "API returned incorrect number of items";
  }

  return parsed[0];
}

export const useItem = (spaceId: string, itemId: string) => {
  const [inflight, setInflight] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [item, setItem] = useState<Item | undefined>(undefined);
  const { data, error, mutate } = useSWR(
    ["/api/v1/item", spaceId, itemId],
    fetcher
  );

  useEffect(() => {
    if (!error && !dirty) setItem(data);
  }, [data, error]);

  const save = () => {
    setInflight(true);

    return axios({
      method: "PUT",
      url: "/api/v1/item",
      data: item,
    })
      .then(({ data }) => {
        const item = Item.safeParse(data.data);
        if (!item.success) throw item.error;

        setItem(item.data);
        setDirty(false);
        return mutate(item.data, false);
      })
      .then(() => {})
      .catch(console.error)
      .finally(() => setInflight(false));
  };

  return {
    loading: !error && !item,
    error: error,
    item: item,
    setItem: (item: Item) => {
      setItem(item);
      setDirty(true);
    },
    dirty,
    inflight,
    save,
  };
};
