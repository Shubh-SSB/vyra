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
                    // Music is allowed to run with an empty query to return recommended trending tracks
                    return this.musicProvider.search(normalizedQuery);
                case "MOVIE":
                case "TV":
                    if (!normalizedQuery) return [];
                    return this.movieTvProvider.search(normalizedQuery);
                case "BOOK":
                    if (!normalizedQuery) return [];
                    return this.bookProvider.search(normalizedQuery);
                case "GAME":
                    if (!normalizedQuery) return [];
                    return this.gameProvider.search(normalizedQuery);
                case "GITHUB":
                    if (!normalizedQuery) return [];
                    return this.githubProvider.search(normalizedQuery);
                case "AI_MODEL":
                    if (!normalizedQuery) return [];
                    return this.huggingFaceProvider.search(normalizedQuery);
                case "PHOTO":
                    // Photos are allowed to run with an empty query to return random images
                    return this.photoProvider.search(normalizedQuery);
                default:
                    break;
            }
        }

        if (!normalizedQuery) return [];

        // Run all search providers in parallel
        try {
            const [music, movieTv, books, games, github, hf, photos] = await Promise.all([
                this.musicProvider.search(normalizedQuery).catch(() => []),
                this.movieTvProvider.search(normalizedQuery).catch(() => []),
                this.bookProvider.search(normalizedQuery).catch(() => []),
                this.gameProvider.search(normalizedQuery).catch(() => []),
                this.githubProvider.search(normalizedQuery).catch(() => []),
                this.huggingFaceProvider.search(normalizedQuery).catch(() => []),
                this.photoProvider.search(normalizedQuery).catch(() => []),
            ]);

            // Merge and return results (limited to 5 per category in unified view to avoid clutter)
            return [
                ...music.slice(0, 5),
                ...movieTv.slice(0, 5),
                ...books.slice(0, 5),
                ...games.slice(0, 5),
                ...github.slice(0, 5),
                ...hf.slice(0, 5),
                ...photos.slice(0, 5),
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
