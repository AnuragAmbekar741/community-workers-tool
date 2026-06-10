import { useMutation, useQueryClient } from "@tanstack/react-query";

import { logout } from "@/api/auth-api";

import { meKeys } from "./use-me";

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      queryClient.removeQueries({ queryKey: meKeys.all });
    },
  });
}
