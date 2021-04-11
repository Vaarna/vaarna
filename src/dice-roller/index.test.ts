import fc from "fast-check";
import { roll } from "./index";

test.each([
  ["d1", 1, 1],
  ["d1+1", 2, 2],
  ["d1-1", 0, 0],
  ["d6", 1, 6],
  ["2d6", 2, 12],
])("result of rolling %s is between %s and %s", (v, low, high) => {
  for (let i = 0; i < 10; i++) {
    const ress = roll(v);
    expect(ress).toHaveLength(1);
    const res = ress[0];
    expect(res.total).toBeGreaterThanOrEqual(low);
    expect(res.total).toBeLessThanOrEqual(high);
  }
});

test.each([
  ["d6", /d6 = [1-6] \(d6 = [1-6]\)/],
  ["2d6", /2d6 = ([2-9]|1[0-2]) \(d6 = [1-6], d6 = [1-6]\)/],
  ["d4+1", /d4\+1 = [2-5] \(d4 = [1-4]\)/],
  ["2d4+1", /2d4\+1 = [3-9] \(d4 = [1-4], d4 = [1-4]\)/],
  ["d4-1", /d4-1 = [0-3] \(d4 = [1-4]\)/],
  ["2d4-1", /2d4-1 = [1-7] \(d4 = [1-4], d4 = [1-4]\)/],
])("toString of rolling %s should match %s", (v, re) => {
  const res = roll(v).toString();
  expect(res).toMatch(re);
});

test("the most common result of rolling 2d6 10 000 times is 7", () => {
  const rolls = [];
  for (let i = 0; i < 10_000; i++) {
    const res = roll("2d6");
    expect(res).toHaveLength(1);
    rolls.push(res[0].total);
  }

  const counts: Record<number, number | undefined> = {};
  rolls.forEach((roll) => {
    counts[roll] = (counts[roll] ?? 0) + 1;
  });

  const sevens = counts[7];
  expect(sevens).not.toBeUndefined();
  Object.values(counts).forEach((count) => {
    expect(count).toBeLessThanOrEqual(sevens as number);
  });
});

test("result of rolling an N-sided dice is between 1 and N", () => {
  fc.assert(
    fc.property(fc.integer(1, Number.MAX_SAFE_INTEGER), (n) => {
      const ress = roll(`d${n}`);
      expect(ress).toHaveLength(1);
      const res = ress[0];
      expect(res.total).toBeGreaterThanOrEqual(1);
      expect(res.total).toBeLessThanOrEqual(n);
    })
  );
});

test("result of rolling K N-sided dice is between K and K*N", () => {
  fc.assert(
    fc.property(
      fc.integer(1, 2 ** 16),
      fc.integer(1, Number.MAX_SAFE_INTEGER),
      (k, n) => {
        const ress = roll(`${k}d${n}`);
        expect(ress).toHaveLength(1);
        const res = ress[0];
        expect(res.total).toBeGreaterThanOrEqual(k);
        expect(res.total).toBeLessThanOrEqual(k * n);
      }
    )
  );
});

test("result of rolling K N-sided dice modified by M is between K+M and K*N+M", () => {
  fc.assert(
    fc.property(
      fc.integer(1, 2 ** 16),
      fc.integer(1, Number.MAX_SAFE_INTEGER),
      fc.integer(),
      (k, n, m) => {
        const ress = m > 0 ? roll(`${k}d${n}+${m}`) : roll(`${k}d${n}-${-m}`);
        expect(ress).toHaveLength(1);
        const res = ress[0];
        expect(res.total).toBeGreaterThanOrEqual(k + m);
        expect(res.total).toBeLessThanOrEqual(k * n + m);
      }
    )
  );
});
