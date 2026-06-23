import { useQuery } from "@tanstack/react-query";

import { getAnalytics } from "@/api/supervisor-api";
import type { AnalyticsFilters } from "@/types/analytics";

export const supervisorAnalyticsKeys = {
  all: ["supervisor", "analytics"] as const,
  list: (filters: AnalyticsFilters) =>
    [...supervisorAnalyticsKeys.all, filters] as const,
};

export function useSupervisorAnalytics(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: supervisorAnalyticsKeys.list(filters),
    queryFn: () => getAnalytics(filters),
  });
}
