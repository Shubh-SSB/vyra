import { Send } from "lucide-react";

interface MovieTvCardProps {
    item: any;
    onShare: (item: any) => void;
}

export function MovieTvCard({ item, onShare }: MovieTvCardProps) {
    return (
        <div className="group/movie relative flex flex-col rounded-2xl border border-white/[0.04] bg-[#121216]/60 hover:bg-[#181822]/80 hover:border-amber-500/30 transition-all duration-300 overflow-hidden shadow-lg">
            {/* Portrait Poster Cover */}
            <div className="relative aspect-[2/3] w-full bg-black/45 overflow-hidden flex items-center justify-center shrink-0">
                {item.image ? (
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover/movie:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="text-4xl opacity-30 select-none">🎬</div>
                )}
                
                {/* Glowing Rating Overlay */}
                {item.metadata?.rating !== undefined && (
                    <div className="absolute top-2.5 right-2.5 z-10 px-2 py-0.5 rounded-lg bg-black/75 border border-amber-500/30 text-amber-400 font-bold text-[10px] shadow flex items-center gap-1 backdrop-blur-sm">
                        ★ {item.metadata.rating.toFixed(1)}
                    </div>
                )}
            </div>

            {/* Text Info */}
            <div className="p-4 flex flex-col flex-1 min-w-0">
                <span className="px-2 py-0.5 text-[9px] font-bold rounded border uppercase tracking-wider text-amber-400 bg-amber-500/10 border-amber-500/20 w-fit shrink-0">
                    {item.type}
                </span>

                <h3 className="text-sm font-bold text-foreground truncate mt-2.5" title={item.title}>
                    {item.title}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                    {item.subtitle}
                </p>

                {item.metadata?.overview && (
                    <p className="text-[10px] text-muted-foreground/75 leading-normal line-clamp-2 mt-2 bg-white/[0.01] border border-white/[0.03] p-1.5 rounded-lg">
                        {item.metadata.overview}
                    </p>
                )}

                <div className="mt-auto pt-3 border-t border-white/[0.04] flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => onShare(item)}
                        className="flex-1 h-8 rounded-lg bg-[#d97706] text-white hover:bg-amber-600 active:scale-95 transition-all text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 shadow"
                    >
                        <Send className="w-3 h-3" />
                        Send
                    </button>
                    {item.actions?.open && (
                        <a
                            href={item.actions.open}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-muted-foreground hover:text-foreground transition cursor-pointer"
                            title="View Details"
                        >
                            <svg className="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
