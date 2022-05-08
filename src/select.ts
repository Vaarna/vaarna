/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "store";
import { Sheet } from "type/sheet";
import { SheetState } from "util/evalItems";

export const selectSpaceId = (state: RootState) => state.space.spaceId;

export const selectSheet = (state: RootState, sheetId: Sheet["sheetId"]) =>
  state.sheets[sheetId];
export const selectGroupInSheet = (state: RootState, sheetId: Sheet["sheetId"]) =>
  Object.values(state.groups).filter((group) => group.sheetId === sheetId);
export const selectItemInSheet = (state: RootState, sheetId: Sheet["sheetId"]) =>
  Object.values(state.items).filter((item) => item.sheetId === sheetId);

export const selectSheetState = createSelector(
  [selectGroupInSheet, selectItemInSheet, selectSheet],
  (groups, items, sheet): SheetState => {
    const out: SheetState = { ...sheet, groups: [], items: [] };

    for (const group of Object.values(groups)) {
      out.groups.push(group);
    }

    for (const item of Object.values(items)) {
      out.items.push(item);
    }

    return out;
  }
);

export const selectSheets = (state: RootState) => state.sheets;
export const selectGroups = (state: RootState) => state.groups;
export const selectItems = (state: RootState) => state.items;

export const selectSheetStateAll = createSelector(
  [selectSheets, selectGroups, selectItems],
  (sheets, groups, items): Record<string, SheetState> => {
    const out: Record<string, SheetState> = {};

    for (const sheet of Object.values(sheets)) {
      out[sheet.sheetId] = { ...sheet, groups: [], items: [] };
    }

    for (const group of Object.values(groups)) {
      out[group.sheetId].groups.push(group);
    }

    for (const item of Object.values(items)) {
      out[item.sheetId].items.push(item);
    }

    return out;
  }
);
