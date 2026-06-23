import { describe, expect, it } from "vitest";

import {
  analyticsQuerySchema,
  createSessionSchema,
} from "../src/modules/sessions/sessions.schema.js";

const validSessionBody = {
  sessionDate: "2026-01-15",
  district: "gaborone",
  topic: "srh",
  durationMin: 60,
  nWomen: 5,
  nMen: 5,
  nGirls: 0,
  nBoys: 0,
  nElders: 0,
  nOthers: 0,
  referralsMade: false,
  nReferrals: 0,
};

describe("createSessionSchema referral rules", () => {
  it("accepts sessions without referrals", () => {
    const result = createSessionSchema.safeParse({ body: validSessionBody });
    expect(result.success).toBe(true);
  });

  it("requires nReferrals and referralReason when referrals were made", () => {
    const result = createSessionSchema.safeParse({
      body: {
        ...validSessionBody,
        referralsMade: true,
        nReferrals: 0,
        referralReason: "",
      },
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((issue) => issue.path.join("."));
      expect(paths).toContain("body.nReferrals");
      expect(paths).toContain("body.referralReason");
    }
  });

  it("accepts valid referral details", () => {
    const result = createSessionSchema.safeParse({
      body: {
        ...validSessionBody,
        referralsMade: true,
        nReferrals: 2,
        referralReason: "Referred to clinic",
      },
    });

    expect(result.success).toBe(true);
  });

  it("rejects nReferrals > 0 when referralsMade is false", () => {
    const result = createSessionSchema.safeParse({
      body: {
        ...validSessionBody,
        referralsMade: false,
        nReferrals: 1,
      },
    });

    expect(result.success).toBe(false);
  });
});

describe("analyticsQuerySchema", () => {
  it("accepts extended analytics filters", () => {
    const result = analyticsQuerySchema.safeParse({
      query: {
        from: "2026-01-01",
        to: "2026-12-31",
        district: "gaborone",
        workerId: "CW0001",
        topic: "srh",
        workerMonth: "2026-06",
      },
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid workerMonth format", () => {
    const result = analyticsQuerySchema.safeParse({
      query: {
        workerMonth: "2026-6",
      },
    });

    expect(result.success).toBe(false);
  });
});
