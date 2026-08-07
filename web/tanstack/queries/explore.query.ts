import { useQuery } from "@tanstack/react-query";
import { ExploreService } from "@/services/explore.service";

export function useExploreSearch(query: string, type?: string) {
    return useQuery({
        queryKey: ["explore", "search", query, type],
        queryFn: () => ExploreService.search(query, type),
        enabled: query.trim().length > 0 || type === "PHOTO" || type === "MUSIC",
        staleTime: 5 * 60 * 1000, // 5 minutes cache
    });
}
