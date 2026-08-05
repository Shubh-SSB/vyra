"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download } from "lucide-react";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    src: string;
    type: "IMAGE" | "VIDEO";
    fileName?: string;
};

export default function MediaLightbox({ isOpen, onClose, src, type, fileName }: Props) {
    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (typeof window === "undefined") return null;

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        const link = document.createElement("a");
        link.href = src;
        link.download = fileName || "download";
        link.target = "_blank";
        link.click();
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
                    onClick={onClose}
                >
                    {/* Control Buttons */}
                    <div className="absolute top-4 right-4 flex items-center gap-3 z-[100]">
                        <button
                            onClick={handleDownload}
                            className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95 transition cursor-pointer"
                            title="Download"
                        >
                            <Download className="h-5 w-5" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95 transition cursor-pointer"
                            title="Close"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Image / Video Display */}
                    <motion.div
                        initial={{ scale: 0.95, y: 10 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 10 }}
                        transition={{ type: "spring", damping: 25, stiffness: 250 }}
                        className="relative max-w-full max-h-[85vh] flex items-center justify-center select-none"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {type === "IMAGE" ? (
                            <img
                                src={src}
                                alt="Preview"
                                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border border-white/5"
                            />
                        ) : (
                            <video
                                src={src}
                                controls
                                autoPlay
                                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border border-white/5"
                            />
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
