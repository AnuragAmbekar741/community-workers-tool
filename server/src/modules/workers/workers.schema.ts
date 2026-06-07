import { z } from "zod";
import {
  zDistrict,
  zEducation,
  zGender,
  zOrganisation,
  zVillage,
  zWorkerRole,
} from "../../constants/index.js";

export const registerWorkerBodySchema = z.object({
  name: z.string().min(1),
  age: z.number().int().positive(),
  gender: zGender,
  phone: z.string().min(1),
  password: z.string().min(8),
  organisation: zOrganisation,
  workerRole: zWorkerRole,
  education: zEducation,
  district: zDistrict,
  villages: z.array(zVillage).min(1),
  consentGiven: z.literal(true),
});

export type RegisterWorkerBody = z.infer<typeof registerWorkerBodySchema>;
