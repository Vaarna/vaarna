import fc from "fast-check";
import { roll } from "./index";

test.each([
  ["d1", 1, 1],
  ["d1+1", 2, 2],
  ["d1-1", 0, 0],
])("rolling %s results between %s and %s", (v, low, high) => {
  const ress = roll(v);
  expect(ress).toHaveLength(1);
  const res = ress[0];
  expect(res.total).toBeGreaterThanOrEqual(low);
  expect(res.total).toBeLessThanOrEqual(high);
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
