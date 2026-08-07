import { Send } from "lucide-react";

interface AiModelCardProps {
    item: any;
    onShare: (item: any) => void;
}

export function AiModelCard({ item, onShare }: AiModelCardProps) {
    return (
        <div className="group/model relative flex flex-col rounded-2xl border border-white/[0.04] bg-[#0c1417]/60 hover:bg-[#121c20]/80 hover:border-cyan-500/30 transition-all duration-300 overflow-hidden shadow-lg p-5">
            {/* Header details */}
            <div className="flex items-start justify-between gap-3 shrink-0">
                <div className="min-w-0">
                    <h3 className="text-sm font-bold text-foreground truncate group-hover/model:text-cyan-400 transition" title={item.title}>
                        {item.title}
                    </h3>
                    <p className="text-[10px] text-muted-foreground truncate">
                        Author: @{item.subtitle}
                    </p>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold text-[8px] uppercase tracking-wider">
                    {item.metadata?.pipeline_tag || "Model"}
                </span>
            </div>

            {/* Model stats */}
            <div className="flex flex-wrap gap-2.5 mt-3 text-[10px] font-semibold text-muted-foreground/80 shrink-0">
                {item.metadata?.downloads !== undefined && (
                    <span className="flex items-center gap-1">
                        📥 {item.metadata.downloads.toLocaleString()}
                    </span>
                )}
                {item.metadata?.likes !== undefined && (
                    <span className="flex items-center gap-1">
                        ❤ {item.metadata.likes.toLocaleString()}
                    </span>
                )}
            </div>

            {/* Model tags list */}
            {item.metadata?.tags && item.metadata.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3.5 select-none flex-1 content-start">
                    {item.metadata.tags.slice(0, 3).map((tag: string) => (
                        <span key={tag} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-[9px] text-muted-foreground truncate max-w-[80px]">
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center gap-2 shrink-0">
                <button
                    type="button"
                    onClick={() => onShare(item)}
                    className="flex-1 h-8 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 active:scale-95 transition-all text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 shadow"
                >
                    <Send className="w-3 h-3" />
                    Send Model
                </button>
                {item.actions?.open && (
                    <a
                        href={item.actions.open}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-muted-foreground hover:text-foreground transition cursor-pointer"
                        title="Open HuggingFace"
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
    );
}
