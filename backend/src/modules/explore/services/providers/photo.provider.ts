import { RichObject } from "../../types/explore.types";

export class PhotoProvider {
    async search(query: string): Promise<RichObject[]> {
        const results: RichObject[] = [];
        const lower = query?.trim().toLowerCase();

        // 1. If we have a query, inject a custom seed image
        if (lower) {
            results.push({
                id: `picsum-seed-${encodeURIComponent(lower)}`,
                type: "PHOTO" as const,
                title: `Random Seeded: "${query}"`,
                subtitle: `picsum.photos/seed/${lower}`,
                image: `https://picsum.photos/seed/${encodeURIComponent(lower)}/600/400`,
                metadata: {
                    author: "Picsum Photos",
                    width: 600,
                    height: 400,
                    url: `https://picsum.photos/seed/${encodeURIComponent(lower)}/600/400`,
                },
                actions: {
                    open: `https://picsum.photos/seed/${encodeURIComponent(lower)}/600/400`,
                    share: true,
                }
            });
        }

        try {
            // Randomize page between 1 and 10 to fetch different random photos when query is empty
            const randomPage = lower ? 1 : Math.floor(Math.random() * 10) + 1;
            const url = `https://picsum.photos/v2/list?page=${randomPage}&limit=30`;
            
            const response = await fetch(url);
            if (!response.ok) {
                console.error("[Explore] Picsum fetch error:", response.statusText);
                return results;
            }

            const data = await response.json();
            if (!Array.isArray(data)) return results;

            // Map results
            const mapped = data.map((item: any) => ({
                id: `picsum-${item.id}`,
                type: "PHOTO" as const,
                title: `Photo by ${item.author || "Unknown"}`,
                subtitle: `picsum.photos/id/${item.id}`,
                image: `https://picsum.photos/id/${item.id}/600/400`,
                metadata: {
                    author: item.author || "Unknown",
                    width: item.width || 0,
                    height: item.height || 0,
                    url: item.download_url || `https://picsum.photos/id/${item.id}/600/400`,
                },
                actions: {
                    open: item.url || item.download_url,
                    share: true,
                }
            }));

            // If we have a search query, filter the picsum list by author name matching query
            if (lower) {
                const filtered = mapped.filter(item => 
                    item.metadata.author.toLowerCase().includes(lower)
                );
                return [...results, ...filtered];
            }

            return [...results, ...mapped];
        } catch (err) {
            console.error("[Explore] Picsum Photos search failed:", err);
            return results;
        }
    }
}
