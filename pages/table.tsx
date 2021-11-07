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
import classNames from "classnames";

type FormProps = {
  spaceId: string | undefined;
  revalidate: () => Promise<boolean>;
};

const MessageForm: React.FC<FormProps> = ({ spaceId, revalidate }: FormProps) => {
  const [msg, setMsg] = useState("");
  const onClick = () => {
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
      .patch("/api/log", data)
      .then((resp) => resp.data)
      .then(() => {
        return revalidate();
      });
  };

  return (
    <form onSubmit={(ev) => ev.preventDefault()}>
      <div className="field has-addons m-1">
        <div className="control" style={{ width: "100%" }}>
          <input
            className="input is-primary"
            value={msg}
            onChange={(ev) => {
              setMsg(ev.target.value);
            }}
          />
        </div>
        <div className="control">
          <button className="button is-submit" onClick={onClick}>
            Send
          </button>
        </div>
      </div>
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
    () => (!spaceId ? null : ["/api/table", spaceId]),
    tableFetcher,
    { refreshInterval: 3000 }
  );
  const asset = useSWR(
    () =>
      !spaceId || !table.data ? null : ["/api/asset/data", spaceId, table.data.assetId],
    assetFetcher
  );
  const log = useSWR(() => (!spaceId ? null : ["/api/log", spaceId]), logFetcher, {
    refreshInterval: 3000,
  });
  const logMessages = useRef<HTMLDivElement>(null);

  if (table.error || asset.error || log.error) {
    return (
      <code>
        {JSON.stringify(
          { table: table.error, asset: asset.error, log: log.error },
          null,
          "  "
        )}
      </code>
    );
  }
  if (!asset.data) {
    return <Loading large />;
  }

  const assetData = asset.data;
  const src = `/api/asset?spaceId=${spaceId}&assetId=${assetData.assetId}`;

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
    <div className={classNames([s.container, "columns"])}>
      <div className={classNames([s.asset, "column", "is-two-thirds"])}>{el}</div>
      <div className={classNames([s.log, "column"])}>
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
            return log.revalidate().then((v) => {
              const el = logMessages.current;
              if (el !== null) {
                el.scrollTo({ top: el.scrollHeight });
              }

              return v;
            });
          }}
        />
      </div>
    </div>
  );
}
