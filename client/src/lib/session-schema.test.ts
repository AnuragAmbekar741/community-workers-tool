import { describe, expect, it } from "vitest";

import { sessionFormSchema } from "./session-schema";

const baseForm = {
  sessionDate: "2026-01-15",
  district: "gaborone",
  topic: "srh",
  topicOther: "",
  durationMin: "60",
  nWomen: "5",
  nMen: "5",
  nGirls: "0",
  nBoys: "0",
  nElders: "0",
  nOthers: "0",
  keyIssues: "",
  referralsMade: "no" as const,
  nReferrals: "",
  referralReason: "",
};

describe("sessionFormSchema referral rules", () => {
  it("accepts sessions without referrals", () => {
    const result = sessionFormSchema.safeParse(baseForm);
    expect(result.success).toBe(true);
  });

  it("requires referral count and reason when referrals were made", () => {
    const result = sessionFormSchema.safeParse({
      ...baseForm,
      referralsMade: "yes",
      nReferrals: "",
      referralReason: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((issue) => issue.path.join("."));
      expect(paths).toContain("nReferrals");
      expect(paths).toContain("referralReason");
    }
  });

  it("accepts valid referral details", () => {
    const result = sessionFormSchema.safeParse({
      ...baseForm,
      referralsMade: "yes",
      nReferrals: "2",
      referralReason: "Referred to clinic",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.referralsMade).toBe(true);
      expect(result.data.nReferrals).toBe(2);
    }
  });
});
