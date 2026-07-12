import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../lib/apiClient";
import { Allocation, PaginatedResponse } from "../../types";

export interface AllocationQueryParams {
  assetId?: string;
  holderUserId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export function useAllocations(params: AllocationQueryParams = {}) {
  return useQuery({
    queryKey: ["allocations", params],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Allocation>>(
        "/allocations",
        { params }
      );
      return data;
    },
  });
}

export function useCreateAllocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      assetId: string;
      holderUserId: string;
      holderDeptId?: string;
      expectedReturnDate?: string;
    }) => {
      const { data } = await apiClient.post<Allocation>("/allocations", input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allocations"] });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });
}

export function useReturnAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      returnConditionNotes,
    }: {
      id: string;
      returnConditionNotes?: string;
    }) => {
      const { data } = await apiClient.patch<Allocation>(
        `/allocations/${id}/return`,
        { returnConditionNotes }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allocations"] });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });
}
