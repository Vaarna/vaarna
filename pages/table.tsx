import axios from "axios";
import { Loading } from "component/atom/Loading";
import { useState } from "react";
import { useSpaceId } from "store";
import useSWR from "swr";
import { AssetData, AssetDatas } from "type/assetData";
import { Table, UpdateTableEvent } from "type/table";

async function tableFetcher(url: string, spaceId: string): Promise<Table> {
  const res = await axios(url, { params: { spaceId } });
  return Table.parse(res.data?.table);
}

async function assetFetcher(
  url: string,
  spaceId: string,
  assetId: string
): Promise<AssetData> {
  const res = await axios(url, { params: { spaceId, assetId } });
  const datas = AssetDatas.parse(res.data?.data);
  if (datas.length !== 1) throw new Error("wrong number of assets returned");

  return datas[0];
}

export default function TablePage(): React.ReactNode {
  const [spaceId, _] = useSpaceId<string>();
  const table = useSWR(
    () => (!spaceId ? null : ["/api/v1/table", spaceId]),
    tableFetcher,
    { refreshInterval: 3000 }
  );
  const asset = useSWR(
    () =>
      !spaceId || !table.data
        ? null
        : ["/api/v1/asset/data", spaceId, table.data.assetId],
    assetFetcher
  );

  const [msg, setMsg] = useState("");
  const [expr, setExpr] = useState("");

  if (table.error || asset.error) {
    return (
      <pre>
        {JSON.stringify({ table: table.error, asset: asset.error }, null, "  ")}
      </pre>
    );
  }
  if (!asset.data) {
    return <Loading large />;
  }

  const assetData = asset.data;
  const src = `/api/v1/asset?spaceId=${spaceId}&assetId=${assetData.assetId}`;

  const innerStyle = {
    maxWidth: "100%",
  };

  let el: React.ReactElement;
  switch (assetData.kind) {
    case "image":
      el = <img style={innerStyle} src={src} />;
      break;

    case "video":
      el = (
        <video style={innerStyle} autoPlay loop>
          <source src={src} />
        </video>
      );
      break;

    case "audio":
      el = (
        <audio style={innerStyle} autoPlay loop>
          <source src={src} />
        </audio>
      );
      break;

    case "pdf":
      el = <div>PDFs are not yet supported.</div>;
      break;

    default:
      el = <div>Other files can not be displayed at the moment.</div>;
      break;
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {el}
      </div>
      <div>
        <input
          value={msg}
          onChange={(ev) => {
            setMsg(ev.target.value);
          }}
        />
        <button
          onClick={() => {
            if (spaceId === undefined) return;

            const data: UpdateTableEvent = {
              spaceId,
              type: "NEW_MESSAGE",
              content: msg,
            };

            setMsg("");
            axios
              .patch("/api/v1/table", data)
              .then((resp) => resp.data)
              .then((data) => {
                table.mutate(Table.parse(data?.table));
                console.log("PATCH table returned", data);
              })
              .catch((err) => {
                console.error("PATCH table failed", err);
              });
          }}
        >
          Send Message
        </button>
      </div>
      <div>
        <input
          value={expr}
          onChange={(ev) => {
            setExpr(ev.target.value);
          }}
        />
        <button
          onClick={() => {
            if (spaceId === undefined) return;

            const data: UpdateTableEvent = {
              spaceId,
              type: "EVAL",
              expr,
            };

            axios
              .patch("/api/v1/table", data)
              .then((resp) => resp.data)
              .then((data) => {
                table.mutate(Table.parse(data?.table));
                console.log("PATCH table returned", data);
              })
              .catch((err) => {
                console.error("PATCH table failed", err);
              });
          }}
        >
          Roll
        </button>
      </div>
      <ul>
        {table.data?.messages.map((msg) => (
          <li key={msg.id}>
            {msg.t}: {msg.msg}
          </li>
        ))}
      </ul>
    </>
  );
}
