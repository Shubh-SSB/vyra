"use client";

import { useState } from "react";
import { Bell, Check, X, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useIncomingRequests, useAcceptFriendRequest, useRejectFriendRequest } from "@/tanstack/queries/friend.query";
import Image from "next/image";

export default function FriendRequestBell() {
    const [open, setOpen] = useState(false);
    const { data: requests, isLoading } = useIncomingRequests();
    const accept = useAcceptFriendRequest();
    const reject = useRejectFriendRequest();

    const count = requests?.length ?? 0;

    return (
        <div className="relative">
            <button
                onClick={() => setOpen((o) => !o)}
                className="relative flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            >
                <Bell className="h-4 w-4" strokeWidth={1.75} />
                {count > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white leading-none">
                        {count > 9 ? "9+" : count}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {open && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setOpen(false)}
                        />

                        <motion.div
                            initial={{ opacity: 0, y: -6, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -6, scale: 0.97 }}
                            transition={{ duration: 0.14, ease: "easeOut" }}
                            className="absolute right-0 top-10 z-50 w-72 rounded-2xl border border-border bg-background shadow-xl"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                                <p className="text-[13px] font-semibold text-foreground">
                                    Friend Requests
                                </p>
                                {count > 0 && (
                                    <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[11px] font-medium text-red-400">
                                        {count} new
                                    </span>
                                )}
                            </div>

                            {/* List */}
                            <div className="max-h-72 overflow-y-auto py-1">
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-foreground" />
                                    </div>
                                ) : count === 0 ? (
                                    <div className="flex flex-col items-center gap-2 py-8 text-center">
                                        <UserPlus className="h-7 w-7 text-muted-foreground" strokeWidth={1.25} />
                                        <p className="text-[12px] text-muted-foreground">No pending requests</p>
                                    </div>
                                ) : (
                                    requests!.map((req) => {
                                        const initials = req.sender.displayName
                                            ? req.sender.displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                                            : req.sender.username.slice(0, 2).toUpperCase();

                                        return (
                                            <div
                                                key={req.id}
                                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface transition-colors"
                                            >
                                                {/* Avatar */}
                                                <div className="shrink-0">
                                                    {req.sender.avatarUrl ? (
                                                        <Image
                                                            src={req.sender.avatarUrl}
                                                            alt={req.sender.username}
                                                            width={36}
                                                            height={36}
                                                            className="rounded-full object-cover ring-1 ring-border"
                                                        />
                                                    ) : (
                                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-elevated text-[11px] font-semibold text-foreground ring-1 ring-border">
                                                            {initials}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Info */}
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-[13px] font-medium text-foreground">
                                                        {req.sender.displayName}
                                                    </p>
                                                    <p className="truncate text-[11px] text-muted-foreground">
                                                        @{req.sender.username}
                                                    </p>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex gap-1.5 shrink-0">
                                                    <button
                                                        onClick={() => accept.mutate(req.id)}
                                                        disabled={accept.isPending}
                                                        className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white hover:bg-emerald-400 transition-colors disabled:opacity-50"
                                                        title="Accept"
                                                    >
                                                        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                                                    </button>
                                                    <button
                                                        onClick={() => reject.mutate(req.id)}
                                                        disabled={reject.isPending}
                                                        className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                                                        title="Reject"
                                                    >
                                                        <X className="h-3.5 w-3.5" strokeWidth={2} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
