import { z } from "zod";

import type { CreateSessionRequest } from "@/types/session";

import { TOPIC, VILLAGE, type Topic, type Village } from "./constants";

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

const attendanceField = z.coerce
  .number({ error: "Required" })
  .int("Must be a whole number")
  .min(0, "Must be 0 or more");

const sessionFormBaseSchema = z.object({
  sessionDate: z.string().min(1, "Session date is required"),
  village: requiredEnum(VILLAGE, "Village is required"),
  topic: requiredEnum(TOPIC, "Topic is required"),
  topicOther: z.string().optional(),
  durationMin: z.coerce
    .number({ error: "Duration is required" })
    .int("Duration must be a whole number")
    .min(10, "Minimum 10 minutes")
    .max(300, "Maximum 300 minutes"),
  nWomen: attendanceField,
  nMen: attendanceField,
  nGirls: attendanceField,
  nBoys: attendanceField,
  nElders: attendanceField,
  nOthers: attendanceField,
  keyIssues: z.string().optional(),
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

    const total =
      data.nWomen +
      data.nMen +
      data.nGirls +
      data.nBoys +
      data.nElders +
      data.nOthers;

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

export type SessionFormValues = {
  sessionDate: string;
  village: Village;
  topic: Topic;
  topicOther?: string;
  durationMin: number;
  nWomen: number;
  nMen: number;
  nGirls: number;
  nBoys: number;
  nElders: number;
  nOthers: number;
  keyIssues?: string;
};

export type SessionFormInput = z.input<typeof sessionFormSchema>;

export const sessionFormDefaultValues: SessionFormInput = {
  sessionDate: "",
  village: "",
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
};

export function toCreateSessionRequest(
  values: SessionFormValues,
): CreateSessionRequest {
  return {
    sessionDate: values.sessionDate,
    village: values.village,
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
  };
}

export function computeTotalReached(values: {
  nWomen: number;
  nMen: number;
  nGirls: number;
  nBoys: number;
  nElders: number;
  nOthers: number;
}): number {
  return (
    values.nWomen +
    values.nMen +
    values.nGirls +
    values.nBoys +
    values.nElders +
    values.nOthers
  );
}

export function createSessionFormSchema(allowedVillages: Village[]) {
  return sessionFormBaseSchema
    .superRefine((data, ctx) => {
      if (data.village && !allowedVillages.includes(data.village as Village)) {
        ctx.addIssue({
          code: "custom",
          message: "Village is not assigned to you",
          path: ["village"],
        });
      }
    })
    .superRefine((data, ctx) => {
      if (data.topic === "other" && !data.topicOther?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Please describe the topic",
          path: ["topicOther"],
        });
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
    });
}
