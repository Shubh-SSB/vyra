"use client";

import { useMemo, useRef, useCallback, useEffect } from "react";

interface WaveformSeekbarProps {
    src: string;
    progress: number; // 0 to 100
    onSeek: (progress: number) => void;
    isOwn?: boolean;
}

function generatePeaks(src: string, count: number): number[] {
    let hash = 5381;
    for (let i = 0; i < src.length; i++) {
        hash = ((hash << 5) + hash) ^ src.charCodeAt(i);
        hash = hash >>> 0;
    }
    const random = () => {
        hash ^= hash << 13;
        hash ^= hash >> 17;
        hash ^= hash << 5;
        hash = hash >>> 0;
        return hash / 0xffffffff;
    };
    const raw = Array.from({ length: count }, () => random());
    const smooth = (arr: number[], passes: number) => {
        let result = [...arr];
        for (let p = 0; p < passes; p++) {
            result = result.map((v, i) => {
                const w0 = result[Math.max(0, i - 2)];
                const w1 = result[Math.max(0, i - 1)];
                const w3 = result[Math.min(result.length - 1, i + 1)];
                const w4 = result[Math.min(result.length - 1, i + 2)];
                return (w0 * 0.1 + w1 * 0.2 + v * 0.4 + w3 * 0.2 + w4 * 0.1);
            });
        }
        return result;
    };
    const smoothed = smooth(raw, 3);
    const max = Math.max(...smoothed, 0.001);
    return smoothed.map((v, i) => {
        const t = i / (count - 1);
        const envelope = Math.sin(t * Math.PI) * 0.55 + 0.45;
        return Math.max(0.08, (v / max) * envelope);
    });
}

export default function WaveformSeekbar({
    src,
    progress,
    onSeek,
    isOwn = false,
}: WaveformSeekbarProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const NUM_BARS = 55;
    const isDragging = useRef(false);
    const progressRef = useRef(progress);
    progressRef.current = progress;

    const peaks = useMemo(() => generatePeaks(src, NUM_BARS), [src]);
    const peaksRef = useRef(peaks);
    peaksRef.current = peaks;
    const isOwnRef = useRef(isOwn);
    isOwnRef.current = isOwn;

    // Core draw function — reads from refs so it can be called from ResizeObserver too
    const draw = useCallback((W: number, H: number) => {
        const canvas = canvasRef.current;
        if (!canvas || W <= 0 || H <= 0) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
        canvas.style.width = `${W}px`;
        canvas.style.height = `${H}px`;
        ctx.scale(dpr, dpr);

        ctx.clearRect(0, 0, W, H);

        const bars = peaksRef.current;
        const prog = progressRef.current;
        const own = isOwnRef.current;
        const barGap = 2;
        const barW = (W - (bars.length - 1) * barGap) / bars.length;
        const centerY = H / 2;
        const radius = Math.min(Math.max(1, barW / 2), 3);

        for (let i = 0; i < bars.length; i++) {
            const peak = bars[i];
            const barH = Math.max(3, peak * H * 0.88);
            const x = i * (barW + barGap);
            const y = centerY - barH / 2;
            const barProgress = (i / bars.length) * 100;
            const isPlayed = prog > barProgress;

            if (isPlayed) {
                const grad = ctx.createLinearGradient(x, y, x, y + barH);
                if (own) {
                    grad.addColorStop(0, "#db8b67");   // Light terracotta
                    grad.addColorStop(0.5, "#c97955"); // Main terracotta
                    grad.addColorStop(1, "#b56743");   // Dark terracotta
                } else {
                    grad.addColorStop(0, "#ffffff");
                    grad.addColorStop(0.5, "#f4f4f5");
                    grad.addColorStop(1, "#e4e4e7");
                }
                ctx.fillStyle = grad;
            } else {
                ctx.fillStyle = own
                    ? "rgba(0, 0, 0, 0.15)"
                    : "rgba(255, 255, 255, 0.25)";
            }

            ctx.beginPath();
            if (ctx.roundRect) {
                ctx.roundRect(x, y, barW, barH, radius);
            } else {
                ctx.rect(x, y, barW, barH);
            }
            ctx.fill();
        }

        // Playhead
        if (prog > 0 && prog < 100) {
            const headX = (prog / 100) * W;
            ctx.strokeStyle = own ? "rgba(0, 0, 0, 0.25)" : "rgba(255, 255, 255, 0.4)";
            ctx.lineWidth = 1.5;
            ctx.setLineDash([2, 2]);
            ctx.beginPath();
            ctx.moveTo(headX, 0);
            ctx.lineTo(headX, H);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.beginPath();
            ctx.arc(headX, centerY, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = own ? "#c97955" : "#ffffff";
            ctx.fill();
        }
    }, []);

    // Use ResizeObserver so canvas re-renders as soon as the container has real dimensions
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const ro = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (!entry) return;
            const { width, height } = entry.contentRect;
            draw(width, height);
        });

        ro.observe(container);
        return () => ro.disconnect();
    }, [draw]);

    // Re-draw when progress / peaks / isOwn change, using latest known size
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const { width, height } = container.getBoundingClientRect();
        draw(width, height);
    }, [peaks, progress, isOwn, draw]);

    const getSeekPercent = useCallback((clientX: number) => {
        const container = containerRef.current;
        if (!container) return null;
        const rect = container.getBoundingClientRect();
        return Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        isDragging.current = true;
        const pct = getSeekPercent(e.clientX);
        if (pct !== null) onSeek(pct);
        const onMove = (me: MouseEvent) => {
            if (!isDragging.current) return;
            const p = getSeekPercent(me.clientX);
            if (p !== null) onSeek(p);
        };
        const onUp = () => {
            isDragging.current = false;
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
        };
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
    }, [getSeekPercent, onSeek]);

    const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
        e.stopPropagation();
        const pct = getSeekPercent(e.touches[0].clientX);
        if (pct !== null) onSeek(pct);
        const onMove = (te: TouchEvent) => {
            const p = getSeekPercent(te.touches[0].clientX);
            if (p !== null) onSeek(p);
        };
        const onEnd = () => {
            window.removeEventListener("touchmove", onMove);
            window.removeEventListener("touchend", onEnd);
        };
        window.addEventListener("touchmove", onMove, { passive: true });
        window.addEventListener("touchend", onEnd);
    }, [getSeekPercent, onSeek]);

    return (
        <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            className="relative w-full h-10 cursor-pointer select-none"
            role="slider"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Audio seekbar"
        >
            <canvas ref={canvasRef} className="absolute inset-0" />
        </div>
    );
}
