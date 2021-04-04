import { CustomError } from "./common";

export class FrontendError extends CustomError {
  constructor(message?: string) {
    super(message);
    this.name = "FrontendError";
  }
}
