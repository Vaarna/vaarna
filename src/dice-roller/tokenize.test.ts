import { tokenize, Num, OpPlus, OpMinus, OpDice, ParenL, ParenR } from "./tokenize";

test.each([
  ["(", ParenL],
  [")", ParenR],
  ["+", OpPlus],
  ["-", OpMinus],
  ["d", OpDice],
  ["0", Num(0)],
  ["42", Num(42)],
])("tokenize recognizes %s as %s", (v, expected) => {
  const res = tokenize(v);
  expect(res).toHaveLength(1);
  expect(res[0]).toEqual(expected);
});

test("tokenize recognizes complex inputs", () => {
  expect(tokenize("(1+1)d2")).toEqual([
    ParenL,
    Num(1),
    OpPlus,
    Num(1),
    ParenR,
    OpDice,
    Num(2),
  ]);
});
