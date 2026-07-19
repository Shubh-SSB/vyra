import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { queryKeys } from "../query-keys";
import { useAuthStore } from "@/store/auth.store";
import { getAccessToken, clearTokens } from "@/lib/token";

export const useLoginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.login,

    onSuccess: async () => {
      const token = getAccessToken();

      useAuthStore.getState().setAccessToken(token);
      useAuthStore.getState().setAuthenticated(true);

      await queryClient.invalidateQueries({
        queryKey: queryKeys.me,
      });
    },
  });
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: authService.register,
  });
};

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout,

    onSuccess: () => {
      clearTokens();

      useAuthStore.getState().logout();

      queryClient.clear();
    },
  });
};

export const useLogoutAllMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logoutAll,

    onSuccess: () => {
      clearTokens();

      useAuthStore.getState().logout();

      queryClient.clear();
    },
  });
};