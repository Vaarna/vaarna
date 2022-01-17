import { useEffect, useReducer, useState } from "react";
import { v4 as uuid } from "uuid";
import { SheetState, sheetStateReducer } from "type/sheet";
import { Sheet } from "component/Sheet";
import { Upload } from "component/Upload";
import { useRouter } from "next/router";
import { z } from "zod";

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
      onclick: "=d20 + {{self}}",
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
      onclick: "=d20 + {{self}} + {{prof}}",
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
      onclick: "=d{{self}} + {{prof}}",
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
      onclick: "=d20 + {{self}} + {{prof}}",
    },
    {
      ...itemBase(),
      type: "boolean",
      group: "skills",
      key: "athletics",
      name: "Athletics",
      value: "0",
      onclickEnabled: true,
      onclick: "=d20 + {{str_mod}} + {{self}} * {{prof}}",
    },
    {
      ...itemBase(),
      type: "boolean",
      group: "skills",
      key: "athletics",
      name: "Athletics",
      value: "0",
      onclickEnabled: true,
      onclick: "=d20 + {{str_mod}} + {{self}} * {{prof}}",
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
      onclick: "=d100<={{self}}",
    },
    {
      ...itemBase(),
      type: "omni",
      group: "",
      key: "db",
      name: "Damage Bonus",
      value: "d4",
      onclickEnabled: true,
      onclick: "={{self}}",
    },
  ],
};

export default function Space(): React.ReactNode {
  const [state, dispatch] = useReducer(sheetStateReducer, collectionInitialState);

  const [spaceId, setSpaceId] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    const parsed = z.string().safeParse(router.query.id);
    if (parsed.success) setSpaceId(parsed.data);
  }, [router]);

  if (spaceId === null) return <span>redirecting...</span>;

  return (
    <Upload url="/api/asset" params={{ spaceId }}>
      <div style={{ margin: "1rem" }}>
        <Sheet {...{ state, dispatch }} />
      </div>
    </Upload>
  );
}
