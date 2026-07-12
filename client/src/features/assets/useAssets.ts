import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../lib/apiClient";
import { Asset, PaginatedResponse } from "../../types";

export interface AssetQueryParams {
  search?: string;
  status?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
}

export function useAssets(params: AssetQueryParams = {}) {
  return useQuery({
    queryKey: ["assets", params],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Asset>>(
        "/assets",
        { params }
      );
      return data;
    },
  });
}

export function useAsset(id: string | null) {
  return useQuery({
    queryKey: ["asset", id],
    queryFn: async () => {
      const { data } = await apiClient.get<Asset>(`/assets/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Record<string, unknown>) => {
      const { data } = await apiClient.post<Asset>("/assets", input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });
}

export function useUpdateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: Record<string, unknown> & { id: string }) => {
      const { data } = await apiClient.patch<Asset>(`/assets/${id}`, input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });
}

export function useDeleteAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete<Asset>(`/assets/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });
}
