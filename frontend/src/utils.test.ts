import { delay, wait, randomId, round, retry } from "./utils";

describe("randomId", () => {
  test("creates a different id on calls", () => {
    expect(randomId()).not.toBe(randomId());
  });

  test("is at least 12 characters long", () => {
    expect(randomId().length).toBeGreaterThanOrEqual(12);
  });
});

describe("round", () => {
  test.each([
    [11.11, 0, 11],
    [11.11, 1, 11.1],
    [11.11, -1, 10],

    [111.111, 0, 111],
    [111.111, 1, 111.1],
    [111.111, 2, 111.11],
    [111.111, 3, 111.111],
    [111.111, 4, 111.111],
    [111.111, -1, 110],
    [111.111, -2, 100],
    [111.111, -3, 0],
  ])("%p with accuracy %p equals %p", (v, acc, res) => {
    expect(round(v, acc)).toBe(res);
  });
});

describe("wait", () => {
  beforeEach(() => {
    jest.useRealTimers();
  });

  test("to resolve with given value", () => {
    expect.assertions(1);

    return wait(10, "ok").then((v) => {
      expect(v).toBe("ok");
    });
  });
});

describe("delay", () => {
  beforeEach(() => {
    jest.useRealTimers();
  });

  test("can be used in a promise chain", () => {
    expect.assertions(1);

    return Promise.resolve("ok")
      .then(delay(10))
      .then((v) => {
        expect(v).toBe("ok");
      });
  });
});

describe("retry", () => {
  beforeEach(() => {
    jest.useRealTimers();
    jest.setTimeout(100);
  });

  describe("with type of constant", () => {
    test("resolves to the value of a promise that always resolves", () => {
      expect.assertions(1);

      return retry(() => Promise.resolve("ok"), {
        type: "constant",
        interval: 10,
      }).then((v) => {
        expect(v).toBe("ok");
      });
    });

    test("rejects to the value of a promise that always rejects", () => {
      expect.assertions(1);

      return retry(() => Promise.reject("fail"), {
        type: "constant",
        interval: 10,
      }).catch((v) => {
        expect(v).toBe("fail");
      });
    });

    test("resolves immediately if the function resolves on first try", () => {
      jest.useFakeTimers();
      expect.assertions(1);

      return retry(() => Promise.resolve("ok"), {
        type: "constant",
        interval: 10,
      }).then(() => {
        expect(setTimeout).toHaveBeenCalledTimes(0);
      });
    });

    test("resolving function is only called once", async () => {
      expect.assertions(1);

      const fn = jest.fn(() => Promise.resolve("ok"));

      return retry(fn, { type: "constant", interval: 10 }).then((_) => {
        expect(fn).toHaveBeenCalledTimes(1);
      });
    });

    test("rejecting function is retried `maxRetries` times", () => {
      expect.assertions(7);

      const fn = jest.fn(() => Promise.reject("fail"));

      return retry(fn, { type: "constant", interval: 10, maxRetries: 5 }).catch(
        (_) => {
          expect(fn).toHaveBeenCalledTimes(6);
          expect(fn).toHaveBeenNthCalledWith(1, 0);
          expect(fn).toHaveBeenNthCalledWith(2, 1);
          expect(fn).toHaveBeenNthCalledWith(3, 2);
          expect(fn).toHaveBeenNthCalledWith(4, 3);
          expect(fn).toHaveBeenNthCalledWith(5, 4);
          expect(fn).toHaveBeenNthCalledWith(6, 5);
        }
      );
    });
  });
});
