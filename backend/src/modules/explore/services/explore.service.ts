import { Injectable } from "@nestjs/common";
import { RichObject } from "../types/explore.types";
import { MusicProvider } from "./providers/music.provider";
import { MovieTvProvider } from "./providers/movie-tv.provider";
import { BookProvider } from "./providers/book.provider";
import { GameProvider } from "./providers/game.provider";
import { GithubProvider } from "./providers/github.provider";
import { HuggingFaceProvider } from "./providers/huggingface.provider";
import { PhotoProvider } from "./providers/photo.provider";

@Injectable()
export class ExploreService {
    private readonly musicProvider = new MusicProvider();
    private readonly movieTvProvider = new MovieTvProvider();
    private readonly bookProvider = new BookProvider();
    private readonly gameProvider = new GameProvider();
    private readonly githubProvider = new GithubProvider();
    private readonly huggingFaceProvider = new HuggingFaceProvider();
    private readonly photoProvider = new PhotoProvider();

    async search(query: string, type?: string): Promise<RichObject[]> {
        const normalizedQuery = query?.trim() || "";
        const upperType = type?.toUpperCase();

        // If specific provider type is requested, run only that one
        if (upperType) {
            switch (upperType) {
                case "MUSIC":
                    return this.musicProvider.search(normalizedQuery);
                case "GITHUB":
                    return this.githubProvider.search(normalizedQuery);
                case "AI_MODEL":
                    return this.huggingFaceProvider.search(normalizedQuery);
                default:
                    return [];
            }
        }

        // Run active search providers (Music, AI Models, GitHub) in parallel
        try {
            const [music, hf, github] = await Promise.all([
                this.musicProvider.search(normalizedQuery).catch(() => []),
                this.huggingFaceProvider.search(normalizedQuery).catch(() => []),
                this.githubProvider.search(normalizedQuery).catch(() => []),
            ]);

            return [
                ...music.slice(0, 6),
                ...hf.slice(0, 6),
                ...github.slice(0, 6),
            ];
        } catch (err) {
            console.error("[ExploreService] Universal search failed:", err);
            return [];
        }
    }

    async getFullMusicStream(title: string, artist: string): Promise<string | null> {
        return this.musicProvider.getFullStream(title, artist);
    }
}
