import { z } from "zod";

import { Group, ItemBase, Sheet, Space } from "@gm-screen/type";

// --- USEFUL TYPES ---

export const SpaceIdParam = z.object({ spaceId: Space.shape.spaceId });
export type SpaceIdParam = z.infer<typeof SpaceIdParam>;

export const SheetIdParam = z.object({ sheetId: Sheet.shape.sheetId });
export type SheetIdParam = z.infer<typeof SheetIdParam>;

export const GroupIdParam = z.object({ groupId: Group.shape.groupId });
export type GroupIdParam = z.infer<typeof GroupIdParam>;

export const ItemIdParam = z.object({ itemId: ItemBase.shape.itemId });
export type ItemIdParam = z.infer<typeof ItemIdParam>;
