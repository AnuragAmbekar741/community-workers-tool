import { describe, expect, it } from "vitest";

import { confirmPhoneSchema, newPasswordSchema } from "./password-reset-schema";

describe("password reset forms", () => {
  it("trims a phone number", () => {
    const result = confirmPhoneSchema.parse({ phone: "  +26771234567  " });
    expect(result.phone).toBe("+26771234567");
  });

  it("requires matching passwords", () => {
    const result = newPasswordSchema.safeParse({
      password: "new-password",
      confirmPassword: "different-password",
    });
    expect(result.success).toBe(false);
  });

  it("accepts matching passwords with at least eight characters", () => {
    const result = newPasswordSchema.safeParse({
      password: "new-password",
      confirmPassword: "new-password",
    });
    expect(result.success).toBe(true);
  });
});
