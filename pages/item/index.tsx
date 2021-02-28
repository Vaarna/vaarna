import axios from "axios";
import { useContext } from "react";
import { Context } from "store";
import useSWR from "swr";
import { ZodError, ZodErrorMap } from "zod";

import ItemList from "component/ItemList";
import SpaceSelector from "component/SpaceSelector";
import { Items } from "type/item";

async function fetcher(url: string, spaceId: string): Promise<Items> {
  try {
    const { data } = await axios({ url: url, params: { spaceId } });
    return Items.parse(data.data);
  } catch {
    return [];
  }
}

export default function ItemsC() {
  const [state, _] = useContext(Context);
  const { data, error, revalidate } = useSWR(
    ["/api/v1/item", state.spaceId],
    fetcher
  );

  if (error) {
    console.log(error);
    throw error;
  }

  return (
    <>
      <SpaceSelector />
      <button
        onClick={(ev) => {
          axios({
            url: "/api/v1/item/note",
            method: "POST",
            data: { spaceId: state.spaceId, path: "", public: "", private: "" },
          }).then(revalidate);
        }}
      >
        New Note
      </button>
      <h1>spaceId = {state.spaceId ?? ""}</h1>

      {data ? <ItemList items={data} /> : <div>loading...</div>}
    </>
  );
}
