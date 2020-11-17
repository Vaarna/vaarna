import { round, randomId } from "./utils";

test("randomId creates a different id on calls", () => {
  const a = randomId(),
    b = randomId();

  expect(a).not.toEqual(b);
});

[
  [11.11, 0, 11],
  [11.11, 1, 11.1],
  [11.11, -1, 10],

  [111.111, 0, 111],
  [111.111, 1, 111.1],
  [111.111, 2, 111.11],
  [111.111, -1, 110],
  [111.111, -2, 100],
].forEach(([v, acc, res]) => {
  test(`rounding ${v} with accuracy ${acc} should equal ${res}`, () => {
    expect(round(v, acc)).toEqual(res);
  });
});
