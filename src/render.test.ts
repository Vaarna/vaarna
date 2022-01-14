import { evaluate, render } from "./render";

describe("rendering", () => {
  test("an empty string renders to an empty string", () => {
    expect(render("", [])).toEqual("");
  });

  test("an empty template renders to an empty string", () => {
    expect(render("=", [])).toEqual("");
  });

  test("a template with unclosed variable return #ERROR?", () => {
    expect(render("={{", [])).toEqual("#ERROR?");
  });

  test("a template with no env", () => {
    expect(render("hi", [])).toEqual("hi");
  });

  test("a template with simple env", () => {
    expect(render("hi {{name}}", [["name", "world"]])).toEqual("hi {{name}}");
    expect(render("=hi {{name}}", [["name", "world"]])).toEqual("hi world");
  });

  test("a template with simple env", () => {
    expect(render("hi {{name}}", [["name", "world"]])).toEqual("hi {{name}}");
    expect(render("=hi {{name}}", [["name", "world"]])).toEqual("hi world");
  });

  test("a template with = in the start can be escaped with '", () => {
    expect(render("'=end", [])).toEqual("=end");
  });

  test("does not escape anything", () => {
    expect(render("</>&'={}", [])).toEqual("</>&'={}");
    expect(render("=</>&'={}", [])).toEqual("</>&'={}");
  });

  test("a template that refers to another template", () => {
    expect(
      render("=hi {{name}}", [
        ["name", "={{other}}"],
        ["other", "world"],
      ])
    ).toEqual("hi world");

    expect(
      render("=hi {{name}}", [
        ["name", "={{other}}"],
        ["other", "={{second}}"],
        ["second", "world"],
      ])
    ).toEqual("hi world");
  });

  test("a template does not do any calculations", () => {
    expect(render("=2 + {{res}}", [["res", "2"]])).toEqual("2 + 2");

    expect(
      render("=2 + {{res}}", [
        ["res", "={{other}}"],
        ["other", "={{second}}"],
        ["second", "2"],
      ])
    ).toEqual("2 + 2");
  });

  test("a cyclic template returns #CYCLIC?", () => {
    expect(render("={{res}}", [["res", "={{res}}"]])).toEqual("#CYCLIC?");

    expect(
      render("={{res}}", [
        ["res", "={{other}}"],
        ["other", "={{second}}"],
        ["second", "={{res}}"],
      ])
    ).toEqual("#CYCLIC?");
  });

  test("each cyclic references returns #CYCLIC?", () => {
    expect(render("={{res}} {{res}}", [["res", "={{res}}"]])).toEqual(
      "#CYCLIC? #CYCLIC?"
    );

    expect(
      render("={{res}} {{other}} {{second}}", [
        ["res", "={{other}}"],
        ["other", "={{second}}"],
        ["second", "={{res}}"],
      ])
    ).toEqual("#CYCLIC? #CYCLIC? #CYCLIC?");
  });
});

const rollTotal = (template: string, env: [string, string][]): string =>
  evaluate(template, env);

describe("when evaluating", () => {
  test("an empty string, it returns an empty string", () => {
    expect(rollTotal("", [])).toEqual("");
  });

  test("an empty template, it returns an empty string", () => {
    expect(rollTotal("=", [])).toEqual("");
  });

  test("an invalid template returns #ERROR?", () => {
    expect(rollTotal("=f", [])).toEqual("#ERROR?");
  });

  test("a number returns that number", () => {
    expect(rollTotal("1", [])).toEqual("1");
    expect(rollTotal("-1", [])).toEqual("-1");
    expect(rollTotal("1.5", [])).toEqual("1.5");
    expect(rollTotal("-1.5", [])).toEqual("-1.5");
  });

  test("simple functions can be used", () => {
    expect(rollTotal("floor(-5.5)", [])).toEqual("-6");
    expect(rollTotal("ceil(-5.5)", [])).toEqual("-5");
    expect(rollTotal("round(-5.5)", [])).toEqual("-6");
    expect(rollTotal("abs(-5.5)", [])).toEqual("5.5");
  });

  test("math can be used", () => {
    expect(rollTotal("1 + 1", [])).toEqual("2");
    expect(rollTotal("(1 + 1) * 13", [])).toEqual("26");
  });

  test("dice notation can be used", () => {
    const res = Number(rollTotal("d4", []));
    expect(res).toBeGreaterThanOrEqual(1);
    expect(res).toBeLessThanOrEqual(4);
  });

  test.each([
    ["d1", 1, 1],
    ["d1+1", 2, 2],
    ["d1-1", 0, 0],
    ["d6", 1, 6],
    ["2d6", 2, 12],
  ])("result of rolling %s is between %s and %s", (v, low, high) => {
    for (let i = 0; i < 10; i++) {
      const res = Number(rollTotal(v, []));
      expect(res).toBeGreaterThanOrEqual(low);
      expect(res).toBeLessThanOrEqual(high);
    }
  });

  test("a template with no variables works", () => {
    expect(rollTotal("=42", [])).toEqual("42");
  });

  test("a template with that uses env with numbers works", () => {
    expect(rollTotal("=1 + {{other}}", [["other", "1"]])).toEqual("2");
  });

  test("a template with that uses env with dice notation works", () => {
    const res = Number(rollTotal("=1 + {{other}}", [["other", "d4"]]));
    expect(res).toBeGreaterThanOrEqual(2);
    expect(res).toBeLessThanOrEqual(5);
  });

  test("wacky string concat stuff can not be done", () => {
    expect(render("=fl{{other}}2)", [["other", "oor(4"]])).toEqual("floor(42)");
    expect(rollTotal("=fl{{other}}2)", [["other", "oor(4"]])).toEqual("#ERROR?");
  });
});

test("_#-* can be used in variable names", () => {
  expect(render("={{hp#min}}", [["hp#min", "0"]])).toEqual("0");
  expect(render("={{hp_min}}", [["hp_min", "0"]])).toEqual("0");
  expect(render("={{hp-min}}", [["hp-min", "0"]])).toEqual("0");
  expect(render("={{hp*min}}", [["hp*min", "0"]])).toEqual("0");
});

test("d&d hp calculation from stats", () => {
  const res = rollTotal("={{level}} * (ceil(({{hit_die}} + 1) / 2) + {{con_mod}})", [
    ["level", "3"],
    ["hit_die", "10"],
    ["con_mod", "=floor( ({{con}} - 10) / 2 )"],
    ["con", "13"],
  ]);

  const level = 3;
  const hitDie = 10;
  const con = 13;
  const conMod = Math.floor((con - 10) / 2);
  expect(res).toEqual(`${level * (Math.ceil((hitDie + 1) / 2) + conMod)}`);
});
