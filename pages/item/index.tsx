import axios from "axios";
import { useSpaceId } from "store";
import useSWR from "swr";

import { ItemTable } from "component/ItemTable";
import { Items } from "type/item";
import { useRouter } from "next/router";
import { Loading } from "component/atom/Loading";

async function fetcher(url: string, spaceId: string): Promise<Items> {
  try {
    const { data } = await axios({ url, params: { spaceId } });
    return Items.parse(data.data).sort((a, b) => a.path.localeCompare(b.path));
  } catch {
    return [];
  }
}

export default function ItemsC(): React.ReactNode {
  const [spaceId, _] = useSpaceId();
  const { data, error, revalidate } = useSWR(["/api/item", spaceId], fetcher);
  const router = useRouter();

  if (error) {
    return <div>{JSON.stringify(error)}</div>;
  }
  if (data === undefined) {
    return <Loading large />;
  }

  return (
    <>
      <div className="block p-1">
        <button
          className="button"
          onClick={() => {
            axios({
              url: "/api/item",
              method: "POST",
              data: { spaceId, type: "note", path: "", public: "", private: "" },
            })
              .then(({ data: { data } }) => router.push(`/item/${data.itemId}`))
              .then(() => revalidate());
          }}
        >
          New Note
        </button>
      </div>
      <div className="block">
        <ItemTable items={data} />
      </div>
    </>
  );
}
