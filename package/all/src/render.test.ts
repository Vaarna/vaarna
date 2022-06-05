import fc from "fast-check";

import { evaluate } from "./render";

const numberWithNDecimals = (n: number) =>
  fc
    .tuple(fc.integer(), fc.nat(Math.pow(10, n) - 1))
    .map(([a, b]) => Number(`${a}.${b}`));

describe("evaluating", () => {
  it("an empty string returns an empty string", () => {
    expect(evaluate("", [])).toEqual("");
  });

  it("an empty expression returns an empty string", () => {
    expect(evaluate("=", [])).toEqual("");
  });

  it("a cyclic reference returns #CYCLIC?", () => {
    expect(
      evaluate("={{other}}", [
        ["other", "={{a}}"],
        ["a", "={{other}}"],
      ])
    ).toEqual("#CYCLIC?");
  });

  it("only whitespace returns itself", () => {
    expect(evaluate(" ", [])).toEqual(" ");
    expect(evaluate("\t", [])).toEqual("\t");
    expect(evaluate("\n", [])).toEqual("\n");
    expect(evaluate("  ", [])).toEqual("  ");
    expect(evaluate("\t\t", [])).toEqual("\t\t");
    expect(evaluate("\n\n", [])).toEqual("\n\n");
    expect(evaluate(" \t\n", [])).toEqual(" \t\n");
    expect(evaluate(" \t\n \t\n", [])).toEqual(" \t\n \t\n");
  });

  it("whitespace is trimmed after variable expansion", () => {
    expect(evaluate(" {{a}} {{b}} ")).toEqual(" {{a}} {{b}} ");
    expect(evaluate("= {{a}} {{b}} ")).toEqual("");
  });

  it("a string returns that string", () => {
    fc.assert(
      fc.property(fc.string(), (s) => {
        fc.pre(!s.startsWith("="));
        fc.pre(!s.startsWith("'="));
        return evaluate(s, []) === s;
      })
    );
  });

  it("a string that starts with '= starts with = and does not use parameters", () => {
    fc.assert(
      fc.property(fc.string(), (s) => {
        return evaluate(`'=${s} {{other}}`, [["other", "wrong"]]) === `=${s} {{other}}`;
      })
    );
  });

  it("an equation looking template returns it as string without calculation", () => {
    fc.assert(
      fc.property(numberWithNDecimals(3), numberWithNDecimals(3), (a, b) => {
        return evaluate(`=${a} + {{other}}`, [["other", `${b}`]]) === `${a} + ${b}`;
      })
    );
  });

  it("expression with only whitespace returns an empty string", () => {
    expect(evaluate("= ", [])).toEqual("");
    expect(evaluate("=\t", [])).toEqual("");
    expect(evaluate("=\n", [])).toEqual("");
    expect(evaluate("=  ", [])).toEqual("");
    expect(evaluate("=\t\t", [])).toEqual("");
    expect(evaluate("=\n\n", [])).toEqual("");
    expect(evaluate("= \t\n", [])).toEqual("");
    expect(evaluate("= \t\n \t\n", [])).toEqual("");
  });

  it("a number expression returns that number", () => {
    expect(evaluate("={{#total}}1{{/total}}", [])).toEqual("1");
    expect(evaluate("={{#total}}-1{{/total}}", [])).toEqual("-1");
    expect(evaluate("={{#total}}1.5{{/total}}", [])).toEqual("1.5");
    expect(evaluate("={{#total}}-1.5{{/total}}", [])).toEqual("-1.5");
  });

  it.each([
    ["floor", 0, 0],
    ["floor", 0.5, 0],
    ["floor", 1, 1],
    ["floor", 1.5, 1],
    ["floor", -0.5, -1],
    ["floor", -1, -1],
    ["floor", -1.5, -2],
    ["ceil", 0, 0],
    ["ceil", 0.5, 1],
    ["ceil", 1, 1],
    ["ceil", 1.5, 2],
    ["ceil", -0.5, 0],
    ["ceil", -1, -1],
    ["ceil", -1.5, -1],
    ["round", 0, 0],
    ["round", 0.5, 1],
    ["round", 1, 1],
    ["round", 1.5, 2],
    ["round", 2.5, 3],
    ["round", -0.5, -1],
    ["round", -1, -1],
    ["round", -1.5, -2],
    ["round", -2.5, -3],
    ["abs", 0, 0],
    ["abs", 0.5, 0.5],
    ["abs", 1, 1],
    ["abs", 1.5, 1.5],
    ["abs", -0.5, 0.5],
    ["abs", -1, 1],
    ["abs", -1.5, 1.5],
  ])("%s of %d equals %d", (fn, v, actual) => {
    expect(evaluate(`={{#total}}${fn}(${v}){{/total}}`)).toEqual(actual.toString());
  });

  it("math can be used", () => {
    expect(evaluate("={{#total}}1 + 1{{/total}}", [])).toEqual("2");
    expect(evaluate("={{#total}}(1 + 1) * 13{{/total}}", [])).toEqual("26");
  });

  it("dice notation works", () => {
    const res = Number(evaluate("={{#total}}d4{{/total}}", []));
    expect(res).toBeGreaterThanOrEqual(1);
    expect(res).toBeLessThanOrEqual(4);
  });

  it.each([
    ["={{#total}}d1{{/total}}", 1, 1],
    ["={{#total}}d1+1{{/total}}", 2, 2],
    ["={{#total}}d1-1{{/total}}", 0, 0],
    ["={{#total}}d6{{/total}}", 1, 6],
    ["={{#total}}2d6{{/total}}", 2, 12],
  ])("%s is between %s and %s", (v, low, high) => {
    for (let i = 0; i < 10; i++) {
      const res = Number(evaluate(v, []));
      expect(res).toBeGreaterThanOrEqual(low);
      expect(res).toBeLessThanOrEqual(high);
    }
  });

  it.each([["d1"], ["d1+1"], ["d1-1"], ["d6"], ["2d6"]])("%s equals itself", (v) => {
    expect(evaluate(v, [])).toEqual(v);
  });

  it("a template with no variables works", () => {
    expect(evaluate("=42", [])).toEqual("42");
  });

  it("a template with that uses env with numbers works", () => {
    expect(evaluate("={{#total}}1 + {{other}}{{/total}}", [["other", "1"]])).toEqual(
      "2"
    );
  });

  it("a template with that uses env with dice notation works", () => {
    const res = Number(
      evaluate("={{#total}}1 + {{other}}{{/total}}", [["other", "d4"]])
    );
    expect(res).toBeGreaterThanOrEqual(2);
    expect(res).toBeLessThanOrEqual(5);
  });

  test("wacky string concat stuff can be done with", () => {
    expect(evaluate("=fl{{other}}2)", [["other", "oor(4"]])).toEqual("floor(42)");
  });
});

test("_#-*$ can be used in variable names", () => {
  expect(evaluate("={{hp#min}}", [["hp#min", "0"]])).toEqual("0");
  expect(evaluate("={{hp_min}}", [["hp_min", "0"]])).toEqual("0");
  expect(evaluate("={{hp-min}}", [["hp-min", "0"]])).toEqual("0");
  expect(evaluate("={{hp*min}}", [["hp*min", "0"]])).toEqual("0");
  expect(evaluate("={{hp$min}}", [["hp$min", "0"]])).toEqual("0");
});

test("d&d hp calculation from stats", () => {
  const res = evaluate(
    "={{#total}}{{level}} * (ceil(({{hit_die}} + 1) / 2) + {{con_mod}}){{/total}}",
    [
      ["level", "3"],
      ["hit_die", "10"],
      ["con_mod", "={{#total}}floor( ({{con}} - 10) / 2 ){{/total}}"],
      ["con", "13"],
    ]
  );

  const level = 3;
  const hitDie = 10;
  const con = 13;
  const conMod = Math.floor((con - 10) / 2);
  expect(res).toEqual(`${level * (Math.ceil((hitDie + 1) / 2) + conMod)}`);
});
