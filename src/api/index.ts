import { dynamoDbConfigFromRequest } from "./common";

import createSpace from "./createSpace";
import getSpace from "./getSpace";
import updateSpace from "./updateSpace";

import createSheet from "./createSheet";
import getSheet from "./getSheet";
import updateSheet from "./updateSheet";

import createGroup from "./createGroup";
import getGroup from "./getGroup";
import updateGroup from "./updateGroup";

import createItem from "./createItem";
import getItem from "./getItem";
import updateItem from "./updateItem";

export const backend = {
  dynamoDbConfigFromRequest,

  ...createSpace.backend,
  ...getSpace.backend,
  ...updateSpace.backend,

  ...createSheet.backend,
  ...getSheet.backend,
  ...updateSheet.backend,

  ...createGroup.backend,
  ...getGroup.backend,
  ...updateGroup.backend,

  ...createItem.backend,
  ...getItem.backend,
  ...updateItem.backend,
};

export const frontend = {
  ...createSpace.frontend,
  ...getSpace.frontend,
  ...updateSpace.frontend,

  ...createSheet.frontend,
  ...getSheet.frontend,
  ...updateSheet.frontend,

  ...createGroup.frontend,
  ...getGroup.frontend,
  ...updateGroup.frontend,

  ...createItem.frontend,
  ...getItem.frontend,
  ...updateItem.frontend,
};
