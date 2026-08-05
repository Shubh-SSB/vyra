"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { Pin } from "lucide-react";

type PinDurationModalProps = {
    open: boolean;
    onConfirm: (durationMs: number | null) => void;
    onCancel: () => void;
};

export default function PinDurationModal({
    open,
    onConfirm,
    onCancel,
}: PinDurationModalProps) {
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onCancel();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [open, onCancel]);

    if (typeof window === "undefined") return null;

    const options = [
        { label: "1 Hour", value: 60 * 60 * 1000 },
        { label: "24 Hours", value: 24 * 60 * 60 * 1000 },
        { label: "7 Days", value: 7 * 24 * 60 * 60 * 1000 },
        { label: "Forever", value: null },
    ];

    return createPortal(
        <AnimatePresence>
            {open && (
                <motion.div
                    key="pin-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    onClick={onCancel}
                >
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                    <motion.div
                        key="pin-card"
                        initial={{ opacity: 0, scale: 0.92, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 12 }}
                        transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative z-10 w-full max-w-[340px] rounded-2xl border border-white/10 bg-[#18181b] shadow-2xl overflow-hidden"
                    >
                        <div className="h-[2px] w-full bg-gradient-to-r from-emerald-500/60 via-emerald-400/40 to-transparent" />

                        <div className="px-5 py-5 flex flex-col gap-4">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                                    <Pin className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <p className="text-sm font-semibold text-foreground leading-snug">
                                        Pin Message
                                    </p>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Choose how long this message should remain pinned in the chat.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5 my-1">
                                {options.map((opt) => (
                                    <button
                                        key={opt.label}
                                        onClick={() => {
                                            onConfirm(opt.value);
                                            onCancel();
                                        }}
                                        className="w-full text-left rounded-lg px-3.5 py-2.5 text-xs font-semibold bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.12] text-foreground transition-all duration-150 active:scale-[0.98] cursor-pointer"
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center justify-end">
                                <button
                                    onClick={onCancel}
                                    className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground border border-white/[0.08] hover:bg-white/5 hover:text-foreground transition-all duration-150 active:scale-95 cursor-pointer"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body,
    );
}
