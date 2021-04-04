export const round = (num: number, acc: number = 0): number => {
  if (num === 0) return 0;

  const m = Math.pow(10, acc);
  const res = Math.round((num + Number.EPSILON) * m) / m;
  const floored = Math.floor(res);

  if (res - floored <= 0.000000001) return floored;
  return res;
};
