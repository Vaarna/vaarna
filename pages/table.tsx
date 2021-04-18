import axios from "axios";
import { Loading } from "component/atom/Loading";
import { useRef, useState } from "react";
import { useSpaceId } from "store";
import useSWR from "swr";
import { AssetData, AssetDatas } from "type/assetData";
import { LogEvent, LogItems } from "type/log";
import { Table } from "type/table";
import { sortBy } from "lodash";
import { formatDistanceToNowStrict } from "date-fns";
import s from "./table.module.css";

type FormProps = {
  spaceId: string | undefined;
  revalidate: () => Promise<boolean>;
};

const MessageForm: React.FC<FormProps> = ({ spaceId, revalidate }: FormProps) => {
  const [msg, setMsg] = useState("");

  return (
    <form className={s.messageForm} onSubmit={(ev) => ev.preventDefault()}>
      <input
        value={msg}
        onChange={(ev) => {
          setMsg(ev.target.value);
        }}
      />
      <button
        onClick={() => {
          if (spaceId === undefined) return;

          let data: LogEvent;
          if (msg.startsWith("/roll ")) {
            data = { spaceId, type: "ROLL", expr: msg.slice("/roll ".length) };
          } else {
            data = {
              spaceId,
              type: "MESSAGE",
              msg,
            };
          }

          setMsg("");
          axios
            .patch("/api/v1/log", data)
            .then((resp) => resp.data)
            .then(() => {
              return revalidate();
            });
        }}
      >
        Send
      </button>
    </form>
  );
};

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

async function logFetcher(url: string, spaceId: string): Promise<LogItems> {
  const resp = await axios(url, { params: { spaceId } });
  return LogItems.parse(resp.data?.data);
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
  const log = useSWR(() => (!spaceId ? null : ["/api/v1/log", spaceId]), logFetcher);
  const logMessages = useRef<HTMLDivElement>(null);

  if (table.error || asset.error || log.error) {
    return (
      <pre>
        {JSON.stringify(
          { table: table.error, asset: asset.error, log: log.error },
          null,
          "  "
        )}
      </pre>
    );
  }
  if (!asset.data) {
    return <Loading large />;
  }

  const assetData = asset.data;
  const src = `/api/v1/asset?spaceId=${spaceId}&assetId=${assetData.assetId}`;

  let el: React.ReactElement;
  switch (assetData.kind) {
    case "image":
      el = <img className={s.assetElement} src={src} />;
      break;

    case "video":
      el = (
        <video className={s.assetElement} autoPlay loop>
          <source src={src} />
        </video>
      );
      break;

    case "audio":
      el = (
        <audio className={s.assetElement} autoPlay loop>
          <source src={src} />
        </audio>
      );
      break;

    case "pdf":
      el = <div className={s.assetElement}>PDFs are not yet supported.</div>;
      break;

    default:
      el = (
        <div className={s.assetElement}>
          Other files can not be displayed at the moment.
        </div>
      );
      break;
  }

  return (
    <div className={s.container}>
      <div className={s.asset}>{el}</div>
      <div className={s.log}>
        <div ref={logMessages} className={s.messages}>
          {sortBy(log?.data, (v) => v.t).map((msg) => (
            <p key={msg.messageId}>
              {formatDistanceToNowStrict(new Date(msg.t), { addSuffix: true })}:{" "}
              {msg.msg}
            </p>
          ))}
        </div>

        <MessageForm
          spaceId={spaceId}
          revalidate={() => {
            const el = logMessages.current;
            if (el !== null) {
              el.scrollTo({ top: el.scrollHeight });
            }
            return log.revalidate();
          }}
        />
      </div>
    </div>
  );
}
