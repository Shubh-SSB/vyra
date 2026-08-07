import { Send } from "lucide-react";

interface GenericExploreCardProps {
    item: any;
    onShare: (item: any) => void;
}

export function GenericExploreCard({ item, onShare }: GenericExploreCardProps) {
    return (
        <div className="group/card relative flex flex-col rounded-2xl border border-white/[0.04] bg-[#16161a]/40 hover:bg-[#1a1a20]/60 hover:border-white/10 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="relative aspect-video w-full bg-black/35 overflow-hidden border-b border-white/[0.04] flex items-center justify-center shrink-0">
                {item.image ? (
                    <>
                        <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover blur-sm opacity-20 scale-105" />
                        <img src={item.image} alt={item.title} className="relative z-10 w-full h-full object-contain" />
                    </>
                ) : (
                    <div className="text-3xl select-none opacity-40">⚡</div>
                )}
            </div>

            <div className="p-4 flex flex-col flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 shrink-0">
                    <span className="px-2 py-0.5 text-[9px] font-bold rounded border uppercase tracking-wider text-muted-foreground bg-white/5 border-white/10">
                        {item.type}
                    </span>
                </div>

                <h3 className="text-sm font-bold text-foreground truncate mt-2 shrink-0" title={item.title}>
                    {item.title}
                </h3>
                <p className="text-xs text-muted-foreground truncate shrink-0">
                    {item.subtitle}
                </p>

                <div className="mt-auto pt-3 border-t border-white/[0.04] flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => onShare(item)}
                        className="flex-1 h-8 rounded-lg bg-foreground text-background hover:opacity-90 active:scale-95 transition-all text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 shadow"
                    >
                        <Send className="w-3 h-3" />
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
