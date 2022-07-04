import createGroup from "./createGroup";
import createItem from "./createItem";
import createSheet from "./createSheet";
import createSpace from "./createSpace";
import getGroup from "./getGroup";
import getItem from "./getItem";
import getSheet from "./getSheet";
import getSpace from "./getSpace";
import updateGroup from "./updateGroup";
import updateItem from "./updateItem";
import updateSheet from "./updateSheet";
import updateSpace from "./updateSpace";
import { dynamoDbConfigFromRequest } from "./util";

export * from "./util";

export const backend = {
  dynamoDbConfigFromRequest,

  ...createGroup.backend,
  ...createItem.backend,
  ...createSheet.backend,
  ...createSpace.backend,

  ...getGroup.backend,
  ...getItem.backend,
  ...getSheet.backend,
  ...getSpace.backend,

  ...updateGroup.backend,
  ...updateItem.backend,
  ...updateSheet.backend,
  ...updateSpace.backend,
};

export const frontend = {
  ...createGroup.frontend,
  ...createItem.frontend,
  ...createSheet.frontend,
  ...createSpace.frontend,

  ...getGroup.frontend,
  ...getItem.frontend,
  ...getSheet.frontend,
  ...getSpace.frontend,

  ...updateGroup.frontend,
  ...updateItem.frontend,
  ...updateSheet.frontend,
  ...updateSpace.frontend,
};
