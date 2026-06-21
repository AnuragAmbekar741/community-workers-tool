import { useQuery } from "@tanstack/react-query";

import { listSessions } from "@/api/supervisor-api";

import { supervisorKeys } from "./use-supervisor-workers";

export function useSupervisorSessions() {
  return useQuery({
    queryKey: supervisorKeys.sessions(),
    queryFn: listSessions,
  });
}
