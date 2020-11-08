import { Base64 } from "js-base64";

export function randomId() {
  const array = new Uint8Array(12);
  window.crypto.getRandomValues(array);
  return Base64.fromUint8Array(array, true);
}
