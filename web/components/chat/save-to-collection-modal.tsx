"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Bookmark, Plus, Loader2, FolderPlus, Check, X } from "lucide-react";
import { CollectionService, Collection } from "@/services/collection.service";
import { useSnackbar } from "notistack";
import { useQueryClient } from "@tanstack/react-query";

const EMOJI_OPTIONS = ["📌", "🔥", "⭐", "💡", "💖", "💼", "📝", "🎵", "✈️", "🏠", "🎨", "🎬"];

interface SaveToCollectionModalProps {
    open: boolean;
    messageId: string;
    conversationId: string;
    onClose: () => void;
}

export function SaveToCollectionModal({ open, messageId, conversationId, onClose }: SaveToCollectionModalProps) {
    const { enqueueSnackbar } = useSnackbar();
    const queryClient = useQueryClient();
    const [collections, setCollections] = useState<Collection[]>([]);
    const [savedStatus, setSavedStatus] = useState<string[]>([]); // Array of collection IDs where message is saved
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);

    // New collection form state
    const [showNewForm, setShowNewForm] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState("");
    const [selectedEmoji, setSelectedEmoji] = useState("📌");
    const [creating, setCreating] = useState(false);

    // Fetch collections and message saved status
    useEffect(() => {
        if (!open) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                const [colsRes, statusRes] = await Promise.all([
                    CollectionService.getCollections(),
                    CollectionService.getMessageSavedStatus(messageId)
                ]);
                setCollections(colsRes.data);
                setSavedStatus(statusRes.data);
            } catch (err: any) {
                enqueueSnackbar(err?.response?.data?.message || "Failed to load collections", { variant: "error" });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [open, messageId]);

    // Close on escape key
    useEffect(() => {
        if (!open) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, onClose]);

    const handleToggleSave = async (collectionId: string) => {
        const isSaved = savedStatus.includes(collectionId);
        setSavingId(collectionId);

        try {
            if (isSaved) {
                await CollectionService.unsaveFromCollection(collectionId, messageId);
                setSavedStatus((prev) => prev.filter((id) => id !== collectionId));
                enqueueSnackbar("Removed from collection", { variant: "success" });
            } else {
                await CollectionService.saveToCollection(collectionId, messageId);
                setSavedStatus((prev) => [...prev, collectionId]);
                enqueueSnackbar("Saved to collection", { variant: "success" });
            }

            // Update React Query Cache
            queryClient.setQueryData<any>(["messages", conversationId], (current: any) => {
                if (!current) return current;
                return {
                    ...current,
                    pages: current.pages.map((page: any[]) =>
                        page.map((msg) =>
                            msg.id === messageId
                                ? {
                                      ...msg,
                                      savedIn: isSaved
                                          ? (msg.savedIn || []).filter((s: any) => s.collectionId !== collectionId)
                                          : [...(msg.savedIn || []), { collectionId }],
                                  }
                                : msg
                        )
                    ),
                };
            });

            // Refresh collections list to update counts
            const colsRes = await CollectionService.getCollections();
            setCollections(colsRes.data);
        } catch (err: any) {
            enqueueSnackbar(err?.response?.data?.message || "Operation failed", { variant: "error" });
        } finally {
            setSavingId(null);
        }
    };

    const handleCreateCollection = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = newCollectionName.trim();
        if (!trimmed) return;

        setCreating(true);
        try {
            const res = await CollectionService.createCollection(trimmed, selectedEmoji);
            const newCol = res.data;
            setCollections((prev) => [...prev, newCol]);
            
            // Automatically save to the newly created collection
            await CollectionService.saveToCollection(newCol.id, messageId);
            setSavedStatus((prev) => [...prev, newCol.id]);

            // Update React Query Cache
            queryClient.setQueryData<any>(["messages", conversationId], (current: any) => {
                if (!current) return current;
                return {
                    ...current,
                    pages: current.pages.map((page: any[]) =>
                        page.map((msg) =>
                            msg.id === messageId
                                ? {
                                      ...msg,
                                      savedIn: [...(msg.savedIn || []), { collectionId: newCol.id }],
                                  }
                                : msg
                        )
                    ),
                };
            });

            enqueueSnackbar(`Saved to new collection "${trimmed}"`, { variant: "success" });
            
            // Reset form
            setNewCollectionName("");
            setShowNewForm(false);
            
            // Refresh collections list to update counts
            const colsRes = await CollectionService.getCollections();
            setCollections(colsRes.data);
        } catch (err: any) {
            enqueueSnackbar(err?.response?.data?.message || "Failed to create collection", { variant: "error" });
        } finally {
            setCreating(false);
        }
    };

    if (typeof window === "undefined" || !open) return null;

    return createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                {/* Backdrop overlay */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 16 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="relative z-10 w-full max-w-[380px] rounded-3xl border border-white/10 bg-[#151517] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                        <div className="flex items-center gap-2">
                            <Bookmark className="h-4 w-4 text-accent" />
                            <h3 className="text-sm font-semibold text-foreground">Save to Collection</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-full text-muted-foreground hover:bg-white/5 hover:text-foreground transition cursor-pointer"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Collection List Container */}
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-3">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                <p className="text-xs text-muted-foreground">Loading collections...</p>
                            </div>
                        ) : (
                            <>
                                {collections.map((col) => {
                                    const isSaved = savedStatus.includes(col.id);
                                    const isSaving = savingId === col.id;
                                    return (
                                        <button
                                            key={col.id}
                                            onClick={() => handleToggleSave(col.id)}
                                            disabled={isSaving}
                                            className={cn(
                                                "w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer",
                                                isSaved 
                                                    ? "bg-accent/10 border-accent/30 text-foreground" 
                                                    : "bg-white/[0.02] border-white/[0.04] text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
                                            )}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <span className="text-xl shrink-0">{col.emoji || "📌"}</span>
                                                <div className="min-w-0">
                                                    <p className="text-[13px] font-semibold truncate leading-tight">
                                                        {col.name}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                                                        {col._count?.items ?? 0} saved items
                                                    </p>
                                                </div>
                                            </div>

                                            <div className={cn(
                                                "h-5 w-5 rounded-full flex items-center justify-center transition-all duration-200",
                                                isSaved ? "bg-accent text-background" : "border border-white/20"
                                            )}>
                                                {isSaving ? (
                                                    <Loader2 className="h-3 w-3 animate-spin text-current" />
                                                ) : isSaved ? (
                                                    <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                                                ) : null}
                                            </div>
                                        </button>
                                    );
                                })}

                                {!showNewForm && (
                                    <button
                                        onClick={() => setShowNewForm(true)}
                                        className="w-full flex items-center gap-3 p-3 rounded-2xl border border-dashed border-white/[0.08] bg-transparent text-muted-foreground hover:border-white/20 hover:text-foreground transition cursor-pointer"
                                    >
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5">
                                            <Plus className="h-4 w-4" />
                                        </span>
                                        <span className="text-[13px] font-semibold">Create New Collection</span>
                                    </button>
                                )}

                                {/* Inline Create Form */}
                                {showNewForm && (
                                    <motion.form
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        onSubmit={handleCreateCollection}
                                        className="p-3 rounded-2xl border border-white/[0.08] bg-white/[0.01] space-y-3"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl shrink-0 p-1 bg-white/5 rounded-lg">{selectedEmoji}</span>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Collection Name"
                                                value={newCollectionName}
                                                onChange={(e) => setNewCollectionName(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-accent placeholder:text-muted-foreground/50 text-foreground"
                                            />
                                        </div>

                                        {/* Emoji Grid Selection */}
                                        <div className="flex flex-wrap gap-1.5 py-1">
                                            {EMOJI_OPTIONS.map((emoji) => (
                                                <button
                                                    key={emoji}
                                                    type="button"
                                                    onClick={() => setSelectedEmoji(emoji)}
                                                    className={cn(
                                                        "text-lg p-1 hover:scale-125 transition cursor-pointer rounded-lg",
                                                        selectedEmoji === emoji ? "bg-white/10 scale-110" : ""
                                                    )}
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center justify-end gap-2 pt-1">
                                            <button
                                                type="button"
                                                disabled={creating}
                                                onClick={() => {
                                                    setShowNewForm(false);
                                                    setNewCollectionName("");
                                                }}
                                                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:bg-white/5 hover:text-foreground transition cursor-pointer"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={creating || !newCollectionName.trim()}
                                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-accent text-background hover:opacity-90 active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
                                            >
                                                {creating ? (
                                                    <Loader2 className="h-3 w-3 animate-spin text-current" />
                                                ) : (
                                                    <FolderPlus className="h-3.5 w-3.5" />
                                                )}
                                                Create & Save
                                            </button>
                                        </div>
                                    </motion.form>
                                )}
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
}
