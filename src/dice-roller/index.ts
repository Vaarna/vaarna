const simpleDiceRollRe = /(?<count>\d+)?d(?<sides>\d+)((?<sign>[+-])(?<mod>\d+))?/i;

type Dice = {
  count: number;
  sides: number;
};

type DiceResult = {
  result: number;
} & Dice;

type RollResult = {
  total: number;
  dice: DiceResult[];
}[];

export function roll(v: string): RollResult {
  const res = simpleDiceRollRe.exec(v)?.groups;

  if (res === undefined) {
    throw new Error("invalid input");
  }

  const count = parseInt(res?.count ?? "1", 10);
  const sides = parseInt(res?.sides ?? "1", 10);
  const sign = res?.sign ?? "+";
  const modAmount = parseInt(res?.mod ?? "0", 10);

  const rolls = new Array(count).fill(sides).map((v) => Math.ceil(Math.random() * v));
  const result = rolls.reduce((prev, cur) => prev + cur, 0);
  const dice = [{ count, sides, result }];

  let mod = 0;
  if (sign === "+") {
    mod += modAmount;
  } else if (sign === "-") {
    mod -= modAmount;
  }

  const total = result + mod;

  return [{ total, dice }];
}
