"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useConversations } from "@/tanstack/queries/conversation.query";
import { CollectionService } from "@/services/collection.service";
import { getMyUserId } from "@/lib/token";
import { useSnackbar } from "notistack";
import {
    Sparkles,
    Check,
    Bookmark,
    Trash2,
    Music,
    BookOpen,
    Code2,
    Film,
    Bot,
    ChevronDown,
    Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── Types ────────────────────────────────────────────────────────────────────

interface RichCard {
    id: string; // msg ID
    type: string;
    title: string;
    subtitle?: string;
    imageUrl?: string;
    conversationName: string;
    messageId: string;
}

interface ActionItem {
    id: string;
    text: string;
    done: boolean;
    source: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function tryParseRichObject(content: string) {
    try {
        const parsed = JSON.parse(content);
        if (parsed?.vyraObjectType === "RICH_CARD" && parsed?.richObject) {
            return parsed.richObject;
        }
    } catch {
        // Not a rich card
    }
    return null;
}

function getOtherUserName(conv: any, myId: string | null): string {
    if (!myId) return "Chat";
    const other = conv.participants?.find((p: any) => p.userId !== myId);
    return other?.user?.displayName?.split(" ")[0] || other?.user?.username || "Chat";
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
    MUSIC: <Music className="h-4 w-4" />,
    BOOK: <BookOpen className="h-4 w-4" />,
    GITHUB: <Code2 className="h-4 w-4" />,
    MOVIE: <Film className="h-4 w-4" />,
    AI_MODEL: <Bot className="h-4 w-4" />,
};

const DUMMY_TASKS: ActionItem[] = [
    { id: "1", text: "Review the vyra-core-engine repository shared by Rahul", done: false, source: "Rahul" },
    { id: "2", text: "Read the Norman Design principles book link from Chelsi", done: false, source: "Chelsi" },
    { id: "3", text: "Draft a combined summary of RAG discussions", done: true, source: "Vyra AI" },
];

// ─── Component 1: AI Weekly Digest ───
export function AiWeeklyDigest() {
    return (
        <section className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] backdrop-blur-2xl">
            {/* Glow ring backing */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-transparent to-emerald-500/10 opacity-30 pointer-events-none" />

            <div className="flex items-start gap-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-400 border border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.25)]">
                    <Sparkles className="h-5.5 w-5.5" />
                </div>
                <div className="space-y-3.5 flex-1 min-w-0">
                    <div>
                        <span className="text-[11px] font-bold tracking-widest text-violet-400 uppercase">
                            Vyra AI Insights
                        </span>
                        <h3 className="text-lg font-bold text-white mt-0.5">
                            Weekly Conversation Sync
                        </h3>
                    </div>
                    <p className="text-[14.5px] text-muted-foreground/80 leading-relaxed font-medium">
                        You discussed <span className="text-white font-semibold">RAG implementations</span> and <span className="text-white font-semibold">Tailwind v4 layouts</span> across 3 conversations with Rahul and Alice this week. The team shared 4 active repositories and referred to 1 UI Design book.
                    </p>
                </div>
            </div>
        </section>
    );
}

// ─── Component 2: Curation Queue ───
export function CurationQueue() {
    const { enqueueSnackbar } = useSnackbar();
    const queryClient = useQueryClient();
    const { data: conversations = [] } = useConversations();
    const myId = getMyUserId();

    const [dismissedItems, setDismissedItems] = useState<string[]>([]);
    const [savingItemId, setSavingItemId] = useState<string | null>(null);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    const { data: collections = [] } = useQuery({
        queryKey: ["collections"],
        queryFn: async () => {
            const res = await CollectionService.getCollections();
            return res.data;
        },
    });

    const { mutate: saveToCollection } = useMutation({
        mutationFn: ({ colId, msgId }: { colId: string; msgId: string }) =>
            CollectionService.saveToCollection(colId, msgId),
        onSuccess: () => {
            enqueueSnackbar("Saved to Collection", { variant: "success" });
            queryClient.invalidateQueries({ queryKey: ["collections"] });
        },
        onError: (err: any) => {
            enqueueSnackbar(err?.response?.data?.message || "Failed to save", { variant: "error" });
        },
    });

    // Extract raw rich cards from all chats
    const rawCards: RichCard[] = [];
    for (const conv of conversations) {
        const messages = conv.messages ?? [];
        for (const msg of messages) {
            const cardData = tryParseRichObject(msg.content);
            if (cardData) {
                rawCards.push({
                    id: msg.id,
                    type: cardData.type,
                    title: cardData.title,
                    subtitle: cardData.subtitle,
                    conversationName: getOtherUserName(conv, myId),
                    messageId: msg.id,
                });
            }
        }
    }

    // Filter out dismissed items
    const queue = rawCards.filter((item) => !dismissedItems.includes(item.id)).slice(0, 4);

    const handleDismiss = (id: string) => {
        setDismissedItems((prev) => [...prev, id]);
    };

    const handleSave = (itemId: string, colId: string, msgId: string) => {
        setSavingItemId(itemId);
        saveToCollection(
            { colId, msgId },
            {
                onSettled: () => {
                    setSavingItemId(null);
                    setDismissedItems((prev) => [...prev, itemId]);
                    setActiveDropdown(null);
                },
            }
        );
    };

    if (queue.length === 0) {
        return (
            <section className="space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/45">
                    Curation Queue — Extracted from chats
                </h2>
                <div className="relative p-5 rounded-3xl border border-dashed border-white/[0.08] bg-[#151517]/20 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left select-none">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                        <Bookmark className="h-5 w-5 text-muted-foreground/40" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[13px] font-semibold text-muted-foreground/80">Curation queue empty</p>
                        <p className="text-[11px] text-muted-foreground/40 leading-relaxed max-w-[380px]">
                            When links to repositories, books, or songs are shared in your chats, Vyra AI extracts them here so you can save them to Collections or dismiss them.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/45">
                Curation Queue — Extracted from chats
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AnimatePresence>
                    {queue.map((item) => (
                        <motion.div
                            key={item.id}
                            layout
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative flex flex-col justify-between p-4.5 rounded-3xl border border-white/[0.08] bg-[#ffffff]/5 backdrop-blur-[4px] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_10px_20px_-5px_rgba(0,0,0,0.5)] transition-all duration-200"
                        >
                            <div>
                                {/* Card header */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-muted-foreground/60">
                                        {TYPE_ICONS[item.type] || <Bookmark className="h-4 w-4" />}
                                        <span className="text-[10px] font-bold uppercase tracking-wider">
                                            {item.type}
                                        </span>
                                    </div>
                                    <span className="text-[9px] text-muted-foreground/30 font-semibold">
                                        via {item.conversationName}
                                    </span>
                                </div>

                                {/* Card content */}
                                <div className="mt-4">
                                    <h4 className="text-[14px] font-bold text-white leading-snug truncate">
                                        {item.title}
                                    </h4>
                                    {item.subtitle && (
                                        <p className="text-[11px] text-muted-foreground/50 truncate mt-0.5">
                                            {item.subtitle}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-5 flex gap-2 relative">
                                <div className="relative flex-1">
                                    <button
                                        onClick={() =>
                                            setActiveDropdown(activeDropdown === item.id ? null : item.id)
                                        }
                                        disabled={savingItemId === item.id}
                                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white text-black hover:bg-white/90 active:scale-95 disabled:opacity-50 rounded-2xl text-[11px] font-bold transition duration-200 cursor-pointer shadow-sm"
                                    >
                                        {savingItemId === item.id ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                        ) : (
                                            <Bookmark className="h-3 w-3" />
                                        )}
                                        Save
                                        <ChevronDown className="h-3 w-3 opacity-60" />
                                    </button>

                                    {/* Collections Dropdown */}
                                    {activeDropdown === item.id && (
                                        <div className="absolute left-0 bottom-full mb-2 w-48 rounded-2xl border border-white/[0.08] bg-[#121214] p-1.5 shadow-2xl z-30">
                                            {collections.map((col) => (
                                                <button
                                                    key={col.id}
                                                    onClick={() => handleSave(item.id, col.id, item.messageId)}
                                                    className="w-full text-left px-3 py-2 text-[11px] text-muted-foreground hover:text-white hover:bg-white/5 rounded-xl transition truncate"
                                                >
                                                    {col.emoji || "📌"} {col.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => handleDismiss(item.id)}
                                    className="inline-flex items-center justify-center p-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-muted-foreground hover:border-white/20 hover:text-white transition duration-200 active:scale-95 cursor-pointer"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </section>
    );
}

// ─── Component 3: Action Items Checklist ───
export function ActionItems() {
    const [tasks, setTasks] = useState<ActionItem[]>(DUMMY_TASKS);

    const toggleTask = (id: string) => {
        setTasks((prev) =>
            prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
        );
    };

    return (
        <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/45">
                Action Items from Chats
            </h2>
            <div className="glass-panel rounded-3xl p-6 space-y-3.5">
                {tasks.map((task) => (
                    <div
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                        className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-black/35 hover:bg-black/50 border border-white/[0.02] cursor-pointer transition-colors duration-150"
                    >
                        <div className="flex items-center gap-3.5 min-w-0">
                            {/* Recessed skeuomorphic checkbox */}
                            <div className={`flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-lg border transition-all duration-200 ${task.done ? "bg-violet-500/20 border-violet-400 text-violet-400" : "bg-black/40 border-white/[0.08]"}`}>
                                {task.done && <Check className="h-3 w-3 stroke-[3px]" />}
                            </div>
                            <span className={`text-[13.5px] font-medium leading-normal truncate ${task.done ? "text-muted-foreground/40 line-through" : "text-foreground"}`}>
                                {task.text}
                            </span>
                        </div>
                        <span className="text-[9px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-white/[0.04] text-muted-foreground/50 border border-white/[0.02]">
                            {task.source}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
}
