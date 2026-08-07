import { MusicCard } from "./music-card";
import { MovieTvCard } from "./movie-tv-card";
import { BookCard } from "./book-card";
import { GameCard } from "./game-card";
import { GithubCard } from "./github-card";
import { AiModelCard } from "./ai-model-card";
import { PhotoCard } from "./photo-card";
import { GenericExploreCard } from "./generic-explore-card";

interface ExploreCardProps {
    item: any;
    onShare: (item: any) => void;
    isPlaying: boolean;
    onPlayToggle: (id: string, previewUrl: string) => void;
}

export default function ExploreCard({ item, onShare, isPlaying, onPlayToggle }: ExploreCardProps) {
    switch (item.type) {
        case "MUSIC":
            return <MusicCard item={item} onShare={onShare} isPlaying={isPlaying} onPlayToggle={onPlayToggle} />;
        case "MOVIE":
        case "TV":
            return <MovieTvCard item={item} onShare={onShare} />;
        case "BOOK":
            return <BookCard item={item} onShare={onShare} />;
        case "GAME":
            return <GameCard item={item} onShare={onShare} />;
        case "GITHUB":
            return <GithubCard item={item} onShare={onShare} />;
        case "AI_MODEL":
            return <AiModelCard item={item} onShare={onShare} />;
        case "PHOTO":
            return <PhotoCard item={item} onShare={onShare} />;
        default:
            return <GenericExploreCard item={item} onShare={onShare} />;
    }
}
