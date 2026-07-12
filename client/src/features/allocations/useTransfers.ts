import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../lib/apiClient";
import { TransferRequest, PaginatedResponse } from "../../types";

export interface TransferQueryParams {
  assetId?: string;
  status?: string;
  requestedById?: string;
  page?: number;
  limit?: number;
}

export function useTransfers(params: TransferQueryParams = {}) {
  return useQuery({
    queryKey: ["transfers", params],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<TransferRequest>>(
        "/transfers",
        { params }
      );
      return data;
    },
  });
}

export function useCreateTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      assetId: string;
      toUserId: string;
      reason?: string;
    }) => {
      const { data } = await apiClient.post<TransferRequest>(
        "/transfers",
        input
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
    },
  });
}

export function useApproveTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch<TransferRequest>(
        `/transfers/${id}/approve`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      queryClient.invalidateQueries({ queryKey: ["allocations"] });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });
}

export function useRejectTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch<TransferRequest>(
        `/transfers/${id}/reject`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
    },
  });
}
