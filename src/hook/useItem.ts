import axios from "axios";
import { rootLogger } from "logger";
import { useDebugValue, useEffect, useState } from "react";
import useSWR from "swr";
import { Item, Items } from "type/item";

async function fetcher(
  url: string,
  spaceId: string,
  itemId: string
): Promise<Item | null> {
  const { data } = await axios({ url, params: { spaceId, itemId } });

  const parsed = Items.parse(data.data);

  if (parsed.length !== 1) {
    return null;
  }

  return parsed[0];
}

type Out = {
  loading: boolean;
  notFound: boolean;
  error: unknown;
  item: Item;
  setItem: (item: Item) => void;
  dirty: boolean;
  inflight: boolean;
  save: () => void;
};

export const useItem = (
  spaceId: string | undefined,
  itemId: string | undefined
): Out => {
  const [inflight, setInflight] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [item, setItem] = useState<Item | null | undefined>(undefined);
  const { data, error, mutate } = useSWR(
    () => (spaceId && itemId ? ["/api/item", spaceId, itemId] : null),
    fetcher
  );

  useDebugValue(`dirty: ${dirty}`);

  useEffect(() => {
    if (!error && !dirty) setItem(data);
  }, [data, error, dirty]);

  const save = () => {
    setInflight(true);

    return axios({
      method: "PUT",
      url: "/api/item",
      data: item,
    })
      .then(({ data }) => {
        const item = Item.safeParse(data.data);
        if (!item.success) throw item.error;

        setItem(item.data);
        setDirty(false);
        return mutate(item.data, false);
      })
      .then(() => {
        return;
      })
      .catch(rootLogger.error)
      .finally(() => setInflight(false));
  };

  return {
    loading: !error && item === undefined,
    notFound: item === null,
    error,
    item: item as Item,
    setItem: (item: Item) => {
      setItem(item);
      setDirty(true);
    },
    dirty,
    inflight,
    save,
  };
};
