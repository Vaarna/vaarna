import { Base64 } from "js-base64";

export function randomId() {
  const array = new Uint8Array(12);
  window.crypto.getRandomValues(array);
  return Base64.fromUint8Array(array, true);
}

export const round = (num: number, acc: number = 0) => {
  let m = Math.pow(10, acc);
  return Math.round((num + Number.EPSILON) * m) / m;
};

/**
 * Returns a promise that resolves after `timeout` milliseconds with the value of `value`.
 *
 * @param timeout Milliseconds to wait before resolving the promise.
 * @param value Value that will be used to resolve the promise (optional).
 */
export function wait<T>(timeout: number, value?: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(value);
    }, timeout);
  });
}

/**
 * Much like {@link wait} but can be used in the middle of a promise chain.
 *
 * @param timeout Milliseconds to wait before resolving with the given value.
 * @returns A function that can be passed to `Promise.then`.
 */
export function delay<T>(timeout: number): (value: T) => Promise<T> {
  return (value) => {
    return wait(timeout, value);
  };
}

async function constantRetry<T>(
  fn: (retries?: number) => Promise<T>,
  interval: number,
  maxRetries: number,
  retry: number
): Promise<T> {
  try {
    return await fn(retry);
  } catch (e) {
    if (retry >= maxRetries) {
      throw e;
    }

    await wait(interval);
    return constantRetry(fn, interval, maxRetries, retry + 1);
  }
}

/**
 * RetryOptions controls the behaviour of {@link retry}.
 */
type RetryOptions = {
  type: "constant";

  /**
   * maxRetries is the number of retries that will be tried before failing.
   * Use Infinity to continue (practically) forever.
   */
  maxRetries?: number;

  /**
   * interval is the number of milliseconds that will be slept between the retries.
   */
  interval?: number;
};

/**
 * retry will retry to resolve the promise returned by `fn` as defined by `options`.
 *
 * @param fn Function returning a {@link Promise},
 * will be called with the retry count for each retry
 * (that is, for the very first try, it will be called with `0`, then with `1`, `2`, and so on so forth).
 * @param options Controls the retry logic, for all options see the variants of the {@link RetryOptions} type.
 */
export async function retry<T>(
  fn: (retries?: number) => Promise<T>,
  options: RetryOptions
): Promise<T> {
  const p = fn(0);

  if (options.type == "constant") {
    const interval = options.interval ?? 500;
    const maxRetries = options.maxRetries ?? 5;

    return p.catch((e) => {
      if (maxRetries <= 0) throw e;

      return constantRetry(fn, interval, maxRetries, 1);
    });
  }

  throw "unsupported retry type";
}
