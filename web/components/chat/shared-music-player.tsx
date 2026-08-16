"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, X, Users, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

type SyncSession = {
    conversationId: string;
    trackId: string;
    title: string;
    artist: string;
    coverUrl?: string;
    streamUrl: string;
    role: "host" | "joiner";
    hostId: string;
};

type SharedMusicPlayerProps = {
    session: SyncSession;
    onClose: () => void;
    socket?: any;
};

export default function SharedMusicPlayer({ session, onClose, socket }: SharedMusicPlayerProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const isLocalChange = useRef(false);

    useEffect(() => {
        // Initialize audio
        const audio = new Audio(session.streamUrl);
        audioRef.current = audio;
        audio.preload = "metadata";

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleTimeUpdate = () => {
            if (!isLocalChange.current) {
                setCurrentTime(audio.currentTime);
            }
        };
        const handleLoadedMetadata = () => setDuration(audio.duration);

        audio.addEventListener("play", handlePlay);
        audio.addEventListener("pause", handlePause);
        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("loadedmetadata", handleLoadedMetadata);

        // Auto-play on join/host
        audio.play().catch((err) => console.warn("[SharedMusicPlayer] Autoplay blocked:", err));

        // Listen for sync events from the socket via window custom event
        const handleSyncControl = (e: Event) => {
            const payload = (e as CustomEvent).detail;
            if (payload.conversationId !== session.conversationId) return;
            if (payload.senderId === socket?.id) return; // ignore our own actions broadcasted back

            isLocalChange.current = true;
            if (payload.action === "PLAY") {
                audio.play().catch(console.warn);
            } else if (payload.action === "PAUSE") {
                audio.pause();
            } else if (payload.action === "SEEK" && typeof payload.progress === "number") {
                audio.currentTime = payload.progress;
                setCurrentTime(payload.progress);
            }
            setTimeout(() => {
                isLocalChange.current = false;
            }, 50);
        };

        window.addEventListener("vyra:listenTogether:control", handleSyncControl);

        return () => {
            audio.pause();
            audio.removeEventListener("play", handlePlay);
            audio.removeEventListener("pause", handlePause);
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
            window.removeEventListener("vyra:listenTogether:control", handleSyncControl);
            audioRef.current = null;
        };
    }, [session.streamUrl, session.conversationId, socket?.id]);

    const handlePlayToggle = () => {
        const audio = audioRef.current;
        if (!audio || !socket) return;

        const newPlaying = !isPlaying;
        if (newPlaying) {
            audio.play().catch(console.warn);
        } else {
            audio.pause();
        }

        socket.emit("musicSyncControl", {
            conversationId: session.conversationId,
            action: newPlaying ? "PLAY" : "PAUSE",
            progress: audio.currentTime,
        });
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        if (!audio || !socket) return;

        const val = parseFloat(e.target.value);
        audio.currentTime = val;
        setCurrentTime(val);

        socket.emit("musicSyncControl", {
            conversationId: session.conversationId,
            action: "SEEK",
            progress: val,
        });
    };

    const formatTime = (secs: number) => {
        if (isNaN(secs)) return "0:00";
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    return (
        <div className="relative z-30 flex h-[64px] w-full items-center justify-between border-b border-emerald-500/10 bg-[#111114]/90 px-6 py-2 backdrop-blur-md transition-all">
            {/* Left side: Artwork & metadata */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
                {session.coverUrl ? (
                    <div className="relative h-10 w-10 shrink-0">
                        <img
                            src={session.coverUrl}
                            alt=""
                            className={cn(
                                "h-10 w-10 rounded-full object-cover border border-emerald-500/20 shadow-md",
                                isPlaying ? "animate-[spin_8s_linear_infinite]" : ""
                            )}
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="h-2 w-2 rounded-full bg-black border border-white/20 shadow-inner" />
                        </div>
                    </div>
                ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 text-white border border-emerald-500/20">
                        <Users className="h-5 w-5" />
                    </div>
                )}

                <div className="flex flex-col min-w-0 leading-tight">
                    <p className="text-[12px] font-bold text-white truncate max-w-[200px] sm:max-w-[320px]">
                        {session.title}
                    </p>
                    <p className="text-[10px] text-white/50 truncate max-w-[200px] sm:max-w-[320px]">
                        {session.artist} • <span className="text-emerald-400 font-semibold uppercase tracking-wider text-[8px] inline-flex items-center gap-1">
                            <Volume2 className="h-2.5 w-2.5 animate-pulse" />
                            Listen Together
                        </span>
                    </p>
                </div>
            </div>

            {/* Center: Playback control & Timeline */}
            <div className="flex flex-[2] items-center justify-center gap-4 max-w-[420px] mx-4">
                <button
                    onClick={handlePlayToggle}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md shadow-emerald-500/20 hover:scale-105 active:scale-95 transition"
                >
                    {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
                </button>

                <div className="flex flex-1 items-center gap-2">
                    <span className="text-[9px] font-mono text-white/40">{formatTime(currentTime)}</span>
                    <input
                        type="range"
                        min={0}
                        max={duration || 100}
                        value={currentTime}
                        onChange={handleSeek}
                        className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-white/10 accent-emerald-400 focus:outline-none"
                        style={{
                            background: `linear-gradient(to right, oklch(0.72 0.16 150) ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.1) ${(currentTime / (duration || 1)) * 100}%)`,
                        }}
                    />
                    <span className="text-[9px] font-mono text-white/40">{formatTime(duration)}</span>
                </div>
            </div>

            {/* Right: Quit session */}
            <div className="flex shrink-0 items-center ml-2">
                <button
                    onClick={onClose}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 border border-white/5 hover:bg-red-500/10 hover:text-red-400 text-white/60 transition cursor-pointer"
                    title="Leave Listen Together"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
