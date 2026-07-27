"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";
import WaveformSeekbar from "./waveform-seekbar";

interface VoicePlayerProps {
    src: string;
    duration: number; // in seconds
    isOwn?: boolean;
}

export default function VoicePlayer({ src, duration, isOwn = false }: VoicePlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.load();
        }
        setIsPlaying(false);
        setCurrentTime(0);
        setProgress(0);
    }, [src]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => {
            const totalDuration = audio.duration && isFinite(audio.duration) && audio.duration > 0 ? audio.duration : duration;
            setCurrentTime(audio.currentTime);
            if (totalDuration > 0) {
                setProgress((audio.currentTime / totalDuration) * 100);
            }
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
            setProgress(0);
        };

        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("ended", handleEnded);

        return () => {
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("ended", handleEnded);
        };
    }, [duration]);

    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation(); // prevent message bubble tap triggers
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            audio.play().catch((err) => console.error("Playback failed", err));
            setIsPlaying(true);
        }
    };



    const formatTime = (timeInSecs: number) => {
        const minutes = Math.floor(timeInSecs / 60);
        const seconds = Math.floor(timeInSecs % 60);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    return (
        <div className="flex items-center gap-3 py-1 min-w-[220px] md:min-w-[280px]">
            <audio ref={audioRef} src={src} preload="metadata" />

            {/* Play/Pause Button */}
            <button
                type="button"
                onClick={togglePlay}
                className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition duration-200 active:scale-95 cursor-pointer shadow-sm",
                    isOwn
                        ? "bg-background text-foreground hover:bg-background/90"
                        : "bg-foreground text-background hover:bg-foreground/90"
                )}
                aria-label={isPlaying ? "Pause voice note" : "Play voice note"}
            >
                {isPlaying ? (
                    <Pause className="h-4.5 w-4.5 fill-current" />
                ) : (
                    <Play className="h-4.5 w-4.5 fill-current ml-0.5" />
                )}
            </button>

            {/* Waveform / Progress Slider */}
            <div className="flex flex-col flex-1 gap-1 justify-center">
                <WaveformSeekbar
                    src={src}
                    progress={progress}
                    onSeek={(seekPercent) => {
                        const audio = audioRef.current;
                        if (!audio) return;
                        const totalDuration = audio.duration && isFinite(audio.duration) && audio.duration > 0 ? audio.duration : duration;
                        if (!totalDuration) return;
                        const newTime = (seekPercent / 100) * totalDuration;
                        audio.currentTime = newTime;
                        setCurrentTime(newTime);
                        setProgress(seekPercent);
                    }}
                    isOwn={isOwn}
                />

                {/* Timestamps */}
                <div className="flex justify-between items-center text-[10px] opacity-75 font-mono select-none">
                    <span className={isOwn ? "text-background" : "text-foreground"}>
                        {formatTime(currentTime)}
                    </span>
                    <span className={isOwn ? "text-background" : "text-foreground"}>
                        {formatTime(duration)}
                    </span>
                </div>
            </div>
        </div>
    );
}
