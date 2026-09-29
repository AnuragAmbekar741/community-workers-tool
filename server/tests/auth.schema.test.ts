import { describe, expect, it } from "vitest";

import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../src/modules/auth/auth.schema.js";

describe("password recovery schemas", () => {
  it("accepts and trims a registered phone candidate", () => {
    const result = forgotPasswordSchema.safeParse({
      body: { phone: "  +26771234567  " },
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.body.phone).toBe("+26771234567");
    }
  });

  it("rejects an empty phone number", () => {
    expect(
      forgotPasswordSchema.safeParse({ body: { phone: "   " } }).success,
    ).toBe(false);
  });

  it("requires a reset token and an eight-character password", () => {
    expect(
      resetPasswordSchema.safeParse({
        body: { resetToken: "token", password: "new-pass" },
      }).success,
    ).toBe(true);
    expect(
      resetPasswordSchema.safeParse({
        body: { resetToken: "token", password: "short" },
      }).success,
    ).toBe(false);
  });
});
