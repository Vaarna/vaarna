import type { RootState } from "state/store";
import { Group, Sheet } from "type/sheet";
import { groupData } from "./reducer";

const groupsSelectors = groupData.getSelectors<RootState>((state) => state.groups);

export const selectGroup = groupsSelectors.selectById;
export const selectGroups = groupsSelectors.selectAll;

export const selectGroupsInSheet = (
  state: RootState,
  sheetId: Sheet["sheetId"]
): Group[] => selectGroups(state).filter((group) => group.sheetId === sheetId);
