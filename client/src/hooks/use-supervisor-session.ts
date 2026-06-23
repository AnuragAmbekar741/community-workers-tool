import { useQuery } from "@tanstack/react-query";

import { getSession } from "@/api/supervisor-api";

import { supervisorKeys } from "./use-supervisor-workers";

export function useSupervisorSession(sessionId: string) {
  return useQuery({
    queryKey: supervisorKeys.session(sessionId),
    queryFn: () => getSession(sessionId),
    enabled: Boolean(sessionId),
  });
}
