import { useEffect, useReducer, useState } from "react";
import { v4 as uuid } from "uuid";
import { SheetState, sheetStateReducer } from "type/sheet";
import { Sheet } from "component/Sheet";
import { Upload } from "component/Upload";
import { useRouter } from "next/router";
import { z } from "zod";
import { SideBySide } from "component/SideBySide";
import { Header } from "component/Header";
import Link from "next/link";

const itemBase = () => ({
  id: uuid(),
  group: "",
  key: "",
  sortKey: "",
  readOnly: false,
  onclickEnabled: false,
  onclick: "",
});

const collectionInitialState: SheetState = {
  id: "",
  name: "Pepe",
  groups: [
    {
      id: uuid(),
      key: "attr",
      name: "",
    },
    {
      id: uuid(),
      key: "attr_rel",
      name: "",
    },
    {
      id: uuid(),
      key: "skills",
      name: "Skills",
      display: "rows",
      sortOrder: "desc",
    },
  ],

  items: [
    {
      ...itemBase(),
      type: "omni",
      group: "attr",
      key: "str",
      name: "Strength",
      value: "12",
    },
    {
      ...itemBase(),
      type: "omni",
      group: "attr",
      key: "con",
      name: "Constitution",
      value: "13",
    },
    {
      ...itemBase(),
      type: "range",
      group: "attr_rel",
      key: "hp",
      name: "HP",
      value: "22",
      min: "0",
      max: "={{#total}}{{level}} * (ceil(({{hit_die}} + 1) / 2) + {{con_mod}}){{/total}}",
    },
    {
      ...itemBase(),
      type: "omni",
      group: "attr_rel",
      key: "prof",
      name: "Proficiency Bonus",
      value: "3",
      onclickEnabled: true,
      onclick: "={{#output}}d20 + {{self}}{{/output}}",
    },
    {
      ...itemBase(),
      type: "omni",
      group: "attr",
      key: "str_mod",
      name: "Strength Modifier",
      value: "={{#total}}floor(({{str}}-10)/2){{/total}}",
      readOnly: true,
      onclickEnabled: true,
      onclick: "={{#output}}d20 + {{self}} + {{prof}}{{/output}}",
    },
    {
      ...itemBase(),
      type: "range",
      group: "attr_rel",
      key: "level",
      name: "Level",
      value: "3",
      min: "1",
      max: "20",
    },
    {
      ...itemBase(),
      type: "omni",
      group: "attr_rel",
      key: "hit_die",
      name: "Hit Die",
      value: "10",
      onclickEnabled: true,
      onclick: "={{#output}}d{{self}} + {{prof}}{{/output}}",
    },
    {
      ...itemBase(),
      type: "omni",
      group: "attr",
      key: "con_mod",
      name: "Constitution Modifier",
      value: "={{#total}}floor(({{con}}-10)/2){{/total}}",
      readOnly: true,
      onclickEnabled: true,
      onclick: "={{#output}}d20 + {{self}} + {{prof}}{{/output}}",
    },
    {
      ...itemBase(),
      type: "boolean",
      group: "skills",
      key: "athletics",
      name: "Athletics",
      value: "0",
      onclickEnabled: true,
      onclick: "={{#output}}d20 + {{str_mod}} + {{self}} * {{prof}}{{/output}}",
    },
    {
      ...itemBase(),
      type: "boolean",
      group: "skills",
      key: "athletics",
      name: "Athletics",
      value: "0",
      onclickEnabled: true,
      onclick: "={{#output}}d20 + {{str_mod}} + {{self}} * {{prof}}{{/output}}",
    },
    {
      ...itemBase(),
      type: "range",
      group: "skills",
      key: "jump",
      name: "Jump",
      value: "37",
      min: "1",
      max: "",
      onclickEnabled: true,
      onclick: "={{#output}}d100<={{self}}{{/output}}",
    },
    {
      ...itemBase(),
      type: "omni",
      group: "",
      key: "db",
      name: "Damage Bonus",
      value: "d4",
      onclickEnabled: true,
      onclick: "={{#output}}{{self}}{{/output}}",
    },
  ],
};

export default function Space(): React.ReactNode {
  const [logItems, setLogItems] = useState<string[]>([]);
  const addLogItem = (item: string) => setLogItems((prev) => [...prev, item]);

  const [state, dispatch] = useReducer(
    sheetStateReducer({ addLogItem }),
    collectionInitialState
  );

  const [spaceId, setSpaceId] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    const parsed = z.string().safeParse(router.query.id);
    if (parsed.success) setSpaceId(parsed.data);
  }, [router]);

  const [showRight, setShowRight] = useState(true);
  const send = (v: string) => Promise.resolve(addLogItem(v));

  if (spaceId === null) return <span>redirecting...</span>;

  return (
    <Upload url="/api/asset" params={{ spaceId }}>
      <Header>
        <Link href="/space/dd43fbda-40f0-49e7-8012-9485168262c1">
          <a>Sheet</a>
        </Link>
        <button onClick={() => setShowRight((prev) => !prev)}>
          {showRight ? "hide log" : "show log"}
        </button>
      </Header>
      <SideBySide showRight={showRight} send={send}>
        <>
          <Sheet {...{ state, dispatch, addLogItem }} />
          <Sheet {...{ state, dispatch, addLogItem }} />
          <Sheet {...{ state, dispatch, addLogItem }} />
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
