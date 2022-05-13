import type { RootState } from "state/store";
import { sheetData } from "./reducer";

const sheetsSelectors = sheetData.getSelectors<RootState>((state) => state.sheets);

export const selectSheet = sheetsSelectors.selectById;
export const selectSheets = sheetsSelectors.selectAll;
