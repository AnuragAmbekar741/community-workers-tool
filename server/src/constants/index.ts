import { z } from "zod";

export const ORGANISATION = ["BONEPWA", "MAHALAYPEE"] as const;
export type Organisation = (typeof ORGANISATION)[number];

export const ROLE = ["worker", "supervisor", "admin"] as const;
export type Role = (typeof ROLE)[number];

export const GENDER = ["female", "male", "prefer_not_to_say"] as const;
export type Gender = (typeof GENDER)[number];

export const WORKER_ROLE = ["CDO", "SW", "CHW", "other"] as const;
export type WorkerRole = (typeof WORKER_ROLE)[number];

export const EDUCATION = [
  "none",
  "primary",
  "junior_sec",
  "senior_sec",
  "vocational",
  "diploma",
  "bachelors",
  "postgrad",
] as const;
export type Education = (typeof EDUCATION)[number];

export const VILLAGE = [
  "village_a",
  "village_b",
  "village_c",
  "village_d",
  "village_e",
] as const;
export type Village = (typeof VILLAGE)[number];

export const TOPIC = [
  "adolescence_youth_risk",
  "puberty_body_changes",
  "srh",
  "relationships_gender_norms",
  "consent_gbv",
  "safeguarding_reporting",
  "other",
] as const;
export type Topic = (typeof TOPIC)[number];

export const WORKER_STATUS = ["pending", "approved", "rejected"] as const;
export type WorkerStatus = (typeof WORKER_STATUS)[number];

export const zOrganisation = z.enum(ORGANISATION);
export const zRole = z.enum(ROLE);
export const zGender = z.enum(GENDER);
export const zWorkerRole = z.enum(WORKER_ROLE);
export const zEducation = z.enum(EDUCATION);
export const zVillage = z.enum(VILLAGE);
export const zTopic = z.enum(TOPIC);
export const zWorkerStatus = z.enum(WORKER_STATUS);

export const CONSTANTS = {
  organisation: ORGANISATION,
  role: ROLE,
  gender: GENDER,
  worker_role: WORKER_ROLE,
  education: EDUCATION,
  village: VILLAGE,
  topic: TOPIC,
  worker_status: WORKER_STATUS,
} as const;

export type Constants = typeof CONSTANTS;
export type ConstantKey = keyof Constants;
