import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { queryKeys } from "../query-keys";

export function useMe() {
    return useQuery({
        queryKey: queryKeys.me,
        queryFn: () => authService.me(),
        staleTime: Infinity, // Keep cached user profile fresh indefinitely (manually invalidated on profile/username changes)
    })
}