import { Send } from "lucide-react";

interface BookCardProps {
    item: any;
    onShare: (item: any) => void;
}

export function BookCard({ item, onShare }: BookCardProps) {
    return (
        <div className="group/book relative flex flex-col rounded-2xl border border-white/[0.04] bg-[#0c1310]/60 hover:bg-[#121c17]/80 hover:border-emerald-500/30 transition-all duration-300 overflow-hidden shadow-lg">
            {/* Portrait Book Cover with shadow spine */}
            <div className="relative aspect-[3/4] w-full bg-black/45 overflow-hidden flex items-center justify-center shrink-0 border-b border-white/[0.02]">
                {item.image ? (
                    <>
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover/book:scale-105 transition-transform duration-500" />
                        <div className="absolute top-0 left-0 bottom-0 w-2.5 bg-gradient-to-r from-black/55 to-transparent z-10" />
                    </>
                ) : (
                    <div className="text-4xl opacity-30 select-none">📚</div>
                )}
            </div>

            {/* Text Info */}
            <div className="p-4 flex flex-col flex-1 min-w-0">
                <span className="px-2 py-0.5 text-[9px] font-bold rounded border uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border-emerald-500/20 w-fit shrink-0">
                    Book
                </span>

                <h3 className="text-sm font-bold text-foreground truncate mt-2.5" title={item.title}>
                    {item.title}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                    By {item.subtitle}
                </p>

                {item.metadata?.first_publish_year && (
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                        Published: {item.metadata.first_publish_year}
                    </p>
                )}

                <div className="mt-auto pt-3 border-t border-white/[0.04] flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => onShare(item)}
                        className="flex-1 h-8 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95 transition-all text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 shadow"
                    >
                        <Send className="w-3 h-3" />
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
