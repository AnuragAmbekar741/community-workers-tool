import { useQuery } from "@tanstack/react-query";

import { getAnalytics } from "@/api/admin-api";
import type { AnalyticsFilters } from "@/types/analytics";

export const adminAnalyticsKeys = {
  all: ["admin", "analytics"] as const,
  list: (filters: AnalyticsFilters) =>
    [...adminAnalyticsKeys.all, filters] as const,
};

export function useAdminAnalytics(
  filters: AnalyticsFilters,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: adminAnalyticsKeys.list(filters),
    queryFn: () => getAnalytics(filters),
    enabled: options?.enabled ?? true,
  });
}
