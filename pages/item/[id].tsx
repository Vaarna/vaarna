import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { z } from "zod";
import useSWR from "swr";

import { Item, ItemNote, Items } from "type/item";
import { useSpaceId } from "store";
import { useItem } from "hook/useItem";

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

  const { item, setItem, error, inflight, loading, save } = useItem(
    spaceId ?? "",
    id as string
  );

  if (error) {
    return <div>{JSON.stringify(error)}</div>;
  }
  if (loading) {
    return <div>loading...</div>;
  }

  if (item?.type !== "note")
    return (
      <>
        <h1>{item?.path}</h1>
        <ul>
          <li>Space ID: {item?.spaceId}</li>
          <li>Item ID: {item?.itemId}</li>
          <li>Created: {item?.created}</li>
          <li>Updated: {item?.updated}</li>
          <li>Type: {item?.type}</li>
        </ul>
      </>
    );

  return (
    <>
      <form
        onSubmit={(ev) => {
          ev.preventDefault();
          save();
        }}
      >
        <label>
          Path
          <input
            name="path"
            value={item.path}
            onChange={(ev) => setItem({ ...item, path: ev.target.value })}
          />
        </label>

        <label>
          Public
          <textarea
            name="public"
            style={{
              minWidth: "100%",
              minHeight: "40ex",
              boxSizing: "border-box",
            }}
            value={item.public}
            onChange={(ev) => setItem({ ...item, public: ev.target.value })}
          />
        </label>

        <label>
          Private
          <textarea
            name="private"
            style={{
              minWidth: "100%",
              minHeight: "40ex",
              boxSizing: "border-box",
            }}
            value={item.private}
            onChange={(ev) => setItem({ ...item, private: ev.target.value })}
          />
        </label>

        <input type="submit" disabled={inflight} value="Save" />
      </form>
      <br />
    </>
  );
}
