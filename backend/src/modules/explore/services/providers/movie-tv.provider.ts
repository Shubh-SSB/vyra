import { RichObject } from "../../types/explore.types";

export class MovieTvProvider {
    async search(query: string): Promise<RichObject[]> {
        if (!query) return [];

        const apiKey = process.env.TMDB_API_KEY;

        if (!apiKey) {
            // High-fidelity Mock fallback based on search term
            const capitalized = query.charAt(0).toUpperCase() + query.slice(1);
            return [
                {
                    id: `tmdb-mock-1`,
                    type: "MOVIE" as const,
                    title: `${capitalized}: The Beginning`,
                    subtitle: "2024 • Action / Sci-Fi",
                    image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=60",
                    metadata: {
                        rating: 8.5,
                        overview: `An epic cinematic experience exploring ${query}. Featuring state-of-the-art visuals, intense action sequences, and stellar performances by an ensemble cast.`,
                        genres: ["Action", "Sci-Fi", "Drama"],
                        release_date: "2024-03-24",
                        cast: ["Christian Bale", "Cillian Murphy"],
                    },
                    actions: { share: true },
                },
                {
                    id: `tmdb-mock-2`,
                    type: "TV" as const,
                    title: `${capitalized} (Season 1)`,
                    subtitle: "2022 • Mystery / Drama",
                    image: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&auto=format&fit=crop&q=60",
                    metadata: {
                        rating: 7.9,
                        overview: `A suspenseful mystery thriller following investigators as they uncover dark secrets surrounding ${query}.`,
                        genres: ["Mystery", "Drama", "Thriller"],
                        release_date: "2022-10-14",
                        cast: ["Pedro Pascal", "Bella Ramsey"],
                    },
                    actions: { share: true },
                }
            ];
        }

        try {
            const url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}&page=1`;
            const response = await fetch(url);

            if (!response.ok) {
                console.error("[Explore] TMDB fetch error:", response.statusText);
                return [];
            }

            const data = await response.json();
            if (!data.results || !Array.isArray(data.results)) return [];

            return data.results
                .filter((item: any) => item.media_type === "movie" || item.media_type === "tv")
                .slice(0, 10)
                .map((item: any) => {
                    const isTv = item.media_type === "tv";
                    const title = item.title || item.name || "Untitled";
                    const releaseDate = item.release_date || item.first_air_date || "";
                    const year = releaseDate ? releaseDate.split("-")[0] : "";
                    const mediaLabel = isTv ? "TV Series" : "Movie";

                    return {
                        id: `tmdb-${item.id}`,
                        type: isTv ? ("TV" as const) : ("MOVIE" as const),
                        title,
                        subtitle: year ? `${year} • ${mediaLabel}` : mediaLabel,
                        image: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "",
                        metadata: {
                            rating: item.vote_average || 0,
                            overview: item.overview || "",
                            genres: item.genre_ids || [],
                            release_date: releaseDate,
                        },
                        actions: { share: true },
                    };
                });
        } catch (err) {
            console.error("[Explore] TMDB search failed:", err);
            return [];
        }
    }
}
