import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../lib/apiClient";
import { Asset, CreateAssetInput } from "../../types";

export function useBulkCreateAssets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateAssetInput[]) => {
      const { data } = await apiClient.post<{ count: number }>("/assets/bulk", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });
}
