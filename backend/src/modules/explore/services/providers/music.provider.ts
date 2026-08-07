import { RichObject } from "../../types/explore.types";

export class MusicProvider {
    async search(query: string): Promise<RichObject[]> {
        const searchTerm = query.trim() || "trending hits";
        try {
            const url = `https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm)}&media=music&entity=song&limit=10`;
            const response = await fetch(url, {
                headers: { "User-Agent": "Vyra-App" }
            });

            if (!response.ok) {
                console.error("[Explore] iTunes fetch error:", response.statusText);
                return [];
            }

            const data = await response.json();
            if (!data.results || !Array.isArray(data.results)) return [];

            return data.results.map((track: any) => {
                const durationSeconds = track.trackTimeMillis 
                    ? Math.round(track.trackTimeMillis / 1000) 
                    : null;

                const imageUrl = track.artworkUrl100
                    ? track.artworkUrl100.replace("100x100bb", "500x500bb")
                    : "";

                return {
                    id: `itunes-${track.trackId}`,
                    type: "MUSIC" as const,
                    title: track.trackName || "Unknown Song",
                    subtitle: track.artistName || "Unknown Artist",
                    image: imageUrl,
                    metadata: {
                        preview: track.previewUrl || "",
                        duration: durationSeconds,
                        album: track.collectionName || "",
                        genre: track.primaryGenreName || "",
                        release_date: track.releaseDate || "",
                    },
                    actions: { share: true },
                };
            });
        } catch (err) {
            console.error("[Explore] iTunes search failed:", err);
            return [];
        }
    }

    async getFullStream(title: string, artist: string): Promise<string | null> {
        try {
            const searchTerm = `${title} ${artist}`;
            const url = `https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm)}&media=music&entity=song&limit=1`;
            const response = await fetch(url, {
                headers: { "User-Agent": "Vyra-App" }
            });

            if (!response.ok) return null;
            const data = await response.json();
            if (data.results && data.results.length > 0) {
                return data.results[0].previewUrl || null;
            }
            return null;
        } catch (err) {
            console.error("[Explore] iTunes getFullStream failed:", err);
            return null;
        }
    }
}
