import { useMutation, useQueryClient } from "@tanstack/react-query";

import { login } from "@/api/auth-api";
import { getMe } from "@/api/me-api";
import type { LoginRequest } from "@/types/auth";
import type { MeResponse } from "@/types/user";

import { meKeys } from "./use-me";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: LoginRequest): Promise<MeResponse> => {
      await login(body);
      return getMe();
    },
    onSuccess: (me) => {
      queryClient.setQueryData(meKeys.all, me);
    },
  });
}
