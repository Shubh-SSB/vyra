import { Send } from "lucide-react";

interface GithubCardProps {
    item: any;
    onShare: (item: any) => void;
}

export function GithubCard({ item, onShare }: GithubCardProps) {
    return (
        <div className="group/github relative flex flex-col rounded-2xl border border-white/[0.04] bg-[#1a1017]/60 hover:bg-[#241720]/80 hover:border-pink-500/30 transition-all duration-300 overflow-hidden shadow-lg p-5">
            {/* Header details */}
            <div className="flex items-center gap-3 shrink-0">
                {item.image ? (
                    <img src={item.image} alt={item.subtitle} className="w-9 h-9 rounded-lg border border-white/10" />
                ) : (
                    <div className="w-9 h-9 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-lg">💻</div>
                )}
                <div className="min-w-0">
                    <h3 className="text-sm font-bold text-foreground truncate group-hover/github:text-pink-400 transition" title={item.title}>
                        {item.title}
                    </h3>
                    <p className="text-[10px] text-muted-foreground truncate">
                        @{item.subtitle}
                    </p>
                </div>
            </div>

            {/* Repo description */}
            {item.metadata?.description && (
                <p className="text-xs text-muted-foreground/75 leading-relaxed line-clamp-3 mt-3.5 bg-white/[0.01] border border-white/[0.03] p-2 rounded-xl flex-1">
                    {item.metadata.description}
                </p>
            )}

            {/* Meta Tags */}
            <div className="flex items-center gap-3 mt-4 text-[10px] font-semibold text-muted-foreground/80 shrink-0">
                {item.metadata?.stars !== undefined && (
                    <span className="flex items-center gap-1">
                        ⭐ {item.metadata.stars.toLocaleString()}
                    </span>
                )}
                {item.metadata?.forks !== undefined && (
                    <span className="flex items-center gap-1">
                        ⑂ {item.metadata.forks.toLocaleString()}
                    </span>
                )}
                {item.metadata?.language && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-pink-500/5 border border-pink-500/10 text-pink-400">
                        {item.metadata.language}
                    </span>
                )}
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center gap-2 shrink-0">
                <button
                    type="button"
                    onClick={() => onShare(item)}
                    className="flex-1 h-8 rounded-lg bg-pink-500 text-white hover:bg-pink-600 active:scale-95 transition-all text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 shadow"
                >
                    <Send className="w-3 h-3" />
                    Send Repo
                </button>
                {item.actions?.open && (
                    <a
                        href={item.actions.open}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-muted-foreground hover:text-foreground transition cursor-pointer"
                        title="Open GitHub"
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
