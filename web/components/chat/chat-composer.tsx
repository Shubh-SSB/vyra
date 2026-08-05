"use client";

import { useEffect, useRef, useState } from "react";
import { Paperclip, Send, Sparkles, X, Mic, Trash2 } from "lucide-react";
import { Message } from "@/types/message";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { api } from "@/lib/axios";
import { useSnackbar } from "notistack";
import type { UploadingFile } from "@/types/attachment.types";
import LiveWaveform from "./live-waveform";
import AttachmentMenu from "./attachment-menu";
import AttachmentPreviewList from "./attachment-preview-list";
import { cn } from "@/lib/utils";

type Props = {
    onSend: (content: string, type?: "TEXT" | "VOICE", attachments?: { id: string }[]) => void;
    disabled?: boolean;
    onTypingStart?: () => void;
    onTypingStop?: () => void;
    replyingTo?: Message | null;
    onCancelReply?: () => void;
    editingMessage?: Message | null;
    onSaveEdit?: (content: string) => Promise<boolean>;
    onCancelEdit?: () => void;
};

export default function ChatComposer({
    onSend,
    disabled,
    onTypingStart,
    onTypingStop,
    replyingTo,
    onCancelReply,
    editingMessage,
    onSaveEdit,
    onCancelEdit,
}: Props) {
    const [value, setValue] = useState("");
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isTypingRef = useRef(false);

    const { enqueueSnackbar } = useSnackbar();
    const { isRecording, duration, error: recorderError, stream, startRecording, stopRecording, cancelRecording } = useAudioRecorder();
    const [isUploading, setIsUploading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [attachments, setAttachments] = useState<UploadingFile[]>([]);
    const isProcessingUploads = attachments.some(f => f.status === "uploading");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const handleSelectPhotos = () => {
        if (fileInputRef.current) {
            fileInputRef.current.accept = "image/*,video/*";
            fileInputRef.current.click();
        }
    };

    const handleSelectDocument = () => {
        if (fileInputRef.current) {
            fileInputRef.current.accept = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,application/*";
            fileInputRef.current.click();
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const handleStartRecording = async () => {
        try {
            await startRecording();
        } catch (err: any) {
            enqueueSnackbar(err.message || "Failed to start recording. Please check microphone permissions.", {
                variant: "error",
            });
        }
    };

    const handleSendVoice = async () => {
        setIsUploading(true);
        try {
            const { blob, duration: voiceDuration } = await stopRecording();
            if (voiceDuration < 1) {
                return;
            }

            const mimeType = blob.type.split(";")[0] || "audio/webm";
            const extension = mimeType.split("/")[1] || "webm";
            const fileName = `voice-note-${Date.now()}.${extension}`;

            // 1. Get Presigned URL
            const response = await api.post("/attachments/presigned-url", {
                fileName,
                contentType: mimeType,
            });

            const { uploadUrl, fileUrl } = response.data.data;
            const publicUrlBase = fileUrl.split("/voicenotes/")[0];
            const storageKey = fileUrl.replace(`${publicUrlBase}/`, "");

            // 2. Upload file directly to object store
            await fetch(uploadUrl, {
                method: "PUT",
                body: blob,
                headers: {
                    "Content-Type": mimeType,
                },
            });

            // 3. Mark upload as completed in DB
            const completeResponse = await api.post("/attachments/complete", {
                type: "VOICE",
                mimeType,
                size: blob.size,
                storageKey,
                fileUrl,
                metadata: {
                    duration: voiceDuration,
                },
            });

            const attachment = completeResponse.data.data;

            // 4. Dispatch sendMessage socket event
            onSend("", "VOICE", [{ id: attachment.id }]);
        } catch (err) {
            console.error("Failed to send voice message", err);
            enqueueSnackbar("Failed to send voice message. Please try again.", {
                variant: "error",
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const newUploads: UploadingFile[] = Array.from(files).map((file) => {
            const ext = file.name.split(".").pop()?.toLowerCase() || "";
            let type: "IMAGE" | "VIDEO" | "DOCUMENT" = "DOCUMENT";

            if (file.type.startsWith("image/") || ["png", "jpg", "jpeg", "gif", "webp", "heic"].includes(ext)) {
                type = "IMAGE";
            } else if (file.type.startsWith("video/") || ["mp4", "mov", "avi", "mkv", "webm"].includes(ext)) {
                type = "VIDEO";
            }

            return {
                id: Math.random().toString(36).substring(2, 9),
                file,
                type,
                previewUrl: URL.createObjectURL(file),
                progress: 0,
                status: "uploading",
            };
        });

        setAttachments((prev) => [...prev, ...newUploads]);
        e.target.value = ""; // Clear file input selection

        // Trigger upload for each selected file
        newUploads.forEach((upload) => uploadFile(upload));
    };

    const uploadFile = async (upload: UploadingFile) => {
        try {
            const folder = upload.type === "IMAGE" ? "images" : upload.type === "VIDEO" ? "videos" : "documents";

            // 1. Request presigned URL
            const response = await api.post("/attachments/presigned-url", {
                fileName: upload.file.name,
                contentType: upload.file.type,
                folder,
            });

            const { uploadUrl, fileUrl } = response.data.data;
            const publicUrlBase = fileUrl.split(`/${folder}/`)[0];
            const storageKey = fileUrl.replace(`${publicUrlBase}/`, "");

            // 2. Upload file directly with progress monitoring
            const xhr = new XMLHttpRequest();
            xhr.open("PUT", uploadUrl, true);
            xhr.setRequestHeader("Content-Type", upload.file.type);

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const progress = Math.round((event.loaded / event.total) * 100);
                    setAttachments((prev) =>
                        prev.map((item) => (item.id === upload.id ? { ...item, progress } : item))
                    );
                }
            };

            const uploadPromise = new Promise((resolve, reject) => {
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) resolve(null);
                    else reject(new Error("Upload failed"));
                };
                xhr.onerror = () => reject(new Error("Upload failed"));
            });

            xhr.send(upload.file);
            await uploadPromise;

            // 3. Complete database attachment entry
            const completeResponse = await api.post("/attachments/complete", {
                type: upload.type,
                mimeType: upload.file.type,
                size: upload.file.size,
                storageKey,
                fileUrl,
            });

            const attachment = completeResponse.data.data;

            setAttachments((prev) =>
                prev.map((item) =>
                    item.id === upload.id
                        ? { ...item, status: "completed", attachmentId: attachment.id, progress: 100 }
                        : item
                )
            );
        } catch (err) {
            console.error("Failed to upload file", err);
            setAttachments((prev) =>
                prev.map((item) => (item.id === upload.id ? { ...item, status: "failed" } : item))
            );
            enqueueSnackbar(`Failed to upload ${upload.file.name}`, { variant: "error" });
        }
    };

    const handlePaperclipClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMenuOpen((prev) => !prev);
    };

    const removeAttachment = (id: string) => {
        setAttachments((prev) => {
            const item = prev.find((x) => x.id === id);
            if (item && item.previewUrl) URL.revokeObjectURL(item.previewUrl);
            return prev.filter((x) => x.id !== id);
        });
    };


    // Prefill and focus the input when editing a message.
    useEffect(() => {
        if (!editingMessage || !textareaRef.current) return;

        setValue(editingMessage.content ?? "");

        requestAnimationFrame(() => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            textarea.focus();
            textarea.style.height = "auto";
            textarea.style.height = `${textarea.scrollHeight}px`;
            textarea.setSelectionRange(textarea.value.length, textarea.value.length);
        });
    }, [editingMessage]);

    // Auto-focus input when replying to a message.
    useEffect(() => {
        if (replyingTo && !editingMessage && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [editingMessage, replyingTo]);

    // Clean up timeout on unmount
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    const submit = async () => {
        const trimmed = value.trim();
        const hasCompletedAttachments = attachments.some(att => att.status === "completed");
        const isUploadingAny = attachments.some(att => att.status === "uploading");

        if (isUploadingAny) {
            enqueueSnackbar("Please wait for all uploads to complete", { variant: "info" });
            return;
        }

        if (!trimmed && !hasCompletedAttachments) return;
        if (disabled || isSavingEdit) return;

        if (editingMessage) {
            if (!onSaveEdit) return;
            setIsSavingEdit(true);
            try {
                const saved = await onSaveEdit(trimmed);
                if (!saved) return;
            } finally {
                setIsSavingEdit(false);
            }
        } else {
            // Collect attachment IDs
            const attachmentRefs = attachments
                .filter((att) => att.status === "completed" && att.attachmentId)
                .map((att) => ({ id: att.attachmentId! }));

            onSend(trimmed, "TEXT", attachmentRefs);
        }

        // Revoke local object URLs & clear state
        attachments.forEach((att) => att.previewUrl && URL.revokeObjectURL(att.previewUrl));
        setAttachments([]);
        setValue("");
        if (textareaRef.current) textareaRef.current.style.height = "auto";
        textareaRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
        }
    };

    const handleCancelEdit = () => {
        setValue("");
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }
        onCancelEdit?.();
    };

    // Auto-grow textarea & handle typing state
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setValue(e.target.value);
        e.target.style.height = "auto";
        e.target.style.height = `${e.target.scrollHeight}px`;

        if (!editingMessage && !isTypingRef.current && e.target.value.trim().length > 0) {
            isTypingRef.current = true;
            onTypingStart?.();
        }

        if (!editingMessage && typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        if (!editingMessage) {
            typingTimeoutRef.current = setTimeout(() => {
                isTypingRef.current = false;
                onTypingStop?.();
            }, 2000);
        }
    };

    return (
        <div className="shrink-0 border-t border-border bg-transparent px-6 py-4">
            <div className="relative mx-auto flex max-w-[1000px] flex-col gap-2 rounded-2xl border border-border bg-surface px-3 py-2.5 transition-colors focus-within:border-ring">
                {/* Rotating border beam animation when focused */}
                {isFocused && (
                    <div className="absolute inset-0 pointer-events-none z-10">
                        <svg className="absolute inset-0 w-full h-full">
                            <rect
                                x="0.75"
                                y="0.75"
                                width="calc(100% - 1.5px)"
                                height="calc(100% - 1.5px)"
                                rx="16"
                                ry="16"
                                fill="transparent"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                pathLength="100"
                                strokeDasharray="20 80"
                                className="stroke-primary animate-border-beam"
                            />
                        </svg>
                    </div>
                )}
                {editingMessage ? (
                    <div className="flex items-start justify-between w-full rounded-lg bg-surface-elevated/60 border border-white/[0.04] p-3 text-[13px] animate-fade-in mb-1">
                        <div className="flex flex-col gap-0.5 border-l-2 border-primary/50 pl-3 overflow-hidden">
                            <span className="font-semibold text-xs text-primary/90">
                                Editing message
                            </span>
                            <span className="text-muted-foreground truncate max-w-[650px] leading-relaxed">
                                {editingMessage.content}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-full p-1 transition cursor-pointer shrink-0 ml-2"
                            aria-label="Cancel editing"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ) : replyingTo && (
                    <div className="flex items-start justify-between w-full rounded-lg bg-surface-elevated/60 border border-white/[0.04] p-3 text-[13px] animate-fade-in mb-1">
                        <div className="flex flex-col gap-0.5 border-l-2 border-primary/50 pl-3 overflow-hidden">
                            <span className="font-semibold text-xs text-primary/90">
                                Replying to {replyingTo.sender?.displayName ?? "User"}
                            </span>
                            <span className="text-muted-foreground truncate max-w-[650px] leading-relaxed">
                                {replyingTo.content}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={onCancelReply}
                            className="text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-full p-1 transition cursor-pointer shrink-0 ml-2"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* Previews Row */}
                <AttachmentPreviewList
                    attachments={attachments}
                    onRemove={removeAttachment}
                />

                {/* Input row */}
                {isRecording ? (
                    <div className="flex w-full items-center justify-between gap-4 px-2 py-1 bg-surface-elevated/40 rounded-xl border border-white/[0.02] animate-fade-in">
                        <div className="flex items-center gap-3">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                            </span>
                            <span className="text-[13px] font-medium text-foreground">
                                {isUploading ? "Sending voice note..." : "Recording voice..."}
                            </span>
                            <span className="text-xs text-muted-foreground font-mono bg-white/5 px-2 py-0.5 rounded border border-white/[0.04]">
                                {formatDuration(duration)}
                            </span>
                        </div>
                        {!isUploading && stream && (
                            <div className="flex-1 flex justify-center px-4 overflow-hidden">
                                <LiveWaveform stream={stream} />
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={cancelRecording}
                                disabled={isUploading}
                                className="flex h-8 px-3 items-center gap-1.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all cursor-pointer text-xs font-semibold"
                            >
                                <Trash2 className="h-4 w-4" />
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSendVoice}
                                disabled={isUploading}
                                className="flex h-8 px-3.5 items-center gap-1.5 rounded-lg bg-foreground text-background hover:opacity-90 active:scale-95 transition-all cursor-pointer text-xs font-semibold shadow-md disabled:opacity-40 disabled:scale-100"
                            >
                                <Send className="h-3.5 w-3.5" strokeWidth={2} />
                                {isUploading ? "Sending..." : "Send"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex w-full justify-center items-center gap-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            multiple
                            className="hidden"
                        />


                        <div className="relative">
                            <AttachmentMenu
                                isOpen={isMenuOpen}
                                onClose={() => setIsMenuOpen(false)}
                                onSelectPhotos={handleSelectPhotos}
                                onSelectDocument={handleSelectDocument}
                                onSelectPoll={() => alert("Polls feature coming soon!")}
                                onSelectContact={() => alert("Contacts feature coming soon!")}
                            />
                            <button
                                type="button"
                                onClick={handlePaperclipClick}
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground cursor-pointer"
                            >
                                <Paperclip className="h-5 w-5" strokeWidth={1.5} />
                            </button>
                        </div>

                        <button
                            type="button"
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
                        >
                            <Sparkles className="h-5 w-5" strokeWidth={1.5} />
                        </button>

                        <textarea
                            ref={textareaRef}
                            value={value}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            rows={1}
                            placeholder={editingMessage ? "Edit message…" : "Message…"}
                            disabled={disabled || isSavingEdit}
                            className="max-h-40 min-h-[32px] flex-1 resize-none bg-transparent px-1 py-1.5 text-mds leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-40"
                        />

                        {value.trim() || editingMessage || attachments.length > 0 ? (
                            <button
                                type="button"
                                disabled={(!value.trim() && attachments.length === 0) || disabled || isSavingEdit || isProcessingUploads}
                                onClick={submit}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-opacity disabled:opacity-30 cursor-pointer"
                            >
                                <Send className="h-5.5 w-5.5 rotate-45 pr-1" strokeWidth={2} />
                            </button>
                        ) : (
                            <button
                                type="button"
                                disabled={disabled}
                                onClick={handleStartRecording}
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground cursor-pointer"
                                aria-label="Record voice note"
                            >
                                <Mic className="h-6 w-6" strokeWidth={1.5} />
                            </button>
                        )}


                    </div>
                )}

                <p className="mx-auto mt-2 max-w-[820px] px-1 text-[11px] text-muted-foreground">
                    Good communication is the bridge between confusion and clarity.
                </p>
            </div>
        </div>
    );
}
