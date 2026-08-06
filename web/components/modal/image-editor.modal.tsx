"use client";

import React, { useState, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Crop, RotateCw, ZoomIn, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Image Crop Helpers ──────────────────────────────────────────────────────────

const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener("load", () => resolve(image));
        image.addEventListener("error", (error) => reject(error));
        image.setAttribute("crossOrigin", "anonymous");
        image.src = url;
    });

function rotateSize(width: number, height: number, rotation: number) {
    const rotRad = (rotation * Math.PI) / 180;
    return {
        width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
        height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    };
}

export const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area,
    rotation = 0,
    fileName: string
): Promise<File> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) throw new Error("No 2d context");

    const rotRad = (rotation * Math.PI) / 180;
    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation);

    canvas.width = bBoxWidth;
    canvas.height = bBoxHeight;

    ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
    ctx.rotate(rotRad);
    ctx.translate(-image.width / 2, -image.height / 2);
    ctx.drawImage(image, 0, 0);

    const croppedCanvas = document.createElement("canvas");
    const croppedCtx = croppedCanvas.getContext("2d");

    if (!croppedCtx) throw new Error("No cropped 2d context");

    croppedCanvas.width = pixelCrop.width;
    croppedCanvas.height = pixelCrop.height;

    croppedCtx.drawImage(
        canvas,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise((resolve, reject) => {
        croppedCanvas.toBlob((file) => {
            if (file) {
                resolve(new File([file], fileName, { type: "image/jpeg" }));
            } else {
                reject(new Error("Canvas to Blob failed"));
            }
        }, "image/jpeg", 0.95);
    });
};

// ─── Modal Component ─────────────────────────────────────────────────────────────

interface ImageEditorModalProps {
    open: boolean;
    imageSrc: string;
    fileName: string;
    onConfirm: (file: File) => void;
    onCancel: () => void;
}

export default function ImageEditorModal({
    open,
    imageSrc,
    fileName,
    onConfirm,
    onCancel,
}: ImageEditorModalProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [aspect, setAspect] = useState<number | undefined>(undefined); // free aspect ratio by default
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [processing, setProcessing] = useState(false);

    const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        if (!croppedAreaPixels || !imageSrc) return;

        setProcessing(true);
        try {
            const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels, rotation, fileName);
            onConfirm(croppedFile);
        } catch (err) {
            console.error("[Vyra Image Editor] Failed to crop image:", err);
        } finally {
            setProcessing(false);
        }
    };

    if (typeof window === "undefined" || !open) return null;

    return createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex flex-col md:flex-row items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 16 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="relative w-full max-w-[850px] h-[90vh] md:h-[650px] rounded-3xl border border-white/10 bg-[#121214] flex flex-col overflow-hidden shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.06] px-5">
                        <div className="flex items-center gap-2 text-primary">
                            <Crop className="h-5 w-5" />
                            <h3 className="text-sm font-semibold text-foreground">Edit & Crop Image</h3>
                        </div>
                        <button
                            onClick={onCancel}
                            disabled={processing}
                            className="p-1.5 rounded-full text-muted-foreground hover:bg-white/5 hover:text-foreground transition cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Content Body */}
                    <div className="flex-1 flex flex-col md:flex-row min-h-0 relative">
                        {/* Crop Area view */}
                        <div className="flex-1 bg-black relative min-h-[300px] md:min-h-0">
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                rotation={rotation}
                                aspect={aspect}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                                onRotationChange={setRotation}
                            />
                        </div>

                        {/* Controls Panel */}
                        <div className="w-full md:w-[280px] shrink-0 border-t md:border-t-0 md:border-l border-white/[0.06] bg-[#161619] p-5 flex flex-col gap-5 justify-between">
                            <div className="flex flex-col gap-5">
                                {/* Aspect Ratios */}
                                <div className="space-y-2">
                                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Aspect Ratio</span>
                                    <div className="grid grid-cols-4 gap-1.5">
                                        {[
                                            { label: "Free", value: undefined },
                                            { label: "1:1", value: 1 },
                                            { label: "16:9", value: 16 / 9 },
                                            { label: "4:3", value: 4 / 3 },
                                        ].map((opt) => (
                                            <button
                                                key={opt.label}
                                                type="button"
                                                onClick={() => setAspect(opt.value)}
                                                className={cn(
                                                    "py-1.5 text-xs font-medium rounded-lg border transition cursor-pointer",
                                                    aspect === opt.value
                                                        ? "bg-primary/10 border-primary/45 text-primary"
                                                        : "bg-[#1f1f23] border-white/[0.04] text-muted-foreground hover:text-foreground hover:bg-[#25252b]"
                                                )}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Zoom Slider */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                        <span className="flex items-center gap-1"><ZoomIn className="h-3 w-3" /> Zoom</span>
                                        <span>{zoom.toFixed(1)}x</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={1}
                                        max={3}
                                        step={0.1}
                                        value={zoom}
                                        onChange={(e) => setZoom(Number(e.target.value))}
                                        className="w-full h-1 bg-[#252528] rounded-lg appearance-none cursor-pointer accent-primary"
                                    />
                                </div>

                                {/* Rotation Slider */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                        <span className="flex items-center gap-1"><RotateCw className="h-3 w-3" /> Rotation</span>
                                        <span>{rotation}°</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={0}
                                        max={360}
                                        step={1}
                                        value={rotation}
                                        onChange={(e) => setRotation(Number(e.target.value))}
                                        className="w-full h-1 bg-[#252528] rounded-lg appearance-none cursor-pointer accent-primary"
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2.5 pt-4 border-t border-white/[0.04]">
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    disabled={processing}
                                    className="flex-1 py-2.5 text-xs font-semibold text-muted-foreground border border-white/[0.08] hover:bg-white/5 hover:text-foreground rounded-xl transition cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={processing || !croppedAreaPixels}
                                    className="flex-1 py-2.5 text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 active:scale-98 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                                >
                                    {processing ? (
                                        <>
                                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>Done</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
}
