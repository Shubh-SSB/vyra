import { cn } from "@/lib/utils";
import { Collection, CollectionService } from "@/services/collection.service";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { useSnackbar } from "notistack";
import { useState } from "react";
import { createPortal } from "react-dom";

export default function MoveCopyModal({
    open,
    messageId,
    currentCollectionId,
    collections,
    onClose,
    onSuccess,
}: {
    open: boolean;
    messageId: string;
    currentCollectionId: string;
    collections: Collection[];
    onClose: () => void;
    onSuccess: () => void;
}) {
    const { enqueueSnackbar } = useSnackbar();
    const [action, setAction] = useState<"move" | "copy">("move");
    const [targetColId, setTargetColId] = useState("");
    const [loading, setLoading] = useState(false);

    const otherCollections = collections.filter((c) => c.id !== currentCollectionId);

    const handleTransfer = async () => {
        if (!targetColId) return;
        setLoading(true);
        try {
            await CollectionService.transferItem(currentCollectionId, messageId, targetColId, action);
            enqueueSnackbar(
                action === "move"
                    ? "Message moved successfully"
                    : "Message copied successfully",
                { variant: "success" }
            );
            onSuccess();
            onClose();
        } catch (err: any) {
            enqueueSnackbar(err?.response?.data?.message || "Transfer failed", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    if (typeof window === "undefined" || !open) return null;

    return createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 16 }}
                    className="relative z-10 w-full max-w-[350px] rounded-3xl border border-white/10 bg-[#151517] p-5 shadow-2xl space-y-4"
                >
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                        <h3 className="text-sm font-semibold">Organize Bookmark</h3>
                        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {/* Action selector toggle */}
                        <div className="grid grid-cols-2 p-1 bg-white/5 rounded-xl border border-white/[0.04]">
                            <button
                                onClick={() => setAction("move")}
                                className={cn(
                                    "py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer",
                                    action === "move" ? "bg-white text-black" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                Move Message
                            </button>
                            <button
                                onClick={() => setAction("copy")}
                                className={cn(
                                    "py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer",
                                    action === "copy" ? "bg-white text-black" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                Copy Message
                            </button>
                        </div>

                        {/* Collection select */}
                        {otherCollections.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-4">
                                Create another collection first to move/copy messages.
                            </p>
                        ) : (
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                                    Target Collection
                                </label>
                                <select
                                    value={targetColId}
                                    onChange={(e) => setTargetColId(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
                                >
                                    <option value="" disabled className="bg-[#151517]">Select destination</option>
                                    {otherCollections.map((c) => (
                                        <option key={c.id} value={c.id} className="bg-[#151517]">
                                            {c.emoji || "📌"} {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.06]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-white/5 hover:text-foreground transition cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleTransfer}
                            disabled={loading || !targetColId}
                            className="px-4 py-2 rounded-xl text-xs font-semibold bg-main text-background hover:opacity-90 transition flex items-center gap-1.5 borber border-white/50 cursor-pointer disabled:border-red-500 disabled:border disabled:text-red-500 disabled:bg-accent disabled:cursor-not-allowed"
                        >
                            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            Confirm
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
}
