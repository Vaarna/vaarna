/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { createSelector } from "@reduxjs/toolkit";

import { SheetState } from "@vaarna/sheet-logic";

import {
  selectGroups,
  selectGroupsInSheet,
  selectItems,
  selectItemsInSheet,
  selectSheet,
  selectSheets,
} from "./slice";

export const selectSheetState = createSelector(
  [selectSheet, selectGroupsInSheet, selectItemsInSheet],
  (sheet, groups, items): SheetState | undefined => {
    if (!sheet) return;

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
