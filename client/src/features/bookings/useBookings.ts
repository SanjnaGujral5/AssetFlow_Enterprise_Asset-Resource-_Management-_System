import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../lib/apiClient";
import { Asset, Booking, PaginatedResponse } from "../../types";

export interface BookingQueryParams {
  resourceAssetId?: string;
  bookedById?: string;
  status?: string;
  date?: string;
  page?: number;
  limit?: number;
}

export function useBookings(params: BookingQueryParams = {}) {
  return useQuery({
    queryKey: ["bookings", params],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Booking>>(
        "/bookings",
        { params }
      );
      return data;
    },
  });
}

export function useBookableResources() {
  return useQuery({
    queryKey: ["bookings", "resources"],
    queryFn: async () => {
      const { data } = await apiClient.get<Asset[]>("/bookings/resources");
      return data;
    },
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      resourceAssetId: string;
      startTime: string;
      endTime: string;
      departmentId?: string;
    }) => {
      const { data } = await apiClient.post<Booking>("/bookings", input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch<Booking>(
        `/bookings/${id}/cancel`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}
