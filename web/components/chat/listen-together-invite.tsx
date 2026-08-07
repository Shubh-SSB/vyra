"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Music, Users, X, Check } from "lucide-react";

type ListenTogetherInviteProps = {
    open: boolean;
    senderName: string;
    track: {
        title: string;
        artist: string;
        coverUrl?: string;
    } | null;
    onAccept: () => void;
    onDecline: () => void;
};

export default function ListenTogetherInvite({
    open,
    senderName,
    track,
    onAccept,
    onDecline,
}: ListenTogetherInviteProps) {
    return (
        <AnimatePresence>
            {open && track && (
                <motion.div
                    key="listen-invite-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md"
                    onClick={onDecline}
                >
                    <motion.div
                        initial={{ scale: 0.85, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.85, opacity: 0, y: 30 }}
                        transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-[340px] max-w-[90vw] rounded-3xl border border-white/10 bg-[#111114]/95 backdrop-blur-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Background glow from album art */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                            {track.coverUrl && (
                                <img
                                    src={track.coverUrl}
                                    alt=""
                                    className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-20 scale-150"
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#111114]" />
                        </div>

                        {/* Dismiss button */}
                        <button
                            onClick={onDecline}
                            className="absolute top-3 right-3 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition cursor-pointer"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>

                        {/* Content */}
                        <div className="relative z-10 flex flex-col items-center px-8 pt-8 pb-6">
                            {/* Pulsing icon */}
                            <div className="relative mb-4">
                                <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" style={{ animationDuration: "2s" }} />
                                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/25">
                                    <Users className="h-7 w-7 text-white" />
                                </div>
                            </div>

                            {/* Title */}
                            <h3 className="text-base font-bold text-white text-center">
                                Listen Together
                            </h3>
                            <p className="text-sm text-white/50 text-center mt-1 leading-relaxed max-w-[240px]">
                                <span className="text-white/80 font-semibold">{senderName}</span> wants to listen to a song with you
                            </p>

                            {/* Song preview card */}
                            <div className="w-full mt-5 flex items-center gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
                                {track.coverUrl ? (
                                    <img
                                        src={track.coverUrl}
                                        alt={track.title}
                                        className="h-12 w-12 rounded-xl object-cover border border-white/10 shrink-0"
                                    />
                                ) : (
                                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center border border-white/10 shrink-0">
                                        <Music className="h-5 w-5 text-white/80" />
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-white truncate">
                                        {track.title}
                                    </p>
                                    <p className="text-xs text-white/40 truncate">
                                        {track.artist}
                                    </p>
                                </div>
                                <div className="flex items-end gap-0.5 h-4 shrink-0 pr-1">
                                    <div className="w-0.5 bg-emerald-400 animate-[bounce_0.8s_infinite_100ms] h-full rounded-full" />
                                    <div className="w-0.5 bg-emerald-400 animate-[bounce_0.8s_infinite_300ms] h-1/2 rounded-full" />
                                    <div className="w-0.5 bg-emerald-400 animate-[bounce_0.8s_infinite_200ms] h-3/4 rounded-full" />
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-3 w-full mt-6">
                                <button
                                    onClick={onDecline}
                                    className="flex-1 h-11 rounded-2xl text-sm font-bold bg-white/[0.06] hover:bg-white/[0.1] text-white/60 hover:text-white border border-white/[0.06] transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                                >
                                    <X className="h-4 w-4" />
                                    Decline
                                </button>
                                <button
                                    onClick={onAccept}
                                    className="flex-1 h-11 rounded-2xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:opacity-90 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-lg shadow-emerald-500/20"
                                >
                                    <Check className="h-4 w-4" />
                                    Join
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
