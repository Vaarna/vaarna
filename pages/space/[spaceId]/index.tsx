import { useEffect, useState } from "react";
import { Sheet } from "component/Sheet";
import { Upload } from "component/Upload";
import { useRouter } from "next/router";
import { z } from "zod";
import { SideBySide } from "component/SideBySide";
import { Header } from "component/Header";
import Link from "next/link";
import { selectSpaceId, selectSheetStateAll } from "select";
import { useAppDispatch, useAppSelector } from "hooks";
import { setSpaceId } from "reducer/space";
import { newSheet } from "reducer";

// const itemBase = () => ({
//   id: uuid(),
//   group: "",
//   key: "",
//   sortKey: "",
//   readOnly: false,
//   onclickEnabled: false,
//   onclick: "",
// });

// const collectionInitialState: SheetState = {
//   id: "",
//   name: "Pepe",
//   groups: [
//     {
//       groupId: uuid(),
//       key: "attr",
//       name: "",
//     },
//     {
//       id: uuid(),
//       key: "attr_rel",
//       name: "",
//     },
//     {
//       id: uuid(),
//       key: "skills",
//       name: "Skills",
//       display: "rows",
//       sortOrder: "desc",
//     },
//   ],

//   items: [
//     {
//       ...itemBase(),
//       type: "omni",
//       group: "attr",
//       key: "str",
//       name: "Strength",
//       value: "12",
//     },
//     {
//       ...itemBase(),
//       type: "omni",
//       group: "attr",
//       key: "con",
//       name: "Constitution",
//       value: "13",
//     },
//     {
//       ...itemBase(),
//       type: "range",
//       group: "attr_rel",
//       key: "hp",
//       name: "HP",
//       value: "22",
//       min: "0",
//       max: "={{#total}}{{level}} * (ceil(({{hit_die}} + 1) / 2) + {{con_mod}}){{/total}}",
//     },
//     {
//       ...itemBase(),
//       type: "omni",
//       group: "attr_rel",
//       key: "prof",
//       name: "Proficiency Bonus",
//       value: "3",
//       onclickEnabled: true,
//       onclick: "={{#output}}d20 + {{self}}{{/output}}",
//     },
//     {
//       ...itemBase(),
//       type: "omni",
//       group: "attr",
//       key: "str_mod",
//       name: "Strength Modifier",
//       value: "={{#total}}floor(({{str}}-10)/2){{/total}}",
//       readOnly: true,
//       onclickEnabled: true,
//       onclick: "={{#output}}d20 + {{self}} + {{prof}}{{/output}}",
//     },
//     {
//       ...itemBase(),
//       type: "range",
//       group: "attr_rel",
//       key: "level",
//       name: "Level",
//       value: "3",
//       min: "1",
//       max: "20",
//     },
//     {
//       ...itemBase(),
//       type: "omni",
//       group: "attr_rel",
//       key: "hit_die",
//       name: "Hit Die",
//       value: "10",
//       onclickEnabled: true,
//       onclick: "={{#output}}d{{self}} + {{prof}}{{/output}}",
//     },
//     {
//       ...itemBase(),
//       type: "omni",
//       group: "attr",
//       key: "con_mod",
//       name: "Constitution Modifier",
//       value: "={{#total}}floor(({{con}}-10)/2){{/total}}",
//       readOnly: true,
//       onclickEnabled: true,
//       onclick: "={{#output}}d20 + {{self}} + {{prof}}{{/output}}",
//     },
//     {
//       ...itemBase(),
//       type: "boolean",
//       group: "skills",
//       key: "athletics",
//       name: "Athletics",
//       value: "0",
//       onclickEnabled: true,
//       onclick: "={{#output}}d20 + {{str_mod}} + {{self}} * {{prof}}{{/output}}",
//     },
//     {
//       ...itemBase(),
//       type: "boolean",
//       group: "skills",
//       key: "athletics",
//       name: "Athletics",
//       value: "0",
//       onclickEnabled: true,
//       onclick: "={{#output}}d20 + {{str_mod}} + {{self}} * {{prof}}{{/output}}",
//     },
//     {
//       ...itemBase(),
//       type: "range",
//       group: "skills",
//       key: "jump",
//       name: "Jump",
//       value: "37",
//       min: "1",
//       max: "",
//       onclickEnabled: true,
//       onclick: "={{#output}}d100<={{self}}{{/output}}",
//     },
//     {
//       ...itemBase(),
//       type: "omni",
//       group: "",
//       key: "db",
//       name: "Damage Bonus",
//       value: "d4",
//       onclickEnabled: true,
//       onclick: "={{#output}}{{self}}{{/output}}",
//     },
//   ],
// };

export default function Space(): React.ReactNode {
  const router = useRouter();

  const dispatch = useAppDispatch();
  const spaceId = useAppSelector(selectSpaceId);

  useEffect(() => {
    const parsed = z.string().safeParse(router.query.spaceId);
    if (parsed.success) dispatch(setSpaceId(parsed.data));
  }, [router, dispatch]);

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
        <button onClick={() => dispatch(newSheet())}>New Sheet</button>
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
