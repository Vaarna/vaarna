export const round = (num: number, acc: number = 0): number => {
  if (num === 0) return 0;
  let m = Math.pow(10, acc);
  return Math.round((num + Number.EPSILON) * m) / m;
};
