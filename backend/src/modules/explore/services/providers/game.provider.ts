import { RichObject } from "../../types/explore.types";

export class GameProvider {
    async search(query: string): Promise<RichObject[]> {
        if (!query) return [];

        const apiKey = process.env.RAWG_API_KEY;

        if (!apiKey) {
            // High-fidelity Mock fallback based on search term
            const capitalized = query.charAt(0).toUpperCase() + query.slice(1);
            return [
                {
                    id: `rawg-mock-1`,
                    type: "GAME" as const,
                    title: `${capitalized}: Ragnarok`,
                    subtitle: "2023 • PlayStation 5 / PC / Xbox",
                    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=60",
                    metadata: {
                        rating: 9.3,
                        platforms: ["PC", "PlayStation 5", "Xbox Series X"],
                        release_date: "2023-11-09",
                    },
                    actions: { share: true },
                },
                {
                    id: `rawg-mock-2`,
                    type: "GAME" as const,
                    title: `${capitalized} Chronicles`,
                    subtitle: "2022 • PC / Switch",
                    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=60",
                    metadata: {
                        rating: 8.6,
                        platforms: ["Nintendo Switch", "PC"],
                        release_date: "2022-07-29",
                    },
                    actions: { share: true },
                }
            ];
        }

        try {
            const url = `https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(query)}&page_size=10`;
            const response = await fetch(url);

            if (!response.ok) {
                console.error("[Explore] RAWG fetch error:", response.statusText);
                return [];
            }

            const data = await response.json();
            if (!data.results || !Array.isArray(data.results)) return [];

            return data.results.map((item: any) => {
                const platforms = item.platforms 
                    ? item.platforms.map((p: any) => p.platform.name) 
                    : [];

                return {
                    id: `rawg-${item.id}`,
                    type: "GAME" as const,
                    title: item.name || "Unknown Game",
                    subtitle: item.released ? `${item.released.split("-")[0]} • Game` : "Game",
                    image: item.background_image || "",
                    metadata: {
                        rating: item.rating || 0,
                        platforms,
                        release_date: item.released || "",
                    },
                    actions: { share: true },
                };
            });
        } catch (err) {
            console.error("[Explore] RAWG search failed:", err);
            return [];
        }
    }
}
