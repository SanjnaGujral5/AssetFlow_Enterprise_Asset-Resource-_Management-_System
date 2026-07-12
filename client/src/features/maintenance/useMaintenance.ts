import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../lib/apiClient";
import { MaintenanceRequest, MaintenanceStatus } from "../../types";

export interface KanbanColumn {
  status: MaintenanceStatus;
  items: MaintenanceRequest[];
}

export function useMaintenanceKanban() {
  return useQuery({
    queryKey: ["maintenance", "kanban"],
    queryFn: async () => {
      const { data } = await apiClient.get<KanbanColumn[]>("/maintenance/kanban");
      return data;
    },
  });
}

export function useCreateMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      assetId: string;
      issueDescription: string;
      priority: string;
    }) => {
      const { data } = await apiClient.post<MaintenanceRequest>(
        "/maintenance",
        input
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance", "kanban"] });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });
}

export function useUpdateMaintenanceStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      technicianName,
    }: {
      id: string;
      status: MaintenanceStatus;
      technicianName?: string;
    }) => {
      const { data } = await apiClient.patch<MaintenanceRequest>(
        `/maintenance/${id}/status`,
        { status, technicianName }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance", "kanban"] });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });
}
