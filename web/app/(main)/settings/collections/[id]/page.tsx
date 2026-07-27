"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft, Eye, Bookmark, Trash2, Loader2, ArrowRightLeft,
    Copy, ExternalLink, ChevronRight, X, Sparkles, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CollectionService, Collection, CollectionItem } from "@/services/collection.service";
import SettingSidebar from "@/components/ui/settings-sidebar";
import { useSnackbar } from "notistack";
import MoveCopyModal from "@/components/modal/moveOrcopy.modal";


export default function CollectionDetailPage() {
    const { enqueueSnackbar } = useSnackbar();
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const collectionId = params.id as string;

    const [transferringMsgId, setTransferringMsgId] = useState<string | null>(null);

    // Fetch all collections for the move/copy dropdown list
    const { data: collections = [] } = useQuery({
        queryKey: ["collections"],
        queryFn: async () => {
            const res = await CollectionService.getCollections();
            return res.data;
        }
    });

    const activeCollection = collections.find((c) => c.id === collectionId);

    // Fetch collection items
    const { data: items = [], isLoading, isError } = useQuery({
        queryKey: ["collection-items", collectionId],
        queryFn: async () => {
            const res = await CollectionService.getCollectionItems(collectionId);
            return res.data;
        }
    });

    const { mutate: unsave } = useMutation({
        mutationFn: (messageId: string) =>
            CollectionService.unsaveFromCollection(collectionId, messageId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["collection-items", collectionId] });
            queryClient.invalidateQueries({ queryKey: ["collections"] });
            enqueueSnackbar("Removed bookmark", { variant: "success" });
        },
        onError: (err: any) => {
            enqueueSnackbar(err?.response?.data?.message || "Failed to unsave", { variant: "error" });
        }
    });

    return (
        <main className="min-h-svh overflow-x-hidden text-foreground font-geist">
            <div className="relative z-10 mx-auto flex w-full">
                <SettingSidebar
                    name={activeCollection?.name ?? "Collection"}
                    navigateTo="Back To Collections"
                    path="/settings/collections"
                    tagline="View and manage messages in this collection"
                />

                <section className="min-w-0 flex-1 px-4 pb-28 pt-7 sm:px-7 sm:pt-10 lg:px-12 lg:pb-12 xl:px-16">
                    <div className="mx-auto max-w-[680px] w-full space-y-6">
                        {/* Mobile Header */}
                        <div className="flex items-center gap-3 mb-2 lg:hidden">
                            <Link href="/settings/collections" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition">
                                <ArrowLeft className="h-4 w-4" />
                                <span className="text-sm font-medium">Collections</span>
                            </Link>
                            <span className="text-muted-foreground/40">/</span>
                            <span className="text-sm font-semibold truncate max-w-[150px]">
                                {activeCollection?.emoji} {activeCollection?.name}
                            </span>
                        </div>

                        {/* Info Header Banner */}
                        <div className="flex items-center gap-4 p-4 rounded-3xl border border-white/[0.06] bg-[#151517]/85 shadow-lg">
                            <span className="text-4xl shrink-0 p-3 bg-white/5 rounded-2xl">
                                {activeCollection?.emoji || "📌"}
                            </span>
                            <div>
                                <h3 className="text-base font-bold text-[#eeece4]">
                                    {activeCollection?.name}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {items.length} saved bookmarks in this folder
                                </p>
                            </div>
                        </div>

                        {/* List items */}
                        {isLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : isError ? (
                            <div className="text-center py-16">
                                <p className="text-sm text-red-400 font-semibold flex items-center justify-center gap-1.5">
                                    <AlertCircle className="w-4 h-4" /> Failed to load bookmarks
                                </p>
                            </div>
                        ) : items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/[0.06] rounded-3xl bg-[#151517]/30">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-elevated border border-white/[0.06] mb-3">
                                    <Bookmark className="h-7 w-7 text-muted-foreground" />
                                </div>
                                <p className="text-sm font-semibold">No saved bookmarks</p>
                                <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
                                    Save messages from chat to see them organized inside this collection
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-3xl border border-white/[0.06] bg-[#151517]/85 shadow-lg divide-y divide-white/[0.04]">
                                {items.map((item) => {
                                    const msg = item.message;
                                    return (
                                        <div key={msg.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-5 py-4 hover:bg-white/[0.01] transition">
                                            {/* Left message box */}
                                            <div className="flex items-start gap-3 min-w-0 flex-1">
                                                <div className="h-8 w-8 shrink-0 rounded-full bg-surface-elevated border border-white/[0.06] flex items-center justify-center text-[11px] font-semibold text-muted-foreground uppercase">
                                                    {msg.sender?.displayName?.[0] ?? "?"}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-1.5 mb-0.5">
                                                        <span className="text-[13px] font-semibold text-[#eeece4]">
                                                            {msg.sender?.displayName ?? "Deleted User"}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground/40">
                                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                        </span>
                                                    </div>
                                                    <p className={cn(
                                                        "text-[13px] text-muted-foreground leading-relaxed break-words",
                                                        msg.deletedAt && "italic opacity-50"
                                                    )}>
                                                        {msg.deletedAt ? "This message was deleted" : msg.content}
                                                    </p>
                                                    <p className="mt-1 text-[9px] text-muted-foreground/30">
                                                        Bookmarked {new Date(item.savedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Action tools */}
                                            <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                                                {/* Jump to Chat */}
                                                {!msg.deletedAt && (
                                                    <Link
                                                        href={`/chat?convId=${msg.conversationId}&msgId=${msg.id}`}
                                                        title="Jump to message in conversation"
                                                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-white/[0.08] bg-white/5 hover:bg-white/10 hover:text-foreground text-muted-foreground text-xs font-semibold transition cursor-pointer"
                                                    >
                                                        <ExternalLink className="h-3.5 w-3.5" />
                                                        Jump
                                                    </Link>
                                                )}

                                                {/* Move / Copy */}
                                                {!msg.deletedAt && (
                                                    <button
                                                        onClick={() => setTransferringMsgId(msg.id)}
                                                        title="Move or copy to another collection"
                                                        className="p-1.5 rounded-xl border border-white/[0.08] bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition cursor-pointer"
                                                    >
                                                        <ArrowRightLeft className="h-3.5 w-3.5" />
                                                    </button>
                                                )}

                                                {/* Unsave */}
                                                <button
                                                    onClick={() => unsave(msg.id)}
                                                    title="Remove bookmark"
                                                    className="p-1.5 rounded-xl border border-white/[0.04] bg-white/[0.02] text-muted-foreground hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 transition cursor-pointer"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {transferringMsgId && (
                <MoveCopyModal
                    open={!!transferringMsgId}
                    messageId={transferringMsgId}
                    currentCollectionId={collectionId}
                    collections={collections}
                    onClose={() => setTransferringMsgId(null)}
                    onSuccess={() => {
                        queryClient.invalidateQueries({ queryKey: ["collection-items", collectionId] });
                        queryClient.invalidateQueries({ queryKey: ["collections"] });
                    }}
                />
            )}
        </main>
    );
}
