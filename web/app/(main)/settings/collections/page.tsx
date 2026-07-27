"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Bookmark, FolderPlus, Trash2, Loader2, Search, X, Plus } from "lucide-react";
import { CollectionService, Collection } from "@/services/collection.service";
import SettingSidebar from "@/components/ui/settings-sidebar";
import { useSnackbar } from "notistack";
import { createPortal } from "react-dom";
import CreateCollectionModal from "@/components/modal/create-collection.modal";
import DeleteCollectionConfirmModal from "@/components/modal/delete-collection-confirm.modal";

const EMOJI_OPTIONS = ["📌", "🔥", "⭐", "💡", "💖", "💼", "📝", "🎵", "✈️", "🏠", "🎨", "🎬"];

export default function CollectionsPage() {
    const { enqueueSnackbar } = useSnackbar();
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [deletingCollection, setDeletingCollection] = useState<Collection | null>(null);

    const { data: collections = [], isLoading } = useQuery({
        queryKey: ["collections"],
        queryFn: async () => {
            const res = await CollectionService.getCollections();
            return res.data;
        }
    });

    const { mutate: deleteCol } = useMutation({
        mutationFn: (id: string) => CollectionService.deleteCollection(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["collections"] });
            enqueueSnackbar("Collection deleted successfully", { variant: "success" });
        },
        onError: (err: any) => {
            enqueueSnackbar(err?.response?.data?.message || "Failed to delete collection", { variant: "error" });
        }
    });

    const filteredCollections = collections.filter((col) =>
        col.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <main className="min-h-svh overflow-x-hidden text-foreground font-geist">
            <div className="relative z-10 mx-auto flex w-full">
                <SettingSidebar
                    name="Collections"
                    navigateTo="Back To Settings"
                    path="/settings"
                    tagline="Save and organize your bookmarked messages"
                />

                <section className="min-w-0 flex-1 px-4 pb-28 pt-7 sm:px-7 sm:pt-10 lg:px-12 lg:pb-12 xl:px-16">
                    <div className="mx-auto max-w-[720px] w-full space-y-6">
                        {/* Mobile Header */}
                        <div className="flex items-center justify-between mb-2 lg:hidden">
                            <Link href="/settings" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition">
                                <ArrowLeft className="h-4 w-4" />
                                <span className="text-sm font-medium">Settings</span>
                            </Link>
                            <h1 className="text-sm font-semibold text-muted-foreground font-display">Collections</h1>
                            <div className="w-20" />
                        </div>

                        {/* Search & Actions Bar */}
                        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                            <div className="relative w-full sm:max-w-xs">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                                <input
                                    type="text"
                                    placeholder="Search collections..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-surface border border-white/[0.06] rounded-2xl text-xs placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-accent transition"
                                />
                            </div>

                            <button
                                onClick={() => setIsCreateOpen(true)}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-black hover:bg-white/90 active:scale-95 rounded-2xl text-xs font-semibold transition cursor-pointer"
                            >
                                <Plus className="w-4 h-4" />
                                New Collection
                            </button>
                        </div>

                        {/* Collections Grid */}
                        {isLoading ? (
                            <div className="flex items-center justify-center py-24">
                                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : filteredCollections.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/[0.06] rounded-3xl bg-[#151517]/30">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-elevated border border-white/[0.06] mb-3">
                                    <Bookmark className="h-7 w-7 text-muted-foreground" />
                                </div>
                                <p className="text-sm font-semibold">No collections found</p>
                                <p className="text-xs text-muted-foreground mt-1 max-w-[260px]">
                                    {searchQuery ? "Try a different search query" : "Create your first collection to start organizing saved messages"}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <AnimatePresence>
                                    {filteredCollections.map((col) => (
                                        <motion.div
                                            key={col.id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="group relative flex flex-col justify-between p-5 rounded-3xl border border-white/[0.06] bg-[#151517]/85 z-10 hover:border-white/20 transition-all duration-200"
                                        >
                                            <Link href={`/settings/collections/${col.id}`} className="absolute inset-0 z-10 rounded-2xl" />

                                            <div className="relative flex items-start justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    {/* <span className="text-3xl shrink-0 p-2 bg-white/5 rounded-2xl">{col.emoji || "📌"}</span> */}
                                                    <div className="min-w-0">
                                                        <h4 className="text-sm font-bold text-foreground truncate group-hover:opacity-90    transition">
                                                            {col.name}
                                                        </h4>
                                                        <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                                                            {col._count?.items ?? 0} saved message(s)
                                                        </p>
                                                    </div>
                                                </div>

                                                {!col.isDefault && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setDeletingCollection(col);
                                                        }}
                                                        className="p-1.5 z-20 rounded-xl border border-white/[0.04] bg-white/[0.02] text-muted-foreground hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 transition opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>

                                            <div className="relative z-10 flex items-center justify-between mt-6 text-[10px] text-muted-foreground/40">
                                                <span>Created {new Date(col.createdAt).toLocaleDateString()}</span>
                                                {col.isDefault && (
                                                    <span className="bg-accent/10 border border-accent/20 px-1.5 py-0.5 rounded-md text-[9px] font-bold text-main">DEFAULT</span>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            <CreateCollectionModal
                open={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onCreated={() => queryClient.invalidateQueries({ queryKey: ["collections"] })}
                Emoji_options={EMOJI_OPTIONS}
            />

            <DeleteCollectionConfirmModal
                open={!!deletingCollection}
                collectionName={deletingCollection?.name ?? ""}
                onConfirm={() => {
                    if (deletingCollection) {
                        deleteCol(deletingCollection.id);
                    }
                }}
                onCancel={() => setDeletingCollection(null)}
            />
        </main>
    );
}
