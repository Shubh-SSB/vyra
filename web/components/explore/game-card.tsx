import { Send } from "lucide-react";

interface GameCardProps {
    item: any;
    onShare: (item: any) => void;
}

export function GameCard({ item, onShare }: GameCardProps) {
    return (
        <div className="group/game relative flex flex-col rounded-2xl border border-white/[0.04] bg-[#140f1a]/60 hover:bg-[#1b1524]/80 hover:border-violet-500/30 transition-all duration-300 overflow-hidden shadow-lg">
            {/* Landscape cover */}
            <div className="relative aspect-video w-full bg-black/45 overflow-hidden flex items-center justify-center shrink-0">
                {item.image ? (
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover/game:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="text-4xl opacity-30 select-none">🎮</div>
                )}

                {item.metadata?.rating !== undefined && (
                    <div className="absolute bottom-2.5 left-2.5 z-10 px-2 py-0.5 rounded-lg bg-violet-600 text-white font-bold text-[10px] shadow backdrop-blur-sm">
                        ★ {item.metadata.rating.toFixed(1)}
                    </div>
                )}
            </div>

            {/* Text Info */}
            <div className="p-4 flex flex-col flex-1 min-w-0">
                <span className="px-2 py-0.5 text-[9px] font-bold rounded border uppercase tracking-wider text-violet-400 bg-violet-500/10 border-violet-500/20 w-fit shrink-0">
                    Game
                </span>

                <h3 className="text-sm font-bold text-foreground truncate mt-2.5" title={item.title}>
                    {item.title}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                    {item.subtitle}
                </p>

                {/* Platforms List */}
                {item.metadata?.platforms && item.metadata.platforms.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2.5 select-none">
                        {item.metadata.platforms.slice(0, 3).map((plat: string) => (
                            <span key={plat} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-[9px] text-muted-foreground">
                                {plat}
                            </span>
                        ))}
                    </div>
                )}

                <div className="mt-auto pt-3 border-t border-white/[0.04] flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => onShare(item)}
                        className="flex-1 h-8 rounded-lg bg-violet-500 text-white hover:bg-violet-600 active:scale-95 transition-all text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 shadow"
                    >
                        <Send className="w-3 h-3" />
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
