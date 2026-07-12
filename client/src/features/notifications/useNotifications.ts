import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../lib/apiClient";
import { Notification, PaginatedResponse } from "../../types";

export function useNotifications(unreadOnly = false) {
  return useQuery({
    queryKey: ["notifications", { unreadOnly }],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Notification>>(
        "/notifications",
        { params: { unreadOnly: unreadOnly ? "true" : undefined } }
      );
      return data;
    },
    // Poll every 30 seconds for real-time-ish updates
    refetchInterval: 30000, 
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const { data } = await apiClient.get<{ count: number }>(
        "/notifications/unread-count"
      );
      return data;
    },
    refetchInterval: 30000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch<Notification>(
        `/notifications/${id}/read`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.patch<{ count: number }>(
        "/notifications/read-all"
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
