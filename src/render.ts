import { DiceRoller } from "@dice-roller/rpg-dice-roller";
import Mustache from "mustache";

const _render = (template: string, env: [string, string][], roll: boolean = true) => {
  let out = template;

  if (template.startsWith("=")) {
    const view = Object.fromEntries(
      env
        .map(([k, v]) => {
          if (!v.startsWith("=")) {
            if (v.startsWith("'=")) return [k, v.substring(1)];
            return [k, v];
          }

          return [
            k,
            () =>
              _render(
                v,
                env.map(([kInner, v]) => [kInner, k === kInner ? "#ERROR?" : v]),
                false
              ),
          ];
        })
        .reverse()
    );

    out = Mustache.render(template.substring(1), view, undefined, {
      escape: (text) => text,
    });
  }

  const d = new DiceRoller();

  try {
    d.roll(out);
    return roll ? d.output : d.total.toString();
  } catch (err) {
    console.error(err);
    return "#ERROR?";
  }
};

export const render = (template: string, env: [string, string][]): string =>
  _render(template, env, false);
export const roll = (template: string, env: [string, string][]): string =>
  _render(template, env, true);
