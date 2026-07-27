"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Forward, Check, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useConversations } from "@/tanstack/queries/conversation.query";
import { getAccessToken } from "@/lib/token";
import { MessageService } from "@/services/message.service";
import { ConversationPreview } from "@/types/conversation";

function getMyUserId(): string | null {
    try {
        const token = getAccessToken();
        if (!token) return null;
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.sub ?? payload.id ?? payload.userId ?? null;
    } catch {
        return null;
    }
}

function getOtherUser(conv: ConversationPreview, myUserId: string | null) {
    const other = conv.participants.find((p) => p.userId !== myUserId);
    return other?.user ?? null;
}

function Avatar({ src, name, size = 40 }: { src?: string | null; name: string; size?: number }) {
    const initials = name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
    return (
        <div className="shrink-0 rounded-full bg-surface-elevated border border-white/10 flex items-center justify-center overflow-hidden text-[13px] font-semibold text-muted-foreground" style={{ width: size, height: size }}>
            {src ? <img src={src} alt={name} className="w-full h-full object-cover" /> : initials}
        </div>
    );
}

function RecipientRow({ name, subtitle, avatarUrl, selected, onToggle }: { name: string; subtitle?: string; avatarUrl?: string | null; selected: boolean; onToggle: () => void; }) {
    return (
        <motion.button layout onClick={onToggle} className={cn("flex w-full items-center gap-3 px-4 py-3 transition-colors rounded-xl cursor-pointer text-left", selected ? "bg-white/[0.08]" : "hover:bg-white/[0.04]")}>
            <div className="relative shrink-0">
                <Avatar src={avatarUrl} name={name} size={42} />
                <AnimatePresence>
                    {selected && (
                        <motion.div key="check" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full bg-emerald-500 border-2 border-[#18181b] flex items-center justify-center">
                            <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-foreground truncate">{name}</p>
                {subtitle && <p className="text-[11px] text-muted-foreground truncate">{subtitle}</p>}
            </div>
            <div className={cn("h-5 w-5 shrink-0 rounded-full border-2 transition-colors flex items-center justify-center", selected ? "bg-emerald-500 border-emerald-500" : "border-white/20 bg-transparent")}>
                {selected && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
            </div>
        </motion.button>
    );
}

type Props = {
    open: boolean;
    messageIds: string[];
    onClose: () => void;
    onSuccess?: (count: number) => void;
};

export function ForwardMessageModal({ open, messageIds, onClose, onSuccess }: Props) {
    const myUserId = getMyUserId();
    const { data: conversations = [] } = useConversations();
    const [query, setQuery] = useState("");
    const [selectedConvIds, setSelectedConvIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) { setQuery(""); setSelectedConvIds(new Set()); setError(null); setTimeout(() => inputRef.current?.focus(), 150); }
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [open, onClose]);

    const [debouncedQuery, setDebouncedQuery] = useState("");

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(query);
        }, 180);
        return () => clearTimeout(handler);
    }, [query]);

    const filtered = useMemo(() => {
        const q = debouncedQuery.toLowerCase().trim();
        return conversations.filter((conv) => {
            const other = getOtherUser(conv, myUserId);
            if (!other) return false;
            const name = other.displayName ?? other.username ?? "";
            return !q || name.toLowerCase().includes(q);
        });
    }, [conversations, debouncedQuery, myUserId]);

    const toggleConv = useCallback((id: string) => {
        setSelectedConvIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
    }, []);

    const handleForward = async () => {
        if (!selectedConvIds.size || !messageIds.length) return;
        setLoading(true); setError(null);
        try {
            await MessageService.forwardMessages(messageIds, Array.from(selectedConvIds));
            onSuccess?.(selectedConvIds.size);
            onClose();
        } catch (err: any) {
            setError(err?.response?.data?.message ?? "Failed to forward messages");
        } finally { setLoading(false); }
    };

    if (typeof window === "undefined") return null;

    return createPortal(
        <AnimatePresence>
            {open && (
                <motion.div key="forward-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
                    <motion.div key="forward-card" initial={{ opacity: 0, y: 40, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.97 }} transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }} onClick={(e) => e.stopPropagation()} className="relative z-10 w-full sm:w-[440px] max-h-[82vh] sm:max-h-[580px] rounded-t-3xl sm:rounded-2xl border border-white/10 bg-[#141416]/95 shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden">
                        <div className="h-[2px] w-full bg-gradient-to-r from-emerald-500/60 via-emerald-400/30 to-transparent shrink-0" />
                        <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0"><div className="h-1 w-10 rounded-full bg-white/20" /></div>
                        <div className="flex items-center justify-between px-5 py-4 shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400"><Forward className="h-4 w-4" /></div>
                                <div>
                                    <h2 className="text-[14px] font-semibold text-foreground leading-tight">Forward {messageIds.length > 1 ? `${messageIds.length} messages` : "message"}</h2>
                                    <p className="text-[11px] text-muted-foreground">{selectedConvIds.size > 0 ? `${selectedConvIds.size} chat${selectedConvIds.size > 1 ? "s" : ""} selected` : "Select chats to forward to"}</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-muted-foreground hover:text-foreground transition cursor-pointer"><X className="h-4 w-4" /></button>
                        </div>
                        <div className="px-4 pb-3 shrink-0">
                            <div className="flex items-center gap-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] px-3 py-2.5">
                                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search chats..." className="w-full bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground outline-none" />
                                {query && <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground transition cursor-pointer"><X className="h-3.5 w-3.5" /></button>}
                            </div>
                        </div>
                        <AnimatePresence>
                            {selectedConvIds.size > 0 && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden shrink-0">
                                    <div className="flex gap-2 px-4 pb-3 flex-wrap">
                                        {Array.from(selectedConvIds).map((id) => {
                                            const conv = conversations.find((c) => c.id === id);
                                            const other = conv ? getOtherUser(conv, myUserId) : null;
                                            if (!other) return null;
                                            return (
                                                <motion.button key={id} layout initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ duration: 0.12 }} onClick={() => toggleConv(id)} className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-medium px-2.5 py-1 cursor-pointer hover:bg-emerald-500/25 transition">
                                                    <span className="truncate max-w-[80px]">{other.displayName ?? other.username}</span>
                                                    <X className="h-3 w-3 shrink-0" />
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <div className="h-px bg-white/[0.06] mx-4 shrink-0" />
                        <div className="flex-1 overflow-y-auto py-2 px-2 min-h-0">
                            {filtered.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                                    <MessageCircle className="h-8 w-8 text-muted-foreground/40" />
                                    <p className="text-[13px] text-muted-foreground">{query ? "No chats found" : "No conversations yet"}</p>
                                </div>
                            ) : (
                                filtered.map((conv) => {
                                    const other = getOtherUser(conv, myUserId);
                                    if (!other) return null;
                                    const lastMsg = conv.messages?.at(-1);
                                    return (
                                        <RecipientRow key={conv.id} name={other.displayName ?? other.username} subtitle={lastMsg?.content?.slice(0, 40)} avatarUrl={other.avatarUrl} selected={selectedConvIds.has(conv.id)} onToggle={() => toggleConv(conv.id)} />
                                    );
                                })
                            )}
                        </div>
                        <AnimatePresence>
                            {error && <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-center text-[12px] text-red-400 px-5 pb-2 shrink-0">{error}</motion.p>}
                        </AnimatePresence>
                        <div className="shrink-0 flex items-center gap-3 px-5 py-4 border-t border-white/[0.06]">
                            <button onClick={onClose} className="flex-1 rounded-xl border border-white/[0.08] bg-transparent py-2.5 text-[13px] font-medium text-muted-foreground hover:bg-white/[0.05] hover:text-foreground transition cursor-pointer">Cancel</button>
                            <motion.button whileTap={{ scale: 0.96 }} onClick={handleForward} disabled={!selectedConvIds.size || loading} className={cn("flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-semibold transition cursor-pointer", selectedConvIds.size > 0 && !loading ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20" : "bg-white/[0.06] text-muted-foreground cursor-not-allowed opacity-50")}>
                                {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <><Forward className="h-4 w-4" /><span>Forward{selectedConvIds.size > 0 ? ` to ${selectedConvIds.size}` : ""}</span></>}
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body,
    );
}
