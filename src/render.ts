import { DiceRoller } from "@dice-roller/rpg-dice-roller";
import Mustache from "mustache";

const unescape = (template: string): [string, boolean] => {
  if (template.startsWith("=")) return [template.substring(1), true];
  if (template.startsWith("'=")) return [template.substring(1), false];
  return [template, false];
};

const _impl = (
  template: string,
  env: [string, string][],
  f: (template: string, env: [string, string][]) => string
): string => {
  const envWithoutKey = (key: string) =>
    env.map(([k, v]): [string, string] => [k, key === k ? "#CYCLIC?" : v]);

  const view = Object.fromEntries(
    env.map(([k, v]) => {
      // wrap value into a function that will render the value
      return [k, () => f(v, envWithoutKey(k))];
    })
  );

  const [unescaped, isTemplate] = unescape(template);

  if (isTemplate) {
    try {
      return Mustache.render(unescaped, view, undefined, { escape: (text) => text });
    } catch (err) {
      return "#ERROR?";
    }
  }
  return unescaped;
};

export const render = (template: string, env: [string, string][]): string => {
  return _impl(template, env, render);
};

export const evaluate = (
  template: string,
  env: [string, string][]
): "#ERROR?" | string => {
  if (unescape(template)[0] === "") return "";

  const rendered = _impl(template, env, (template, env) => evaluate(template, env));
  const d = new DiceRoller();

  try {
    d.roll(rendered);
    return d.total.toString();
  } catch (err) {
    return "#ERROR?";
  }
};

export const roll = (template: string, env: [string, string][]): DiceRoller => {
  if (unescape(template)[0] === "") return new DiceRoller();

  const rendered = _impl(template, env, (template, env) =>
    roll(template, env).total.toString()
  );

  const d = new DiceRoller();
  d.roll(rendered);

  return d;
};
