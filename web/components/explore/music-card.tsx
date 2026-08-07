import { Disc2, Disc3, Play, Send, Pause } from "lucide-react"
import { PlayingDisc } from "./playing-disc";

interface MusicCardProps {
    item: any;
    onShare: (item: any) => void;
    isPlaying: boolean;
    onPlayToggle: (id: string, previewUrl: string) => void;
}

export function MusicCard({ item, onShare, isPlaying, onPlayToggle }: MusicCardProps) {
    return (
        <div className="group/music relative flex flex-col rounded-2xl border border-white/[0.04] hover:border-main/30 transition-transform duration-300 overflow-hidden shadow-lg bg-gray-400">
            {/* Square Album Cover */}
            <div className="relative w-full bg-black/45 overflow-hidden flex items-center justify-center shrink-0 rounded-2xl">
                {item.image ? (
                    <div className="w-full flex items-center justify-center flex-col rounded-2xl">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover rounded-3xl p-1.5" />

                        <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

                        <div className="p-2 flex flex-col items-center w-full z-10">
                            <h3 className="text-md font-bold text-foreground text-center w-full px-1 truncate" title={item.title}>
                                {item.title}
                            </h3>
                            <p className="text-sm text-muted-foreground text-center w-full px-1 truncate">
                                {item.subtitle}
                            </p>
                            {item.metadata?.duration && (
                                <span className="text-[10px] text-muted-foreground font-mono">
                                    {Math.floor(item.metadata.duration / 60)}:{(item.metadata.duration % 60).toString().padStart(2, "0")}
                                </span>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-4xl opacity-30 select-none">🎵</div>
                )}

                {/* Play/Pause/Share Overlay */}
                {item.metadata?.preview && (
                    <div className="">
                        <button
                            type="button"
                            onClick={() => onPlayToggle(item.id, item.metadata.preview)}
                            className={`absolute inset-0 flex items-center justify-center text-white transition-all duration-300 cursor-pointer z-10 ${
                                isPlaying 
                                    ? "bg-black/0 hover:bg-black/55" 
                                    : "bg-black/40 opacity-0 group-hover/music:opacity-100"
                            }`}
                        >
                            {isPlaying ? (
                                <div className="relative w-24 h-24 rounded-full bg-white/5 backdrop-blur-sm text-white flex items-center justify-center transform transition-all duration-300 shadow-xl group-hover/music:scale-105">
                                    <PlayingDisc isPlaying={true} className="w-24 h-24" />
                                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-200">
                                        <Pause className="h-8 w-8 text-white animate-pulse" />
                                    </div>
                                </div>
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-sm text-white flex items-center justify-center transform scale-90 group-hover/music:scale-100 transition active:scale-90 shadow-xl">
                                    <div className="border border-gray-300 hover:border hover:border-main/55 h-12 w-12 hover:text-main/55 rounded-full items-center flex justify-center">
                                        <Play className="h-6 w-6 transition cursor-pointer" />
                                    </div>
                                </div>
                            )}
                        </button>
                        <div className="absolute left-2.5 top-2.5 flex items-center gap-2 z-20">
                            <button
                                type="button"
                                onClick={() => onShare(item)}
                                className="inset-0 bg-white/5 rounded-xl w-fit h-fit p-2  text-white backdrop-blur-sm border border-gray-300 hover:border hover:border-main/55 opacity-0 group-hover/music:opacity-100 transition-translate cursor-pointer"
                            >
                                <Send className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
