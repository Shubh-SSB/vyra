export interface RichObject {
    id: string;
    type: "MUSIC" | "MOVIE" | "TV" | "BOOK" | "GAME" | "GITHUB" | "AI_MODEL" | "PHOTO";
    title: string;
    subtitle: string;
    image: string;
    metadata: Record<string, any>;
    actions: Record<string, any>;
}
