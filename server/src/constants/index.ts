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

export const DISTRICT = [
  "gaborone",
  "francistown",
  "lobatse",
  "selibe_phikwe",
  "orapa",
  "jwaneng",
  "sowa_town",
  "kanye_moshupa",
  "barolong",
  "ngwaketse_west",
  "south_east",
  "kweneng_east",
  "kweneng_west",
  "kgatleng",
  "serowe_palapye",
  "central_mahalapye",
  "central_bobonong",
  "central_boteti",
  "central_tutume",
  "north_east",
  "ngamiland_east",
  "ngamiland_west",
  "chobe",
  "delta",
  "ghanzi",
  "central_kalahari_game_reserve",
  "kgalagadi_south",
  "kgalagadi_north",
] as const;
export type District = (typeof DISTRICT)[number];

export const TOPIC = [
  "adolescence_youth_risk",
  "puberty_body_changes",
  "srh",
  "relationships_gender_norms",
  "consent_gbv",
  "safeguarding_reporting",
  "human_body_changes",
  "puberty",
  "menstruation",
  "hiv_sti_prevention",
  "reproduction_contraceptives",
  "relationships",
  "power_consent",
  "gender",
  "violence",
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
export const zDistrict = z.enum(DISTRICT);
export const zTopic = z.enum(TOPIC);
export const zWorkerStatus = z.enum(WORKER_STATUS);

export const CONSTANTS = {
  organisation: ORGANISATION,
  role: ROLE,
  gender: GENDER,
  worker_role: WORKER_ROLE,
  education: EDUCATION,
  village: VILLAGE,
  district: DISTRICT,
  topic: TOPIC,
  worker_status: WORKER_STATUS,
} as const;

export type Constants = typeof CONSTANTS;
export type ConstantKey = keyof Constants;
