"use client";

import { useEffect, useRef } from "react";

interface LiveWaveformProps {
    stream: MediaStream | null;
}

export default function LiveWaveform({ stream }: LiveWaveformProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const historyRef = useRef<number[]>([]);

    useEffect(() => {
        if (!stream) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContextClass();
        audioCtxRef.current = audioCtx;

        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0.6;
        source.connect(analyser);

        const bufferLength = analyser.fftSize;
        const timeDomainData = new Uint8Array(bufferLength);
        const dpr = window.devicePixelRatio || 1;

        let rafId: number;

        // Retry every animation frame until the canvas has real dimensions
        const trySetup = () => {
            const rect = canvas.getBoundingClientRect();
            const W = Math.round(rect.width);
            const H = Math.round(rect.height);

            if (W <= 0 || H <= 0) {
                rafId = requestAnimationFrame(trySetup);
                return;
            }

            canvas.width = W * dpr;
            canvas.height = H * dpr;
            ctx.scale(dpr, dpr);

            const centerY = H / 2;
            historyRef.current = new Array(W).fill(0);

            const draw = () => {
                animationRef.current = requestAnimationFrame(draw);
                analyser.getByteTimeDomainData(timeDomainData);

                // RMS amplitude for this frame
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    const v = (timeDomainData[i] - 128) / 128;
                    sum += v * v;
                }
                const rms = Math.sqrt(sum / bufferLength);

                // Push into rolling history so the wave scrolls left
                historyRef.current.push(rms);
                if (historyRef.current.length > W) historyRef.current.shift();

                ctx.clearRect(0, 0, W, H);

                // Dark fill background
                ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
                ctx.fillRect(0, 0, W, H);

                // Grid lines
                for (const lvl of [0.25, 0.5, 0.75]) {
                    const y = centerY - centerY * lvl;
                    const yBot = centerY + centerY * lvl;
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
                    ctx.lineWidth = 1;
                    ctx.setLineDash([4, 6]);
                    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(0, yBot); ctx.lineTo(W, yBot); ctx.stroke();
                }
                ctx.setLineDash([]);

                // Baseline
                ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
                ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(0, centerY); ctx.lineTo(W, centerY); ctx.stroke();

                const history = historyRef.current;
                const N = history.length;
                const gain = Math.min(1.0, 0.85 / Math.max(...history, 0.001));

                // Filled mirrored shape
                ctx.beginPath();
                for (let x = 0; x < N; x++) {
                    const y = centerY - history[x] * gain * centerY * 0.92;
                    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                }
                for (let x = N - 1; x >= 0; x--) {
                    const y = centerY + history[x] * gain * centerY * 0.92;
                    ctx.lineTo(x, y);
                }
                ctx.closePath();

                const fillGrad = ctx.createLinearGradient(0, 0, 0, H);
                fillGrad.addColorStop(0, "rgba(139, 92, 246, 0.55)");
                fillGrad.addColorStop(0.5, "rgba(236, 72, 153, 0.35)");
                fillGrad.addColorStop(1, "rgba(139, 92, 246, 0.55)");
                ctx.fillStyle = fillGrad;
                ctx.fill();

                const lineGrad = ctx.createLinearGradient(0, 0, W, 0);
                lineGrad.addColorStop(0, "rgba(139, 92, 246, 0.3)");
                lineGrad.addColorStop(0.5, "rgba(236, 72, 153, 0.9)");
                lineGrad.addColorStop(1, "rgba(139, 92, 246, 0.3)");

                // Upper edge stroke
                ctx.beginPath();
                for (let x = 0; x < N; x++) {
                    const y = centerY - history[x] * gain * centerY * 0.92;
                    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                }
                ctx.strokeStyle = lineGrad;
                ctx.lineWidth = 1.5;
                ctx.lineJoin = "round";
                ctx.stroke();

                // Lower edge stroke (mirror)
                ctx.beginPath();
                for (let x = 0; x < N; x++) {
                    const y = centerY + history[x] * gain * centerY * 0.92;
                    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                }
                ctx.strokeStyle = lineGrad;
                ctx.lineWidth = 1.5;
                ctx.stroke();

                // Playhead line at rightmost position
                const px = N - 1;
                ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
                ctx.lineWidth = 1.5;
                ctx.setLineDash([2, 3]);
                ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, H); ctx.stroke();
                ctx.setLineDash([]);

                // Glow dot on playhead
                const dotY = centerY - history[px] * gain * centerY * 0.92;
                ctx.beginPath();
                ctx.arc(px, dotY, 3, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
                ctx.fill();
            };

            animationRef.current = requestAnimationFrame(draw);
            draw();
        };

        rafId = requestAnimationFrame(trySetup);

        return () => {
            cancelAnimationFrame(rafId);
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
                audioCtxRef.current.close().catch(() => {});
            }
        };
    }, [stream]);

    return (
        <canvas
            ref={canvasRef}
            className="h-12 w-full rounded-lg bg-transparent"
        />
    );
}
