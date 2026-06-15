import type { MeResponse } from "@/types/user";

import { api } from "./client";

export async function getMe(): Promise<MeResponse> {
  const { data } = await api.get<MeResponse>("/me");
  return data;
}
