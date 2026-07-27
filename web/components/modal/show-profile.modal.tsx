"use client";

import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

import { showProfileProps } from "@/types/user.type";
import Image from "next/image";


export default function ShowProfileModal({ open = true, onClose, displayName, username, avatarUrl, bannerUrl, bio
}: showProfileProps) {

    // useEffect(() => {
    //     if (open) { setQuery(""); setTimeout(() => inputRef.current?.focus(), 150); }
    // }, [open]);

    // useEffect(() => {
    //     if (!open) return;
    //     const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    //     window.addEventListener("keydown", handler);
    //     return () => window.removeEventListener("keydown", handler);
    // }, [open, onClose]);

    const initials = displayName
        ? displayName.trim().split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
        : username
        ? username.slice(0, 2).toUpperCase()
        : "?";

    if (typeof window === "undefined") return null;

    return createPortal(
        <AnimatePresence>
            {open && (
                <motion.div key="show-profile-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
                    <motion.div key="show-profile-card" initial={{ opacity: 0, y: 40, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.97 }} transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }} onClick={(e) => e.stopPropagation()} className="relative z-10 w-full sm:w-[420px] max-h-[82vh] sm:max-h-[520px] rounded-t-3xl sm:rounded-2xl border border-white/10 bg-[#141416]/95 shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden">
                        {/* Mobile handle indicator */}
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 sm:hidden flex justify-center pb-1 shrink-0">
                            <div className="h-1 w-10 rounded-full bg-white/30" />
                        </div>

                        {/* Banner Image Container */}
                        <div className="relative h-[140px] w-full shrink-0">
                            <Image
                                src={bannerUrl || "/bg-2.jpeg"}
                                alt="banner"
                                fill
                                className="object-cover"
                                priority
                            />
                            {/* Gradient Overlay for modern look and text contrast */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#141416] via-[#141416]/20 to-transparent" />

                            {/* Close Button on Banner */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white transition backdrop-blur-md cursor-pointer border border-white/10 hover:scale-105 active:scale-95"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Profile Details Container (Avatar overlapping) */}
                        <div className="relative px-6 pb-6 flex flex-col items-center">
                            {/* Avatar */}
                            <div className="relative -mt-[50px] z-10 flex h-[250px] w-[250px] items-center justify-center rounded-full bg-gradient-to-tr from-main/90 via-main/20 to-main/90 p-[3px] shadow-lg">
                                <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-[#141416] bg-[#141416] flex items-center justify-center text-4xl font-bold text-foreground">
                                    {avatarUrl ? (
                                        <Image
                                            src={avatarUrl}
                                            fill
                                            alt={displayName}
                                            className="object-cover"
                                        />
                                    ) : (
                                        initials
                                    )}
                                </div>
                            </div>

                            {/* Names */}
                            <div className="text-center mt-3">
                                <h2 className="text-xl font-bold text-foreground leading-snug">{displayName}</h2>
                                <p className="text-sm text-main font-medium mt-0.5">@{username}</p>
                            </div>

                            {/* Divider */}
                            <div className="w-full h-px bg-white/5 my-5" />

                            {/* About/Bio */}
                            <div className="w-full space-y-2 text-left">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">About</p>
                                <p className="text-foreground/90 text-sm leading-relaxed font-normal">
                                    {bio || "No bio yet."}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )
            }
        </AnimatePresence >,
        document.body,
    );
}
