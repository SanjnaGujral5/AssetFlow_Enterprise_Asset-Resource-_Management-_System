import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../../lib/apiClient";
import { useAuthStore } from "../../store/authStore";
import { AuthResponse } from "../../types";

interface LoginInput {
  email: string;
  password: string;
}

interface SignupInput {
  name: string;
  email: string;
  password: string;
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const { data } = await apiClient.post<AuthResponse>("/auth/login", input);
      return data;
    },
    onSuccess: (data) => {
      setAuth(data.token, data.user);
    },
  });
}

export function useSignup() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: async (input: SignupInput) => {
      const { data } = await apiClient.post<AuthResponse>("/auth/signup", input);
      return data;
    },
    onSuccess: (data) => {
      setAuth(data.token, data.user);
    },
  });
}
