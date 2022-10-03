import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { z } from "zod";

import { Header, Sheet, SideBySide } from "@vaarna/component";
import {
  createSheet,
  getSpace,
  selectSheetCreateInProgress,
  selectSheetStateAll,
  selectSpaceId,
  setSpaceId,
  useAppDispatch,
  useAppSelector,
} from "@vaarna/state";

export default function Space(): React.ReactNode {
  const router = useRouter();

  const dispatch = useAppDispatch();
  const spaceId = useAppSelector(selectSpaceId);

  useEffect(() => {
    let t: NodeJS.Timeout;
    (function f() {
      if (spaceId === null) return;
      dispatch(getSpace(spaceId));
      // t = setTimeout(f, 5_000);
    })();

    return () => clearInterval(t);
  }, [dispatch, spaceId]);

  useEffect(() => {
    const parsed = z.string().safeParse(router.query.spaceId);
    if (parsed.success) dispatch(setSpaceId(parsed.data));
  }, [router.query.spaceId, dispatch]);

  const createSheetInProgress = useAppSelector(selectSheetCreateInProgress);
  const sheets = useAppSelector(selectSheetStateAll);

  const [logItems, setLogItems] = useState<string[]>([]);
  const addLogItem = (item: string) => {
    setLogItems((prev) => [...prev, item]);
  };

  const [showRight, setShowRight] = useState(true);
  const send = (v: string) => Promise.resolve(addLogItem(v));

  return (
    <>
      <Header>
        <button
          disabled={createSheetInProgress || spaceId === null}
          onClick={() =>
            spaceId !== null && dispatch(createSheet({ spaceId, name: "" }))
          }
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
    </>
  );
}
