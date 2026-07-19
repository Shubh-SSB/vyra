import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { queryKeys } from "../query-keys";

export function useMe() {
    return useQuery({
        queryKey: queryKeys.me,
        queryFn: () => authService.me(),
    })
}