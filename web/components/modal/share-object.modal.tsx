"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Check, Send } from "lucide-react";
import { useConversations } from "@/tanstack/queries/conversation.query";
import { cn } from "@/lib/utils";
import { getMyUserId } from "@/lib/token";
import type { RichObject } from "@/services/explore.service"; // We will add the import/type

interface ShareObjectModalProps {
    open: boolean;
    onClose: () => void;
    richObject: RichObject | null;
    onSend: (conversationId: string) => Promise<boolean> | boolean;
}

export default function ShareObjectModal({
    open,
    onClose,
    richObject,
    onSend,
}: ShareObjectModalProps) {
    const { data: conversations = [] } = useConversations();
    const [searchQuery, setSearchQuery] = useState("");
    const [sendingMap, setSendingMap] = useState<Record<string, boolean>>({});
    const [sentMap, setSentMap] = useState<Record<string, boolean>>({});
    const myUserId = getMyUserId();

    if (typeof window === "undefined" || !open || !richObject) return null;

    // Filter conversations based on query
    const filteredConversations = conversations.filter((conv) => {
        const otherParticipant = conv.participants.find((p) => p.userId !== myUserId);
        const name = conv.type === "DIRECT" 
            ? otherParticipant?.user.displayName || "Unknown User" 
            : conv.participants.map((p) => p.user.displayName).filter(Boolean).join(", ") || "Group Chat";
        return name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const handleSend = async (conversationId: string) => {
        setSendingMap((prev) => ({ ...prev, [conversationId]: true }));
        try {
            const success = await onSend(conversationId);
            if (success) {
                setSentMap((prev) => ({ ...prev, [conversationId]: true }));
            }
        } catch (err) {
            console.error("[Vyra Share] Failed to send rich object:", err);
        } finally {
            setSendingMap((prev) => ({ ...prev, [conversationId]: false }));
        }
    };

    return createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                {/* Backdrop trap close */}
                <div className="absolute inset-0" onClick={onClose} />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 16 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="relative w-full max-w-[440px] h-[550px] rounded-3xl border border-white/10 bg-[#121214] flex flex-col overflow-hidden shadow-2xl z-10"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.06] px-5">
                        <h3 className="text-sm font-semibold text-foreground">Send to Chat</h3>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-full text-muted-foreground hover:bg-white/5 hover:text-foreground transition cursor-pointer"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Shared Object card details */}
                    <div className="p-4 bg-white/[0.02] border-b border-white/[0.04] flex items-center gap-3">
                        {richObject.image ? (
                            <img 
                                src={richObject.image} 
                                alt={richObject.title} 
                                className="w-12 h-12 rounded-xl object-cover border border-white/10 bg-black/20 shrink-0" 
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-white/10 shrink-0">
                                <span className="text-lg">⚡</span>
                            </div>
                        )}
                        <div className="min-w-0 flex-1 leading-tight">
                            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                                {richObject.type.replace("_", " ")}
                            </span>
                            <h4 className="text-sm font-semibold text-foreground truncate mt-0.5">{richObject.title}</h4>
                            <p className="text-xs text-muted-foreground truncate">{richObject.subtitle}</p>
                        </div>
                    </div>

                    {/* Search Field */}
                    <div className="p-4 shrink-0">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search people and groups..."
                                className="w-full rounded-xl border border-white/10 bg-[#161619] py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Scrollable list of chats */}
                    <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
                        {filteredConversations.length === 0 ? (
                            <div className="text-center py-10 text-xs text-muted-foreground">
                                No conversations found.
                            </div>
                        ) : (
                            filteredConversations.map((conv) => {
                                const otherParticipant = conv.participants.find((p) => p.userId !== myUserId);
                                const displayName = conv.type === "DIRECT" 
                                    ? otherParticipant?.user.displayName || "Unknown User" 
                                    : conv.participants.map((p) => p.user.displayName).filter(Boolean).join(", ") || "Group Chat";
                                const avatar = conv.type === "DIRECT" 
                                    ? otherParticipant?.user.avatarUrl 
                                    : null;
                                
                                const isSent = sentMap[conv.id];
                                const isSending = sendingMap[conv.id];

                                return (
                                    <div 
                                        key={conv.id}
                                        className="flex items-center justify-between p-2 rounded-2xl hover:bg-white/[0.03] transition-colors"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            {avatar ? (
                                                <img 
                                                    src={avatar} 
                                                    alt={displayName} 
                                                    className="w-10 h-10 rounded-full object-cover bg-black/20 border border-white/5" 
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center border border-white/5 text-sm font-semibold text-foreground">
                                                    {displayName.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="min-w-0 leading-tight">
                                                <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {conv.type === "DIRECT" ? "@" + (otherParticipant?.user.username || "user") : "Group chat"}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            disabled={isSent || isSending}
                                            onClick={() => handleSend(conv.id)}
                                            className={cn(
                                                "h-8 px-4 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer disabled:scale-100",
                                                isSent
                                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                    : "bg-foreground text-background hover:opacity-90 active:scale-95"
                                            )}
                                        >
                                            {isSent ? (
                                                <>
                                                    <Check className="h-3.5 w-3.5" />
                                                    Sent
                                                </>
                                            ) : isSending ? (
                                                "Sending..."
                                            ) : (
                                                <>
                                                    <Send className="h-3 w-3" />
                                                    Send
                                                </>
                                            )}
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
}
