import { useEffect, useState } from "react";
import { Sheet } from "component/Sheet";
import { Upload } from "component/Upload";
import { useRouter } from "next/router";
import { z } from "zod";
import { SideBySide } from "component/SideBySide";
import { Header } from "component/Header";
import { selectSheetStateAll } from "state/select";
import { useAppDispatch, useAppSelector } from "state/hook";
import {
  selectSheetCreateInProgress,
  selectSpaceId,
  setSpaceId,
  createSheet,
} from "state/slice";
import { getSpace } from "state/slice/getSpace";

export default function Space(): React.ReactNode {
  const router = useRouter();

  const dispatch = useAppDispatch();
  const spaceId = useAppSelector(selectSpaceId);

  useEffect(() => {
    let t: NodeJS.Timeout;
    (function f() {
      if (spaceId === null) return;
      dispatch(getSpace(spaceId));
      t = setTimeout(f, 5000);
    })();

    return () => clearInterval(t);
  }, [dispatch, spaceId]);

  useEffect(() => {
    const parsed = z.string().safeParse(router.query.spaceId);
    if (parsed.success) dispatch(setSpaceId(parsed.data));
  }, [router, dispatch]);

  const createSheetInProgress = useAppSelector(selectSheetCreateInProgress);
  const sheets = useAppSelector((state) => selectSheetStateAll(state));

  const [logItems, setLogItems] = useState<string[]>([]);
  const addLogItem = (item: string) => {
    setLogItems((prev) => [...prev, item]);
  };

  const [showRight, setShowRight] = useState(true);
  const send = (v: string) => Promise.resolve(addLogItem(v));

  if (spaceId === null) return <span>redirecting...</span>;

  return (
    <Upload url="/api/asset" params={{ spaceId }}>
      <Header>
        <button
          disabled={createSheetInProgress}
          onClick={() => dispatch(createSheet({ name: "" }))}
        >
          New Sheet
        </button>
        <button onClick={() => setShowRight((prev) => !prev)}>
          {showRight ? "hide log" : "show log"}
        </button>
      </Header>
      <SideBySide showRight={showRight} send={send}>
        <>
          {Object.values(sheets).map((sheet) => (
            <Sheet key={sheet.sheetId} state={sheet} />
          ))}
        </>
        <>
          {logItems.map((v, i) => (
            <div key={i}>{v}</div>
          ))}
        </>
      </SideBySide>
    </Upload>
  );
}
