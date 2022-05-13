import type { RootState } from "state/store";

export const selectSpaceId = (state: RootState): string | null => state.space.spaceId;
