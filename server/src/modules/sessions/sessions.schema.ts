import { z } from "zod";
import { zTopic, zDistrict } from "../../constants/index.js";

const attendanceSchema = z.object({
  nWomen: z.number().int().min(0),
  nMen: z.number().int().min(0),
  nGirls: z.number().int().min(0),
  nBoys: z.number().int().min(0),
  nElders: z.number().int().min(0),
  nOthers: z.number().int().min(0),
});

const sessionBodySchema = z
  .object({
    sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    district: zDistrict,
    topic: zTopic,
    topicOther: z.string().optional(),
    durationMin: z.number().int().min(10).max(300),
    keyIssues: z.string().optional(),
    referralsMade: z.boolean(),
    nReferrals: z.number().int().min(0),
    referralReason: z.string().optional(),
  })
  .merge(attendanceSchema)
  .superRefine((data, ctx) => {
    if (data.topic === "other" && !data.topicOther?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "topicOther is required when topic is other",
        path: ["topicOther"],
      });
    }

    if (data.referralsMade) {
      if (data.nReferrals < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Number of referrals must be at least 1",
          path: ["nReferrals"],
        });
      }
      if (!data.referralReason?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Referral reason is required",
          path: ["referralReason"],
        });
      }
    } else if (data.nReferrals !== 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "nReferrals must be 0 when no referrals were made",
        path: ["nReferrals"],
      });
    }
  });

export const createSessionSchema = z.object({
  body: sessionBodySchema,
});

export const sessionParamsSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const updateSessionSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: sessionBodySchema,
});

export const analyticsQuerySchema = z.object({
  query: z.object({
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    district: zDistrict.optional(),
    workerId: z.string().min(1).optional(),
    topic: zTopic.optional(),
    workerMonth: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  }),
});

export type CreateSessionBody = z.infer<typeof createSessionSchema>["body"];
export type UpdateSessionBody = z.infer<typeof updateSessionSchema>["body"];
export type SessionParams = z.infer<typeof sessionParamsSchema>["params"];
export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>["query"];
