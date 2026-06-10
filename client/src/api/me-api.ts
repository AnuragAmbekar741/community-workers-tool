import type { UserDto } from "@/types/user";

import { api } from "./client";

export async function getMe(): Promise<UserDto> {
  const { data } = await api.get<UserDto>("/me");
  return data;
}
