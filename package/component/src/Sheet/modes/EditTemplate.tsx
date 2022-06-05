import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@gm-screen/all/dist/state/hook";
import { createItem, selectSpaceId, updateItem } from "@gm-screen/all/dist/state/slice";
import { Item, ItemType, callIfParsed, unionMembers } from "@gm-screen/type";
import { FieldCheckbox, FieldSelect, FieldString, Fields } from "./Field";

export type EditTemplateProps = {
  state: Item;
  groups: string[];
};

export const EditTemplate: React.FC<EditTemplateProps> = ({ state, groups }) => {
  const dispatch = useAppDispatch();

  const spaceId = useAppSelector(selectSpaceId);

  const [item, setItem] = useState(state);
  useEffect(() => {
    const t = setTimeout(() => {
      if (spaceId === null) return;
      dispatch(updateItem(item));
    }, 1000);

    return () => clearTimeout(t);
  }, [dispatch, item, spaceId]);

  return (
    <Fields>
      <FieldSelect
        name="Group"
        value={item.group}
        options={groups}
        onChange={(group) => setItem((item) => ({ ...item, group }))}
      />
      <FieldString
        name="Key"
        value={item.key}
        onChange={(key) => setItem((item) => ({ ...item, key }))}
      />
      <FieldString
        name="Sort Key"
        value={item.sortKey}
        onChange={(sortKey) => setItem((item) => ({ ...item, sortKey }))}
      />
      <FieldString
        name="Name"
        value={item.name}
        onChange={(name) => setItem((item) => ({ ...item, name }))}
      />
      <FieldSelect
        name="Type"
        value={item.type}
        options={unionMembers(ItemType)}
        onChange={callIfParsed(ItemType, (type) =>
          setItem((item) => ({ ...item, type }))
        )}
      />
      <FieldCheckbox
        name="Readonly"
        value={item.readOnly}
        onChange={(readOnly) => setItem((item) => ({ ...item, readOnly }))}
      />
      <FieldString
        name="Value"
        value={item.value}
        onChange={(value) => setItem((item) => ({ ...item, value }))}
      />
      <FieldCheckbox
        name="Click Enabled"
        value={item.onclickEnabled}
        onChange={(onclickEnabled) => setItem((item) => ({ ...item, onclickEnabled }))}
      />
      <FieldString
        name="Click"
        value={item.onclick}
        onChange={(onclick) => setItem((item) => ({ ...item, onclick }))}
      />

      {item.type === "range" && (
        <>
          <FieldString
            name="Min"
            value={item.min ?? ""}
            onChange={(max) => setItem((item) => ({ ...item, max }))}
          />
          <FieldString
            name="Max"
            value={item.max ?? ""}
            onChange={(max) => setItem((item) => ({ ...item, max }))}
          />
        </>
      )}

      <button
        disabled={spaceId === null}
        onClick={() => {
          if (spaceId === null) return;
          dispatch(createItem(item));
        }}
      >
        Copy
      </button>
    </Fields>
  );
};
