import { z } from "zod";
import { unionMembers } from "./zod";

describe("unionMembers", () => {
  test("works with string literals", () => {
    const t = z.union([z.literal("a"), z.literal("b")]);
    expect(unionMembers(t)).toEqual(["a", "b"]);
  });

  test("works with number literals", () => {
    const t = z.union([z.literal(1), z.literal(2)]);
    expect(unionMembers(t)).toEqual([1, 2]);
  });

  test("works with boolean literals", () => {
    const t = z.union([z.literal(true), z.literal(false)]);
    expect(unionMembers(t)).toEqual([true, false]);
  });

  test("works with mixed literals", () => {
    const t = z.union([z.literal("a"), z.literal(1), z.literal(true)]);
    expect(unionMembers(t)).toEqual(["a", 1, true]);
  });

  test("does not deduplicate members", () => {
    const t = z.union([z.literal("a"), z.literal("a")]);
    expect(unionMembers(t)).toEqual(["a", "a"]);
  });
});
