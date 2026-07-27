"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, EyeOff, Eye, MessageSquare, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { MessageService } from "@/services/message.service";
import { Message } from "@/types/message";
import SettingSidebar from "@/components/ui/settings-sidebar";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
    try {
        return new Date(iso).toLocaleDateString([], {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    } catch { return ""; }
}

function formatTime(iso: string) {
    try {
        return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch { return ""; }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HiddenMessagesPage() {
    const queryClient = useQueryClient();
    const [unhidingId, setUnhidingId] = useState<string | null>(null);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["hidden-messages"],
        queryFn: async () => {
            const res = await MessageService.getHiddenMessages();
            return res.data as (Message & { hiddenAt: string })[];
        },
    });

    const { mutate: unhide } = useMutation({
        mutationFn: (messageId: string) => MessageService.unhideMessage(messageId),
        onMutate: (messageId) => setUnhidingId(messageId),
        onSuccess: (_, messageId) => {
            queryClient.setQueryData<(Message & { hiddenAt: string })[]>(
                ["hidden-messages"],
                (prev) => prev?.filter((m) => m.id !== messageId) ?? [],
            );
            setUnhidingId(null);
        },
        onError: () => setUnhidingId(null),
    });

    const messages = data ?? [];

    return (
        <main className="min-h-svh overflow-x-hidden text-foreground font-geist">
            <div className="relative z-10 mx-auto flex w-full">
                <SettingSidebar
                    name="Hidden Messages"
                    navigateTo="Back To Settings"
                    path="/settings"
                    tagline="Messages you've hidden from your view"
                />

                <section className="min-w-0 flex-1 px-4 pb-28 pt-7 sm:px-7 sm:pt-10 lg:px-12 lg:pb-12 xl:px-16">
                    <div className="mx-auto max-w-[640px] w-full">

                        {/* Mobile header */}
                        <div className="flex items-center gap-3 mb-8 lg:hidden">
                            <Link
                                href="/settings"
                                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span className="text-sm font-medium">Settings</span>
                            </Link>
                            <span className="text-muted-foreground/40">/</span>
                            <span className="text-sm font-semibold">Hidden Messages</span>
                        </div>

                        {/* Header info banner */}
                        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-white/[0.06] bg-[#151517]/85 px-4 py-3.5">
                            <EyeOff className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                            <p className="text-[12px] text-muted-foreground leading-relaxed">
                                These messages are hidden only for you. The other person can still see them.
                                Unhiding a message brings it back into the conversation view.
                            </p>
                        </div>

                        {/* Content */}
                        {isLoading && (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        )}

                        {isError && (
                            <div className="flex flex-col items-center gap-2 py-16 text-center">
                                <p className="text-sm font-medium text-foreground">Failed to load hidden messages</p>
                                <p className="text-xs text-muted-foreground">Please try again later.</p>
                            </div>
                        )}

                        {!isLoading && !isError && messages.length === 0 && (
                            <div className="flex flex-col items-center gap-3 py-20 text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-elevated border border-white/[0.06]">
                                    <MessageSquare className="h-7 w-7 text-muted-foreground" strokeWidth={1.25} />
                                </div>
                                <p className="text-[14px] font-medium text-foreground">No hidden messages</p>
                                <p className="text-[12px] text-muted-foreground max-w-[240px]">
                                    Messages you hide will appear here. You can unhide them anytime.
                                </p>
                            </div>
                        )}

                        {!isLoading && messages.length > 0 && (
                            <div className="overflow-hidden rounded-3xl border border-white/[0.06] bg-[#151517]/85 shadow-lg divide-y divide-white/[0.04]">
                                <AnimatePresence initial={false}>
                                    {messages.map((msg) => (
                                        <motion.div
                                            key={msg.id}
                                            layout
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.2, ease: "easeInOut" }}
                                            className="overflow-hidden"
                                        >
                                            <div className="flex items-start justify-between gap-4 px-5 py-4">
                                                {/* Message info */}
                                                <div className="flex items-start gap-3 min-w-0 flex-1">
                                                    {/* Avatar placeholder */}
                                                    <div className="h-8 w-8 shrink-0 rounded-full bg-surface-elevated border border-white/[0.06] flex items-center justify-center text-[11px] font-semibold text-muted-foreground uppercase">
                                                        {msg.sender?.displayName?.[0] ?? "?"}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-1.5 mb-0.5">
                                                            <span className="text-[13px] font-semibold text-[#eeece4]">
                                                                {msg.sender?.displayName ?? "Unknown"}
                                                            </span>
                                                            <span className="text-[10px] text-muted-foreground/60">
                                                                {formatTime(msg.createdAt)}
                                                            </span>
                                                            <span className="text-[10px] text-muted-foreground/40">·</span>
                                                            <span className="text-[10px] text-muted-foreground/60">
                                                                {formatDate(msg.createdAt)}
                                                            </span>
                                                        </div>
                                                        <p className={cn(
                                                            "text-[13px] text-muted-foreground leading-relaxed line-clamp-2",
                                                            msg.deletedAt && "italic opacity-50"
                                                        )}>
                                                            {msg.deletedAt ? "This message was deleted" : msg.content}
                                                        </p>
                                                        <p className="mt-1 text-[10px] text-muted-foreground/40">
                                                            Hidden on {formatDate((msg as any).hiddenAt)}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Unhide button */}
                                                <button
                                                    onClick={() => unhide(msg.id)}
                                                    disabled={unhidingId === msg.id}
                                                    title="Unhide this message"
                                                    className={cn(
                                                        "flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-all duration-150 active:scale-95 cursor-pointer",
                                                        "border-white/[0.08] text-muted-foreground hover:border-white/20 hover:text-foreground hover:bg-white/5",
                                                        unhidingId === msg.id && "opacity-50 cursor-not-allowed"
                                                    )}
                                                >
                                                    {unhidingId === msg.id ? (
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                    ) : (
                                                        <Eye className="h-3 w-3" />
                                                    )}
                                                    Unhide
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}
