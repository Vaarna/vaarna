import axios from "axios";
import { useSpaceId } from "store";
import useSWR from "swr";

import ItemList from "component/ItemList";
import SpaceSelector from "component/SpaceSelector";
import { Items } from "type/item";
import { useRouter } from "next/router";

async function fetcher(url: string, spaceId: string): Promise<Items> {
  try {
    const { data } = await axios({ url: url, params: { spaceId } });
    return Items.parse(data.data).sort((a, b) => a.path.localeCompare(b.path));
  } catch {
    return [];
  }
}

export default function ItemsC() {
  const [spaceId, _] = useSpaceId();
  const { data, error, revalidate } = useSWR(
    ["/api/v1/item", spaceId],
    fetcher
  );
  const router = useRouter();

  if (error) {
    return <div>{JSON.stringify(error)}</div>;
  }

  return (
    <>
      <SpaceSelector />
      <button
        onClick={(ev) => {
          axios({
            url: "/api/v1/item",
            method: "POST",
            data: { spaceId, type: "note", path: "", public: "", private: "" },
          })
            .then(({ data: { data } }) => router.push(`/item/${data.itemId}`))
            .then(() => revalidate());
        }}
      >
        New Note
      </button>
      <h1>spaceId = {spaceId ?? ""}</h1>

      {data ? <ItemList items={data} /> : <div>loading...</div>}
    </>
  );
}
