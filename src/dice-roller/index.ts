const simpleDiceRollRe =
  /^\s*(?<count>\d+)?\s*d\s*(?<sides>\d+)\s*(?<mod>[+-]\s*\d+)?\s*$/i;

class DiceResult {
  constructor(readonly result: number, readonly sides: number) {}

  toString(): string {
    return `d${this.sides} = ${this.result}`;
  }
}

class RollResult {
  constructor(
    readonly original: string,
    readonly total: number,
    readonly dice: DiceResult[]
  ) {}

  toString(): string {
    const dice = this.dice.map(String).join(", ");
    return `${this.original} = ${this.total} (${dice})`;
  }
}

export function roll(v: string): RollResult[] {
  const res = simpleDiceRollRe.exec(v)?.groups;

  if (res === undefined) {
    throw new Error("invalid input");
  }

  const count = parseInt(res?.count ?? "1", 10);
  const sides = parseInt(res?.sides ?? "1", 10);
  const mod = parseInt(res?.mod?.split(/\s*/).join("") ?? "0", 10);

  const rolls = new Array(count)
    .fill(sides)
    .map((v) => new DiceResult(Math.ceil(Math.random() * v), sides));
  const result = rolls.reduce((prev, cur) => prev + cur.result, 0);
  const total = result + mod;

  let formatted;
  if (count === 1) {
    formatted = `d${sides}`;
  } else {
    formatted = `${count}d${sides}`;
  }
  if (mod < 0) {
    formatted += ` - ${-mod}`;
  } else if (mod > 0) {
    formatted += ` + ${mod}`;
  }

  return [new RollResult(formatted, total, rolls)];
}
