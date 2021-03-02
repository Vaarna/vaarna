import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import * as t from "zod";
import useSWR from "swr";

import { Item, ItemNote, Items } from "type/item";
import { useSpaceId } from "store";

async function fetcher(
  url: string,
  spaceId: unknown,
  itemId: unknown
): Promise<Item> {
  const params = t
    .object({ spaceId: t.string(), itemId: t.string() })
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

  const [spaceId, _] = useSpaceId();
  const [note, setNote] = useState<ItemNote | undefined>(undefined);
  const [inflight, setInflight] = useState(false);
  const { data, error, revalidate } = useSWR(
    ["/api/v1/item", spaceId, id],
    fetcher
  );

  useEffect(() => {
    const note = ItemNote.safeParse(data);
    if (note.success) setNote(note.data);
  }, [data]);

  const save = () => {
    setInflight(true);

    return axios({
      method: "PUT",
      url: "/api/v1/item",
      data: note,
    })
      .then(({ data }) => {
        const item = ItemNote.safeParse(data.data);
        if (item.success) setNote(item.data);
        else throw item.error;
      })
      .then(revalidate)
      .catch(console.error)
      .finally(() => setInflight(false));
  };

  if (error) {
    return <div>{JSON.stringify(error)}</div>;
  }
  if (!data) {
    return <div>loading...</div>;
  }

  if (!note)
    return (
      <>
        <h1>{data.path}</h1>
        <ul>
          <li>Space ID: {data.spaceId}</li>
          <li>Item ID: {data.itemId}</li>
          <li>Created: {data.created}</li>
          <li>Updated: {data.updated}</li>
          <li>Type: {data.type}</li>
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
            value={note.path}
            onChange={(ev) => setNote({ ...note, path: ev.target.value })}
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
              fontFamily: "monospace",
            }}
            value={note.public}
            onChange={(ev) => setNote({ ...note, public: ev.target.value })}
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
              fontFamily: "monospace",
            }}
            value={note.private}
            onChange={(ev) => setNote({ ...note, private: ev.target.value })}
          />
        </label>

        <input type="submit" disabled={inflight} value="Save" />
      </form>
      <br />
    </>
  );
}
