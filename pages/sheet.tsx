import { useReducer } from "react";
import { v4 as uuid } from "uuid";
import { SheetState, sheetStateReducer } from "type/sheet";
import { Sheet } from "component/Sheet";

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
  groups: {
    skill: {
      name: "Skills",
      display: "rows",
      sortOrder: "desc",
    },
  },
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
      max: "={{level}} * (ceil(({{hit_die}} + 1) / 2) + {{con_mod}})",
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
      value: "=floor(({{str}}-10)/2)",
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
      value: "=floor(({{con}}-10)/2)",
      readOnly: true,
      onclickEnabled: true,
      onclick: "=d20 + {{self}} + {{prof}}",
    },
    {
      ...itemBase(),
      type: "boolean",
      group: "skill",
      key: "athletics",
      name: "Athletics",
      value: "0",
      onclickEnabled: true,
      onclick: "=d20 + {{str_mod}} + {{self}} * {{prof}}",
    },
    {
      ...itemBase(),
      type: "boolean",
      group: "skill",
      key: "athletics",
      name: "Athletics",
      value: "0",
      onclickEnabled: true,
      onclick: "=d20 + {{str_mod}} + {{self}} * {{prof}}",
    },
    {
      ...itemBase(),
      type: "range",
      group: "skill",
      key: "jump",
      name: "Jump",
      value: "37",
      min: "1",
      max: "",
      onclickEnabled: true,
      onclick: "=d100<={{self}}",
    },
  ],
};

export default function Space(): React.ReactNode {
  const [state, dispatch] = useReducer(sheetStateReducer, collectionInitialState);
  return (
    <div style={{ margin: "1rem" }}>
      <Sheet {...{ state, dispatch }} />
    </div>
  );
}
