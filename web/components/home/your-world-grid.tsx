"use client";

import { useConversations } from "@/tanstack/queries/conversation.query";
import { getMyUserId } from "@/lib/token";
import { Music, BookOpen, Code2, Film, Gamepad2, Bot, ImageIcon, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

// ── Types ────────────────────────────────────────────────────────────────────

interface RichObject {
    vyraObjectType: "RICH_CARD";
    richObject: {
        id: string;
        type: string;
        title: string;
        subtitle?: string;
        imageUrl?: string;
        previewUrl?: string;
        description?: string;
        meta?: Record<string, any>;
    };
}

interface WorldItem {
    id: string;
    type: string;
    title: string;
    subtitle?: string;
    imageUrl?: string;
    conversationName: string;
    timestamp: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_ICONS: Record<string, React.ReactNode> = {
    MUSIC: <Music className="h-4 w-4" />,
    BOOK: <BookOpen className="h-4 w-4" />,
    GITHUB: <Code2 className="h-4 w-4" />,
    MOVIE: <Film className="h-4 w-4" />,
    TV: <Film className="h-4 w-4" />,
    GAME: <Gamepad2 className="h-4 w-4" />,
    AI_MODEL: <Bot className="h-4 w-4" />,
    PHOTO: <ImageIcon className="h-4 w-4" />,
};

const TYPE_COLORS: Record<string, string> = {
    MUSIC: "from-violet-500/20 to-violet-500/5 border-violet-500/15",
    BOOK: "from-amber-500/20 to-amber-500/5 border-amber-500/15",
    GITHUB: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/15",
    MOVIE: "from-rose-500/20 to-rose-500/5 border-rose-500/15",
    TV: "from-rose-500/20 to-rose-500/5 border-rose-500/15",
    GAME: "from-blue-500/20 to-blue-500/5 border-blue-500/15",
    AI_MODEL: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/15",
    PHOTO: "from-pink-500/20 to-pink-500/5 border-pink-500/15",
};

const TYPE_LABELS: Record<string, string> = {
    MUSIC: "Song",
    BOOK: "Book",
    GITHUB: "Repository",
    MOVIE: "Movie",
    TV: "Show",
    GAME: "Game",
    AI_MODEL: "AI Model",
    PHOTO: "Photo",
};

function tryParseRichObject(content: string): RichObject | null {
    try {
        const parsed = JSON.parse(content);
        if (parsed?.vyraObjectType === "RICH_CARD" && parsed?.richObject) {
            return parsed as RichObject;
        }
    } catch {
        // not a rich object
    }
    return null;
}

function getOtherUserName(conv: any, myId: string | null): string {
    if (!myId) return "Chat";
    const other = conv.participants?.find((p: any) => p.userId !== myId);
    return other?.user?.displayName?.split(" ")[0] || other?.user?.username || "Chat";
}

// ── Component ────────────────────────────────────────────────────────────────

export default function YourWorldGrid() {
    const { data: conversations = [], isLoading } = useConversations();
    const myId = getMyUserId();

    // Extract rich objects from the last message of each conversation
    const worldItems: WorldItem[] = [];
    for (const conv of conversations) {
        const messages = conv.messages ?? [];
        for (const msg of messages) {
            const rich = tryParseRichObject(msg.content);
            if (rich) {
                worldItems.push({
                    id: rich.richObject.id + "-" + msg.id,
                    type: rich.richObject.type,
                    title: rich.richObject.title,
                    subtitle: rich.richObject.subtitle,
                    imageUrl: rich.richObject.imageUrl,
                    conversationName: getOtherUserName(conv, myId),
                    timestamp: msg.createdAt,
                });
            }
        }
    }

    // Sort by most recent and take top 8
    worldItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const items = worldItems.slice(0, 8);

    if (isLoading) {
        return (
            <section className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50">
                    Your World
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-[110px] rounded-2xl bg-white/[0.02] border border-white/[0.04] animate-pulse" />
                    ))}
                </div>
            </section>
        );
    }

    if (items.length === 0) {
        return (
            <section className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50">
                    Your World
                </h2>
                <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-dashed border-white/[0.06] bg-[#151517]/30">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.06] mb-2.5">
                        <ExternalLink className="h-5 w-5 text-muted-foreground/40" />
                    </div>
                    <p className="text-[13px] font-semibold text-muted-foreground/60">No resources shared yet</p>
                    <p className="text-[11px] text-muted-foreground/35 mt-1 max-w-[240px]">
                        Share songs, books, repos, or articles in your chats and they&apos;ll appear here.
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50">
                Your World
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {items.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: index * 0.04 }}
                        className={`group relative flex flex-col justify-between p-3.5 rounded-2xl border bg-gradient-to-b backdrop-blur-sm cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] ${TYPE_COLORS[item.type] || "from-white/10 to-white/[0.02] border-white/[0.08]"}`}
                    >
                        {/* Type badge */}
                        <div className="flex items-center gap-1.5 text-muted-foreground/60">
                            {TYPE_ICONS[item.type] || <ExternalLink className="h-4 w-4" />}
                            <span className="text-[10px] font-bold uppercase tracking-wider">
                                {TYPE_LABELS[item.type] || item.type}
                            </span>
                        </div>

                        {/* Title & subtitle */}
                        <div className="mt-3 space-y-0.5">
                            <p className="text-[13px] font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-white transition-colors">
                                {item.title}
                            </p>
                            {item.subtitle && (
                                <p className="text-[11px] text-muted-foreground/50 truncate">
                                    {item.subtitle}
                                </p>
                            )}
                        </div>

                        {/* Source conversation */}
                        <div className="mt-2.5 flex items-center gap-1">
                            <span className="text-[9px] text-muted-foreground/30 font-medium">
                                via {item.conversationName}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
