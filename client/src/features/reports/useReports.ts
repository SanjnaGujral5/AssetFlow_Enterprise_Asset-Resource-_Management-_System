import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../lib/apiClient";
import { DashboardMetrics } from "../../types";

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ["reports", "dashboard"],
    queryFn: async () => {
      const { data } = await apiClient.get<DashboardMetrics>(
        "/reports/dashboard"
      );
      return data;
    },
  });
}
