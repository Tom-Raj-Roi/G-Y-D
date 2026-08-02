import { describe, it, expect } from "vitest";
import { generateNumericOtp } from "./otp";

describe("generateNumericOtp", () => {
  it("creates an 8-digit numeric code", () => {
    const otp = generateNumericOtp(8);
    expect(otp).toMatch(/^\d{8}$/);
  });
});
