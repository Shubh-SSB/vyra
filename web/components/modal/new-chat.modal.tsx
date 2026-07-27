"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, MessageSquare, UserCheck, SearchCode, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFriends } from "@/tanstack/queries/friend.query";

function Avatar({ src, name = "", size = 38 }: { src?: string | null; name?: string | null; size?: number }) {
    const initials = (name || "")
        .split(" ")
        .slice(0, 2)
        .map((w) => w ? w[0] : "")
        .join("")
        .toUpperCase() || "?";
    return (
        <div className="shrink-0 rounded-full bg-surface-elevated border border-white/10 flex items-center justify-center overflow-hidden text-[12px] font-semibold text-muted-foreground" style={{ width: size, height: size }}>
            {src ? <img src={src} alt={name || "avatar"} className="w-full h-full object-cover" /> : initials}
        </div>
    );
}

import { getAccessToken } from "@/lib/token";

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

type Props = {
    open: boolean;
    onClose: () => void;
    onStartChat: (user: { id: string; displayName: string; username: string; avatarUrl?: string | null }) => void;
    onGoToGlobalSearch?: () => void;
};

export function NewChatModal({ open, onClose, onStartChat, onGoToGlobalSearch }: Props) {
    const { data: friends = [], isLoading } = useFriends();
    const [query, setQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const myUserId = getMyUserId();

    useEffect(() => {
        if (open) { setQuery(""); setTimeout(() => inputRef.current?.focus(), 150); }
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

    const resolvedFriends = useMemo(() => {
        if (!friends) return [];
        return friends.map((f: any) => {
            const isSenderMe = f.senderId === myUserId;
            return isSenderMe ? f.receiver : f.sender;
        }).filter(Boolean);
    }, [friends, myUserId]);

    const filteredFriends = useMemo(() => {
        const q = debouncedQuery.toLowerCase().trim();
        if (!q) return resolvedFriends;
        return resolvedFriends.filter((f: any) => {
            const name = f.displayName ?? "";
            const username = f.username ?? "";
            return name.toLowerCase().includes(q) || username.toLowerCase().includes(q);
        });
    }, [resolvedFriends, debouncedQuery]);

    if (typeof window === "undefined") return null;

    return createPortal(
        <AnimatePresence>
            {open && (
                <motion.div key="new-chat-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
                    <motion.div key="new-chat-card" initial={{ opacity: 0, y: 40, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.97 }} transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }} onClick={(e) => e.stopPropagation()} className="relative z-10 w-full sm:w-[420px] max-h-[82vh] sm:max-h-[520px] rounded-t-3xl sm:rounded-2xl border border-white/10 bg-[#141416]/95 shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden">
                        <div className="h-[2px] w-full bg-gradient-to-r from-emerald-500/60 via-emerald-400/30 to-transparent shrink-0" />
                        <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0"><div className="h-1 w-10 rounded-full bg-white/20" /></div>
                        
                        <div className="flex items-center justify-between px-5 py-4 shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400"><MessageSquare className="h-4 w-4" /></div>
                                <div>
                                    <h2 className="text-[14px] font-semibold text-foreground leading-tight">New Chat</h2>
                                    <p className="text-[11px] text-muted-foreground">Select a friend to start a conversation</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-muted-foreground hover:text-foreground transition cursor-pointer"><X className="h-4 w-4" /></button>
                        </div>

                        <div className="px-4 pb-3 shrink-0">
                            <div className="flex items-center gap-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] px-3 py-2.5">
                                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search friends by name or @username..." className="w-full bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground outline-none" />
                                {query && <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground transition cursor-pointer"><X className="h-3.5 w-3.5" /></button>}
                            </div>
                        </div>

                        <div className="h-px bg-white/[0.06] mx-4 shrink-0" />

                        <div className="flex-1 overflow-y-auto py-2 px-2 min-h-0">
                            {isLoading ? (
                                <div className="flex flex-col gap-2 p-2">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="flex items-center gap-3 px-3 py-3 animate-pulse">
                                            <div className="h-10 w-10 rounded-full bg-white/5" />
                                            <div className="flex-1 space-y-1.5">
                                                <div className="h-3.5 w-24 rounded bg-white/5" />
                                                <div className="h-2.5 w-32 rounded bg-white/5" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : filteredFriends.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-4">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.04] text-muted-foreground/60"><UserCheck className="h-5 w-5" /></div>
                                    <div>
                                        <p className="text-[13px] font-medium text-foreground">{query ? "No friends matched search" : "No friends found"}</p>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">Connect with people to start messaging them.</p>
                                    </div>
                                    {onGoToGlobalSearch && (
                                        <button onClick={() => { onGoToGlobalSearch(); onClose(); }} className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition cursor-pointer bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                                            <span>Find Connections</span>
                                            <ArrowRight className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>
                            ) : (
                                filteredFriends.map((friend) => (
                                    <button key={friend.id} onClick={() => { onStartChat(friend); onClose(); }} className="flex w-full items-center gap-3 px-4 py-3 transition-colors rounded-xl cursor-pointer text-left hover:bg-white/[0.04]">
                                        <Avatar src={friend.avatarUrl} name={friend.displayName ?? friend.username} />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[13px] font-semibold text-foreground truncate">{friend.displayName}</p>
                                            <p className="text-[11px] text-muted-foreground truncate">@{friend.username}</p>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body,
    );
}
