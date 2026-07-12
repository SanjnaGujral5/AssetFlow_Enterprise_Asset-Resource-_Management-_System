import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../lib/apiClient";
import { UserSummary } from "../../types";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await apiClient.get<UserSummary[]>("/users");
      return data;
    },
  });
}
