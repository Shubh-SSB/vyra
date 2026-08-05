"use client";

import { useEffect, useRef } from "react";
import { Image, FileText, BarChart2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSelectPhotos: () => void;
    onSelectDocument: () => void;
    onSelectPoll?: () => void;
    onSelectContact?: () => void;
};

export default function AttachmentMenu({
    isOpen,
    onClose,
    onSelectPhotos,
    onSelectDocument,
    onSelectPoll,
    onSelectContact,
}: Props) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        if (!isOpen) return;

        const handleOutsideClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        // Delay registering to avoid immediate trigger when clicking the paperclip
        const timer = setTimeout(() => {
            window.addEventListener("click", handleOutsideClick);
        }, 0);

        return () => {
            clearTimeout(timer);
            window.removeEventListener("click", handleOutsideClick);
        };
    }, [isOpen, onClose]);

    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    const menuItems = [
        {
            label: "Photos & Videos",
            icon: <Image className="h-5 w-5 text-emerald-400" />,
            bg: "hover:bg-emerald-500/20 border-emerald-500/20",
            onClick: () => {
                onSelectPhotos();
                onClose();
            },
        },
        {
            label: "Document",
            icon: <FileText className="h-5 w-5 text-blue-400" />,
            bg: "hover:bg-blue-500/20 border-blue-500/20",
            onClick: () => {
                onSelectDocument();
                onClose();
            },
        },
        {
            label: "Poll",
            icon: <BarChart2 className="h-5 w-5 text-orange-400" />,
            bg: "hover:bg-orange-500/20 border-orange-500/20",
            onClick: () => {
                onSelectPoll?.();
                onClose();
            },
        },
        {
            label: "Contact",
            icon: <User className="h-5 w-5 text-purple-400" />,
            bg: "hover:bg-purple-500/20 border-purple-500/20",
            onClick: () => {
                onSelectContact?.();
                onClose();
            },
        },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={containerRef}
                    initial={{ opacity: 0, scale: 0.9, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 15 }}
                    transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
                    className="absolute bottom-12 left-0 z-[100] w-52 rounded-2xl border border-white/10 bg-black/50 shadow-2xl p-2.5 backdrop-blur-sm flex flex-col gap-1"
                >
                    {menuItems.map((item, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={item.onClick}
                            className={cn(
                                "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl border text-xs font-semibold text-foreground transition duration-150 ease-out cursor-pointer active:scale-97 text-left border-transparent",
                                item.bg
                            )}
                        >
                            <span className="shrink-0">{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
