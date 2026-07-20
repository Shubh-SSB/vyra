import { useQuery } from "@tanstack/react-query"
import { UserService } from "@/services/user.service"

export const useSearchUsers = (query: string) => {
    return useQuery({
        queryKey: ["users", "search", query],
        queryFn: async () => {
            const res = await UserService.search(query)
            return res.data;
        },
        enabled: query.trim().length >= 2,
    })
}

export const useProfile = (username: string) => {
    return useQuery({
        queryKey: ["users", "profile", username],
        queryFn: async () => {
            const res = await UserService.getProfile(username);
            return res.data;
        },
    })
}