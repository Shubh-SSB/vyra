import { $crud } from "@/factory/crudFactory";

export interface RichObject {
    id: string;
    type: "MUSIC" | "MOVIE" | "TV" | "BOOK" | "GAME" | "GITHUB" | "AI_MODEL" | "PHOTO";
    title: string;
    subtitle: string;
    image: string;
    metadata: Record<string, any>;
    actions: Record<string, any>;
}

export const ExploreService = {
    async search(query: string, type?: string): Promise<RichObject[]> {
        const response = await $crud.get<RichObject[]>("explore/search", {
            params: { q: query, type: type || "" }
        });
        return response.data;
    },

    async getFullStream(title: string, artist: string): Promise<string | null> {
        try {
            const response = await $crud.get<{ url: string | null }>("explore/music/full-stream", {
                params: { title, artist }
            });
            return response.data?.url ?? null;
        } catch {
            return null;
        }
    },
};
