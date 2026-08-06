"use client";

import { X, Crop } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { UploadingFile } from "@/types/attachment.types";

type Props = {
    attachments: UploadingFile[];
    onRemove: (id: string) => void;
    onEdit?: (file: UploadingFile) => void;
};

export default function AttachmentPreviewList({ attachments, onRemove, onEdit }: Props) {
    if (attachments.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-3 pb-3 pt-1 px-1 border-b border-white/[0.04] mb-2 overflow-x-auto max-h-40">
            <AnimatePresence>
                {attachments.map((att) => (
                    <motion.div
                        key={att.id}
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="relative group/thumb w-20 h-20 rounded-xl overflow-hidden border border-white/10 bg-black/40 flex items-center justify-center shrink-0"
                    >
                        {att.type === "IMAGE" && att.previewUrl ? (
                            <img src={att.previewUrl} alt="Upload preview" className="w-full h-full object-cover" />
                        ) : att.type === "VIDEO" && att.previewUrl ? (
                            <video src={att.previewUrl} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                        ) : (
                            <div className="text-[10px] text-muted-foreground text-center px-1.5 break-all w-full leading-normal line-clamp-3">
                                {att.file.name}
                            </div>
                        )}

                        {/* Progress bar overlay */}
                        {att.status === "uploading" && att.progress !== undefined && (
                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-1.5 z-10">
                                <span className="text-[10px] font-semibold text-white">{att.progress}%</span>
                                <div className="w-12 h-1 bg-white/20 rounded-full overflow-hidden">
                                    <div className="bg-primary h-full transition-all duration-150" style={{ width: `${att.progress}%` }} />
                                </div>
                            </div>
                        )}

                        {/* Failed Indicator */}
                        {att.status === "failed" && (
                            <div className="absolute inset-0 bg-red-950/80 flex items-center justify-center z-10">
                                <span className="text-[10px] font-semibold text-red-300">Failed</span>
                            </div>
                        )}

                        {/* Close/Remove Button */}
                        <button
                            type="button"
                            onClick={() => onRemove(att.id)}
                            className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover/thumb:opacity-100 transition-opacity z-20 cursor-pointer"
                        >
                            <X className="h-3 w-3" />
                        </button>

                        {/* Crop/Edit Button */}
                        {att.type === "IMAGE" && onEdit && (
                            <button
                                type="button"
                                onClick={() => onEdit(att)}
                                className="absolute bottom-1 right-1 bg-black/60 hover:bg-black/85 text-white rounded-full p-1 opacity-0 group-hover/thumb:opacity-100 transition-opacity z-20 cursor-pointer"
                                title="Crop/Edit Image"
                            >
                                <Crop className="h-3 w-3" />
                            </button>
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
