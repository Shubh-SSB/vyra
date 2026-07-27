import { cn } from "@/lib/utils";
import { Collection, CollectionService } from "@/services/collection.service";
import { AnimatePresence, motion } from "framer-motion";
import { FolderPlus, Loader2, X } from "lucide-react";
import { useSnackbar } from "notistack";
import { useState } from "react";
import { createPortal } from "react-dom";


export default function CreateCollectionModal({
    open,
    onClose,
    onCreated,
    Emoji_options
}: {
    open: boolean;
    onClose: () => void;
    onCreated: (newCol: Collection) => void;
    Emoji_options: string[];
}) {
    const { enqueueSnackbar } = useSnackbar();
    const [name, setName] = useState("");
    const [emoji, setEmoji] = useState("📌");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) return;

        setLoading(true);
        try {
            const res = await CollectionService.createCollection(trimmed, emoji);
            onCreated(res.data);
            setName("");
            onClose();
        } catch (err: any) {
            enqueueSnackbar(err?.response?.data?.message || "Failed to create collection", { variant: "error" });
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
                    className="relative z-10 w-full max-w-[360px] rounded-3xl border border-white/10 bg-[#151517] p-5 shadow-2xl space-y-4"
                >
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                        <div className="flex items-center gap-2">
                            <FolderPlus className="h-4 w-4 text-accent" />
                            <h3 className="text-sm font-semibold">New Collection</h3>
                        </div>
                        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl p-2 bg-white/5 rounded-xl">{emoji}</span>
                            <input
                                type="text"
                                required
                                placeholder="Collection Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Select Icon</label>
                            <div className="grid grid-cols-6 gap-2 bg-white/[0.02] border border-white/[0.04] p-2.5 rounded-2xl">
                                {Emoji_options.map((em) => (
                                    <button
                                        key={em}
                                        type="button"
                                        onClick={() => setEmoji(em)}
                                        className={cn(
                                            "text-2xl p-1 rounded-xl hover:bg-white/5 hover:scale-110 active:scale-95 transition cursor-pointer",
                                            emoji === em && "bg-white/10 scale-105"
                                        )}
                                    >
                                        {em}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-white/5 hover:text-foreground transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !name.trim()}
                                className="px-4 py-2 rounded-xl text-xs font-semibold bg-main text-background hover:opacity-90 transition flex items-center gap-1.5 cursor-pointer"
                            >
                                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                Create Collection
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
}