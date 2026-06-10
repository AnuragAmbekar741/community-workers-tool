import { useQuery } from "@tanstack/react-query";

import { getMe } from "@/api/me-api";

export const meKeys = {
  all: ["me"] as const,
};

export function useMe() {
  return useQuery({
    queryKey: meKeys.all,
    queryFn: getMe,
    retry: false,
  });
}
