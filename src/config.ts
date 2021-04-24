import { envGet } from "util/env";

export default {
  USER_TABLE: envGet("USER_TABLE"),
  SESSION_TABLE: envGet("SESSION_TABLE"),
};
