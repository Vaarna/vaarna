type ParenValue = "L" | "R";
export type Paren = { type: "PAREN"; value: ParenValue };
export const Paren = (value: ParenValue): Paren => ({ type: "PAREN", value });
export const ParenL = Paren("L");
export const ParenR = Paren("R");

export type Num = { type: "NUMBER"; value: number };
export const Num = (value: number): Num => ({ type: "NUMBER", value });

type OpValue = "PLUS" | "MINUS" | "DICE";
export type Op = { type: "OPERATOR"; value: OpValue };
export const Op = (value: OpValue): Op => ({ type: "OPERATOR", value });
export const OpPlus = Op("PLUS");
export const OpMinus = Op("MINUS");
export const OpDice = Op("DICE");

export type Token = Paren | Num | Op;

export function tokenize(v: string): Token[] {
  const out: Token[] = [];

  let numBuf: string[] = [];
  const f = () => {
    if (numBuf.length === 0) return;

    out.push(Num(parseInt(numBuf.join(""))));
    numBuf = [];
  };

  for (const c of v) {
    let numHandled = false;
    let val: Token | undefined = undefined;
    switch (c) {
      case "(":
        val = ParenL;
        break;
      case ")":
        val = ParenR;
        break;

      case "+":
        val = OpPlus;
        break;
      case "-":
        val = OpMinus;
        break;
      case "d":
        val = OpDice;
        break;

      case "0":
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
        numHandled = true;
        numBuf.push(c);
        break;

      default:
        break;
    }

    if (!numHandled) f();
    if (val !== undefined) out.push(val);
  }
  f();

  return out;
}
