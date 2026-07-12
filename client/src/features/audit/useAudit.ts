import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../lib/apiClient";
import { AuditCycle, AuditItem, AuditResult } from "../../types";

export function useAuditCycles() {
  return useQuery({
    queryKey: ["audits"],
    queryFn: async () => {
      const { data } = await apiClient.get<AuditCycle[]>("/audits");
      return data;
    },
  });
}

export function useAuditCycle(id: string) {
  return useQuery({
    queryKey: ["audits", id],
    queryFn: async () => {
      const { data } = await apiClient.get<AuditCycle>(`/audits/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useAuditDiscrepancies(id: string) {
  return useQuery({
    queryKey: ["audits", id, "discrepancies"],
    queryFn: async () => {
      const { data } = await apiClient.get<AuditItem[]>(
        `/audits/${id}/discrepancies`
      );
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateAuditCycle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      scopeLocation?: string;
      startDate: string;
      endDate: string;
    }) => {
      const { data } = await apiClient.post<AuditCycle>("/audits", input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audits"] });
    },
  });
}

export function useVerifyAuditItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      result,
      notes,
    }: {
      itemId: string;
      result: AuditResult;
      notes?: string;
    }) => {
      const { data } = await apiClient.patch<AuditItem>(
        `/audits/items/${itemId}/verify`,
        { result, notes }
      );
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate both lists and detail views to refresh counts and status
      queryClient.invalidateQueries({ queryKey: ["audits"] });
    },
  });
}

export function useCloseAuditCycle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch<AuditCycle>(`/audits/${id}/close`);
      return data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["audits"] });
    },
  });
}
