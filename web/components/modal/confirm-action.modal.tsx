"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmActionModalProps {
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    confirmVariant?: "red" | "muted" | "primary";
    icon?: React.ReactNode;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmActionModal({
    open,
    title,
    description,
    confirmLabel,
    confirmVariant = "red",
    icon,
    onConfirm,
    onCancel,
}: ConfirmActionModalProps) {
    
    // Close on Escape key press
    useEffect(() => {
        if (!open) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onCancel();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, onCancel]);

    if (typeof window === "undefined" || !open) return null;

    return createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                {/* Backdrop Overlay */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onCancel}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 16 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="relative z-10 w-full max-w-[350px] rounded-3xl border border-white/10 bg-[#151517] p-5 shadow-2xl space-y-4"
                >
                    {/* Top warning border */}
                    <div 
                        className={cn(
                            "absolute top-0 inset-x-0 h-1 rounded-t-3xl",
                            confirmVariant === "red" 
                                ? "bg-gradient-to-r from-red-500/50 to-transparent" 
                                : "bg-gradient-to-r from-primary/50 to-transparent"
                        )} 
                    />

                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div 
                            className={cn(
                                "flex items-center gap-2",
                                confirmVariant === "red" ? "text-red-400" : "text-primary"
                            )}
                        >
                            {icon || <AlertTriangle className="h-5 w-5" />}
                            <h3 className="text-sm font-semibold">{title}</h3>
                        </div>
                        <button
                            onClick={onCancel}
                            className="p-1 rounded-full text-muted-foreground hover:bg-white/5 hover:text-foreground transition cursor-pointer"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Warning Description */}
                    <div className="space-y-1.5 select-none">
                        <p className="text-xs text-[#eeece4] leading-relaxed">
                            {description}
                        </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.06]">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-white/5 hover:text-foreground transition cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onCancel();
                            }}
                            className={cn(
                                "px-4 py-2 rounded-xl text-xs font-semibold active:scale-95 transition flex items-center gap-1.5 cursor-pointer",
                                confirmVariant === "red"
                                    ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                                    : confirmVariant === "primary"
                                    ? "bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30"
                                    : "bg-white/10 text-foreground border border-white/10 hover:bg-white/15"
                            )}
                        >
                            {confirmLabel}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body,
    );
}
