import { round, randomId } from "./utils";

describe("randomId", () => {
  test("creates a different id on calls", () => {
    expect(randomId()).not.toEqual(randomId());
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
    [111.111, -1, 110],
    [111.111, -2, 100],
  ])("%p with accuracy %p equals %p", (v, acc, res) => {
    expect(round(v, acc)).toEqual(res);
  });
});
