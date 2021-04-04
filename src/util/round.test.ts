import fc from "fast-check";

import { round } from "./round";

const e = Number.EPSILON;

test.each([
  [0, -3, 0],
  [0, -2, 0],
  [0, -1, 0],
  [0, 0, 0],
  [0, 1, 0],
  [0, 2, 0],
  [0, 3, 0],

  [1, 0, 1],
  [10, -1, 10],
  [100, -2, 100],
  [1000, -3, 1000],

  [0, -323, 0],
  [0, 15, 0],

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

  [0.5 - 2 * e, 0, 0],
  [0.5, 0, 1],
  [0.5 + e, 0, 1],

  [0.5 - e, 1, 0.5],
  [0.5, 1, 0.5],
  [0.5 + e, 1, 0.5],

  [499, -3, 0],
  [499.5, -3, 0],
  [500, -3, 1000],
  [500.5, -3, 1000],
  [501, -3, 1000],

  [4999, -4, 0],
  [5000, -4, 0],
  [5000.001, -4, 10_000],
  [5001, -4, 10_000],

  [99_999, -5, 100_000],
  [100_000, -5, 100_000],
  [100_001, -5, 100_000],

  [999_999, -6, 1_000_000],
  [1_000_000, -6, 1_000_000],
  [1_000_001, -6, 1_000_000],
])("rounding %p with accuracy %p equals %p", (v, acc, res) => {
  expect(round(v, acc)).toBe(res);
});

test("rounding 0 with any accuracy equals 0", () => {
  fc.assert(
    fc.property(fc.integer(), (acc) => {
      expect(round(0, acc)).toEqual(0);
    })
  );
});

test("rounding any number with accuracy of 0 equals itself", () => {
  fc.assert(
    fc.property(fc.integer(), (num) => {
      expect(round(num, 0)).toEqual(num);
    })
  );
});

test("rounding 10^x with accuracy 1-x equals 10^x", () => {
  fc.assert(
    fc.property(
      fc.integer(0, Math.floor(Math.log10(Number.MAX_SAFE_INTEGER))),
      (x) => {
        const pow = Math.pow(10, x);
        expect(round(pow, 1 - x)).toEqual(pow);
      }
    )
  );
});
