import { RichObject } from "../../types/explore.types";

export class GithubProvider {
    async search(query: string): Promise<RichObject[]> {
        if (!query) return [];
        try {
            const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=10`;
            const response = await fetch(url, {
                headers: {
                    "User-Agent": "Vyra-App",
                    "Accept": "application/vnd.github.v3+json",
                }
            });

            if (!response.ok) {
                console.error("[Explore] GitHub search error:", response.statusText);
                return [];
            }

            const data = await response.json();
            if (!data.items || !Array.isArray(data.items)) return [];

            return data.items.map((item: any) => ({
                id: `github-${item.id}`,
                type: "GITHUB" as const,
                title: item.name || "Untitled",
                subtitle: item.owner?.login || "Unknown Owner",
                image: item.owner?.avatar_url || "",
                metadata: {
                    fullName: item.full_name || "",
                    stars: item.stargazers_count || 0,
                    forks: item.forks_count || 0,
                    language: item.language || "Unknown",
                    description: item.description || "No description provided.",
                    url: item.html_url || "",
                },
                actions: {
                    open: item.html_url,
                    share: true,
                },
            }));
        } catch (err) {
            console.error("[Explore] GitHub search failed:", err);
            return [];
        }
    }
}
