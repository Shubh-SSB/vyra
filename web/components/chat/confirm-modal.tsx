"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export type ConfirmAction = {
    label: string;
    description: string;
    icon: React.ReactNode;
    variant: "red" | "muted";
    onConfirm: () => void;
};

type ConfirmModalProps = {
    open: boolean;
    title: string;
    description: string;
    icon: React.ReactNode;
    confirmLabel: string;
    confirmVariant: "red" | "muted";
    onConfirm: () => void;
    onCancel: () => void;
};

export default function ConfirmModal({
    open,
    title,
    description,
    icon,
    confirmLabel,
    confirmVariant,
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onCancel();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [open, onCancel]);

    if (typeof window === "undefined") return null;

    return createPortal(
        <AnimatePresence>
            {open && (
                <motion.div
                    key="confirm-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    onClick={onCancel}
                >
                    {/* Blurred backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                    {/* Modal card */}
                    <motion.div
                        key="confirm-card"
                        initial={{ opacity: 0, scale: 0.92, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 12 }}
                        transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative z-10 w-full max-w-[340px] rounded-2xl border border-white/10 bg-[#18181b] shadow-2xl overflow-hidden"
                    >
                        {/* Top accent line */}
                        <div
                            className={cn(
                                "h-[2px] w-full",
                                confirmVariant === "red"
                                    ? "bg-gradient-to-r from-red-500/60 via-red-400/40 to-transparent"
                                    : "bg-gradient-to-r from-white/20 via-white/10 to-transparent",
                            )}
                        />

                        <div className="px-5 py-5 flex flex-col gap-4">
                            {/* Icon + Title */}
                            <div className="flex items-start gap-3">
                                <div
                                    className={cn(
                                        "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                                        confirmVariant === "red"
                                            ? "bg-red-500/15 text-red-400"
                                            : "bg-white/10 text-muted-foreground",
                                    )}
                                >
                                    {icon}
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <p className="text-sm font-semibold text-foreground leading-snug">
                                        {title}
                                    </p>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        {description}
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 justify-end">
                                <button
                                    onClick={onCancel}
                                    className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground border border-white/[0.08] hover:bg-white/5 hover:text-foreground transition-all duration-150 active:scale-95 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        onConfirm();
                                        onCancel();
                                    }}
                                    className={cn(
                                        "rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150 active:scale-95 cursor-pointer",
                                        confirmVariant === "red"
                                            ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 hover:text-red-300"
                                            : "bg-white/10 text-foreground border border-white/10 hover:bg-white/15",
                                    )}
                                >
                                    {confirmLabel}
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
