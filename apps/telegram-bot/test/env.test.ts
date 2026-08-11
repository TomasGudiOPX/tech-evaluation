import { describe, expect, it } from "vitest";
import { truncate } from "../src/lib/env.js";

describe("truncate", () => {
  it("keeps short text intact", () => {
    expect(truncate("hello", 100)).toBe("hello");
  });

  it("truncates long text and marks it", () => {
    const result = truncate("x".repeat(200), 10);
    expect(result.length).toBeLessThan(200);
    expect(result).toContain("(truncated)");
  });
});
