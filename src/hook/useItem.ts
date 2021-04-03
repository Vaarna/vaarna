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
  console.log(parsed);

  if (parsed.length !== 1) {
    throw "API returned incorrect number of items";
  }

  return parsed[0];
}

export const useItem = (spaceId: string, itemId: string) => {
  const [item, setItem] = useState<Item | undefined>(undefined);
  const [parseError, setParseError] = useState<z.ZodError | undefined>(
    undefined
  );
  const [inflight, setInflight] = useState(false);
  const { data, error, revalidate, mutate } = useSWR(
    ["/api/v1/item", spaceId, itemId],
    fetcher
  );

  useEffect(() => {
    if (error) {
      setItem(undefined);
      return;
    }

    const parsed = Item.safeParse(data);
    if (parsed.success) {
      setItem(parsed.data);
      setParseError(undefined);
    } else {
      setItem(undefined);
      setParseError(parsed.error);
    }
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
        if (item.success) setItem(item.data);
        else throw item.error;
      })
      .then(revalidate)
      .then(() => {})
      .catch(console.error)
      .finally(() => setInflight(false));
  };

  return {
    loading: !error && !item,
    error: error ?? parseError,
    item: item,
    setItem,
    inflight,
    save,
  };
};
