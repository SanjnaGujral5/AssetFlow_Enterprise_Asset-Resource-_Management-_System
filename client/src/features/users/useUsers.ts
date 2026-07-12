import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../lib/apiClient";
import { User, Role } from "../../types";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await apiClient.get<User[]>("/users");
      return data;
    },
  });
}

export function useUpdateUserRoleDept() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, role, departmentId }: { id: string; role?: Role; departmentId?: string }) => {
      const { data } = await apiClient.patch<User>(`/users/${id}/role-dept`, {
        role,
        departmentId,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
