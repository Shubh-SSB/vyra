import { Send } from "lucide-react";

interface PhotoCardProps {
    item: any;
    onShare: (item: any) => void;
}

export function PhotoCard({ item, onShare }: PhotoCardProps) {
    return (
        <div className="group/photo relative flex flex-col aspect-[4/3] rounded-2xl border border-white/[0.04] bg-[#0d1013]/60 hover:bg-[#12161b]/80 hover:border-teal-500/30 transition-all duration-300 overflow-hidden shadow-lg">
            {/* Full Size Picture */}
            {item.image && (
                <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover group-hover/photo:scale-105 transition-transform duration-500" />
            )}

            {/* Gradient Cover Overlay on Hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10 opacity-0 group-hover/photo:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-10">
                <span className="px-2 py-0.5 text-[8px] font-bold rounded border uppercase tracking-wider text-teal-400 bg-teal-500/10 border-teal-500/20 w-fit mb-2">
                    Photo
                </span>
                <h3 className="text-xs font-bold text-white truncate" title={item.title}>
                    {item.title}
                </h3>
                <p className="text-[10px] text-white/70 truncate">
                    Author: {item.metadata?.author || "Unknown"}
                </p>

                <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => onShare(item)}
                        className="flex-1 h-7 rounded-lg bg-teal-500 text-white hover:bg-teal-600 active:scale-95 transition-all text-[11px] font-bold cursor-pointer flex items-center justify-center gap-1 shadow"
                    >
                        <Send className="w-2.5 h-2.5" />
                        Send Photo
                    </button>
                    {item.actions?.open && (
                        <a
                            href={item.actions.open}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-7 w-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
                            title="View Original"
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
