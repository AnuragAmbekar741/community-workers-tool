import { z } from "zod";

import type { CreateSessionRequest, SessionDto } from "@/types/session";

import { DISTRICT, TOPIC, type District } from "./constants";

function requiredEnum<const T extends readonly [string, ...string[]]>(
  values: T,
  message: string,
) {
  return z
    .union([z.literal(""), z.enum(values)])
    .transform((value, ctx) => {
      if (value === "") {
        ctx.addIssue({ code: "custom", message });
        return z.NEVER;
      }
      return value;
    });
}

function requiredCountField(emptyMessage: string) {
  return z.string().trim().transform((value, ctx) => {
    if (value === "") {
      ctx.addIssue({ code: "custom", message: emptyMessage });
      return z.NEVER;
    }

    const parsed = Number(value);
    if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed < 0) {
      ctx.addIssue({ code: "custom", message: "Must be 0 or more" });
      return z.NEVER;
    }

    return parsed;
  });
}

function requiredDurationField() {
  return z.string().trim().transform((value, ctx) => {
    if (value === "") {
      ctx.addIssue({ code: "custom", message: "Duration is required" });
      return z.NEVER;
    }

    const parsed = Number(value);
    if (!Number.isFinite(parsed) || !Number.isInteger(parsed)) {
      ctx.addIssue({ code: "custom", message: "Duration must be a whole number" });
      return z.NEVER;
    }

    if (parsed < 10) {
      ctx.addIssue({ code: "custom", message: "Minimum 10 minutes" });
      return z.NEVER;
    }

    if (parsed > 300) {
      ctx.addIssue({ code: "custom", message: "Maximum 300 minutes" });
      return z.NEVER;
    }

    return parsed;
  });
}

function requiredYesNoField(message: string) {
  return z
    .union([z.literal(""), z.literal("yes"), z.literal("no")])
    .transform((value, ctx) => {
      if (value === "") {
        ctx.addIssue({ code: "custom", message });
        return z.NEVER;
      }
      return value === "yes";
    });
}

function referralCountField() {
  return z.string().trim().transform((value, ctx) => {
    if (value === "") {
      return 0;
    }

    const parsed = Number(value);
    if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed < 0) {
      ctx.addIssue({ code: "custom", message: "Must be 0 or more" });
      return z.NEVER;
    }

    return parsed;
  });
}

const sessionFormBaseSchema = z.object({
  sessionDate: z.string().min(1, "Session date is required"),
  district: requiredEnum(DISTRICT, "District is required"),
  topic: requiredEnum(TOPIC, "Topic is required"),
  topicOther: z.string().optional(),
  durationMin: requiredDurationField(),
  nWomen: requiredCountField("Enter 0 if there were no women"),
  nMen: requiredCountField("Enter 0 if there were no men"),
  nGirls: requiredCountField("Enter 0 if there were no girls"),
  nBoys: requiredCountField("Enter 0 if there were no boys"),
  nElders: requiredCountField("Enter 0 if there were no elders"),
  nOthers: requiredCountField("Enter 0 if there were no others"),
  keyIssues: z.string().optional(),
  referralsMade: requiredYesNoField(
    "Please select whether referrals were made",
  ),
  nReferrals: referralCountField(),
  referralReason: z.string().optional(),
});

export const sessionFormSchema = sessionFormBaseSchema.superRefine(
  (data, ctx) => {
    if (data.topic === "other" && !data.topicOther?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Please describe the topic",
        path: ["topicOther"],
      });
    }

    if (data.referralsMade) {
      if (data.nReferrals < 1) {
        ctx.addIssue({
          code: "custom",
          message: "Number of referrals must be at least 1",
          path: ["nReferrals"],
        });
      }
      if (!data.referralReason?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Reason for referral is required",
          path: ["referralReason"],
        });
      }
    }

    const total = computeTotalReached(data);

    if (total <= 0) {
      ctx.addIssue({
        code: "custom",
        message: "At least one participant count must be greater than 0",
        path: ["nWomen"],
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [year, month, day] = data.sessionDate.split("-").map(Number);
    if (year && month && day) {
      const sessionDay = new Date(year, month - 1, day);
      if (sessionDay > today) {
        ctx.addIssue({
          code: "custom",
          message: "Session date cannot be in the future",
          path: ["sessionDate"],
        });
      }
    }
  },
);

export type SessionFormValues = z.output<typeof sessionFormSchema>;

export type SessionFormInput = z.input<typeof sessionFormBaseSchema>;

export function sessionFormDefaultValues(
  defaultDistrict?: District,
): SessionFormInput {
  return {
    sessionDate: "",
    district: defaultDistrict ?? "",
    topic: "",
    topicOther: "",
    durationMin: "",
    nWomen: "",
    nMen: "",
    nGirls: "",
    nBoys: "",
    nElders: "",
    nOthers: "",
    keyIssues: "",
    referralsMade: "",
    nReferrals: "",
    referralReason: "",
  };
}

export function toCreateSessionRequest(
  values: SessionFormValues,
): CreateSessionRequest {
  return {
    sessionDate: values.sessionDate,
    district: values.district,
    topic: values.topic,
    topicOther: values.topic === "other" ? values.topicOther?.trim() : undefined,
    durationMin: values.durationMin,
    nWomen: values.nWomen,
    nMen: values.nMen,
    nGirls: values.nGirls,
    nBoys: values.nBoys,
    nElders: values.nElders,
    nOthers: values.nOthers,
    keyIssues: values.keyIssues?.trim() || undefined,
    referralsMade: values.referralsMade,
    nReferrals: values.referralsMade ? values.nReferrals : 0,
    referralReason: values.referralsMade
      ? values.referralReason?.trim()
      : undefined,
  };
}

export function toSessionFormValues(session: SessionDto): SessionFormInput {
  return {
    sessionDate: session.sessionDate,
    district: session.district,
    topic: session.topic,
    topicOther: session.topicOther ?? "",
    durationMin: String(session.durationMin),
    nWomen: String(session.nWomen),
    nMen: String(session.nMen),
    nGirls: String(session.nGirls),
    nBoys: String(session.nBoys),
    nElders: String(session.nElders),
    nOthers: String(session.nOthers),
    keyIssues: session.keyIssues ?? "",
    referralsMade: session.referralsMade ? "yes" : "no",
    nReferrals: session.referralsMade ? String(session.nReferrals) : "",
    referralReason: session.referralReason ?? "",
  };
}

export function computeTotalReached(values: {
  nWomen?: number;
  nMen?: number;
  nGirls?: number;
  nBoys?: number;
  nElders?: number;
  nOthers?: number;
}): number {
  return (
    (values.nWomen ?? 0) +
    (values.nMen ?? 0) +
    (values.nGirls ?? 0) +
    (values.nBoys ?? 0) +
    (values.nElders ?? 0) +
    (values.nOthers ?? 0)
  );
}

export function createSessionFormSchema() {
  return sessionFormSchema;
}
