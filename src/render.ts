import { DiceRoller } from "@dice-roller/rpg-dice-roller";
import Mustache from "mustache";

const _r = (text: string): DiceRoller => {
  const d = new DiceRoller();
  d.roll(text);
  return d;
};

type MustacheCalc = () => string;
type MustacheFunction = () => (text: string, render: (v: string) => string) => string;
type MustacheValue = MustacheCalc | MustacheFunction | string;

const mTotal: MustacheFunction = () => (text, render) =>
  _r(render(text)).total.toString();

const mOutput: MustacheFunction = () => (text, render) =>
  _r(render(text)).output.toString();

const unescape = (template: string): [string, boolean] => {
  if (template.startsWith("=")) return [template.substring(1), true];
  if (template.startsWith("'=")) return [template.substring(1), false];
  return [template, false];
};

const render = (template: string, env: [string, MustacheValue][]): string => {
  const [unescaped, isTemplate] = unescape(template);
  if (!isTemplate) return unescaped;

  const view = { ...Object.fromEntries(env), total: mTotal, output: mOutput };

  return Mustache.render(unescaped, view, undefined, {
    escape: (text) => text,
  }).trim();
};

export const evaluate = (
  template: string,
  env: [string, string][] = []
): "#ERROR?" | string => {
  const envWithoutKey = (key: string) =>
    env.map(([k, v]): [string, string] => [k, k === key ? "#CYCLIC?" : v]);

  const view: [string, MustacheValue][] = env.map(([k, v]) => {
    // wrap value into a function that will render the value
    return [k, () => evaluate(v, envWithoutKey(k))];
  });

  try {
    return render(template, view);
  } catch (err) {
    console.error("failed to evaluate template", { template, env, view, err });
    return "#ERROR?";
  }
};

export const roll = (
  template: string,
  env: [string, string][] = []
): "#ERROR?" | DiceRoller => {
  const res = evaluate(template, env);
  if (res === "#ERROR?") return res;
  try {
    return _r(res);
  } catch (err) {
    console.error("failed to roll template", { template, env, res, err });
    return "#ERROR?";
  }
};
