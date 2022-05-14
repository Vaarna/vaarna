import { dynamoDbConfigFromRequest } from "./common";

import createSpace from "./createSpace";
import getSpace from "./getSpace";

import createSheet from "./createSheet";
import getSheet from "./getSheet";

export const backend = {
  dynamoDbConfigFromRequest,

  ...createSpace.backend,
  ...getSpace.backend,

  ...createSheet.backend,
  ...getSheet.backend,
};

export const frontend = {
  ...createSpace.frontend,
  ...getSpace.frontend,

  ...createSheet.frontend,
  ...getSheet.frontend,
};
