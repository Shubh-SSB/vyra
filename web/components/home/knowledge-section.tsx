"use client";

import { useQuery } from "@tanstack/react-query";
import { CollectionService, Collection } from "@/services/collection.service";
import { Bookmark, ChevronRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function KnowledgeSection() {
    const { data: collections = [], isLoading } = useQuery({
        queryKey: ["collections"],
        queryFn: async () => {
            const res = await CollectionService.getCollections();
            return res.data;
        },
    });

    // Show up to 6 collections, sorted by most items first
    const sorted = [...collections].sort((a, b) => {
        const countA = a._count?.items ?? 0;
        const countB = b._count?.items ?? 0;
        return countB - countA;
    }).slice(0, 6);

    if (isLoading) {
        return (
            <section className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50">
                    From Your Knowledge
                </h2>
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/30" />
                </div>
            </section>
        );
    }

    if (sorted.length === 0) {
        return (
            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50">
                        From Your Knowledge
                    </h2>
                </div>
                <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-dashed border-white/[0.06] bg-[#151517]/30">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.06] mb-2.5">
                        <Bookmark className="h-5 w-5 text-muted-foreground/40" />
                    </div>
                    <p className="text-[13px] font-semibold text-muted-foreground/60">No collections yet</p>
                    <p className="text-[11px] text-muted-foreground/35 mt-1 max-w-[240px]">
                        Save messages from your chats to start building your knowledge base.
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50">
                    From Your Knowledge
                </h2>
                <Link
                    href="/settings/collections"
                    className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors"
                >
                    View all
                    <ChevronRight className="h-3 w-3" />
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {sorted.map((col, index) => (
                    <motion.div
                        key={col.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.04 }}
                    >
                        <Link
                            href={`/settings/collections/${col.id}`}
                            className="group flex items-center gap-3.5 p-4 rounded-2xl border border-white/[0.06] bg-[#151517]/70 hover:border-white/15 hover:bg-[#1a1a1d] transition-all duration-200 cursor-pointer"
                        >
                            {/* Emoji */}
                            <span className="text-2xl shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.03]">
                                {col.emoji || "📌"}
                            </span>

                            {/* Details */}
                            <div className="min-w-0 flex-1">
                                <p className="text-[13px] font-semibold text-foreground truncate group-hover:text-white transition-colors">
                                    {col.name}
                                </p>
                                <p className="text-[11px] text-muted-foreground/40 mt-0.5">
                                    {col._count?.items ?? 0} item{(col._count?.items ?? 0) !== 1 ? "s" : ""}
                                </p>
                            </div>

                            <ChevronRight className="h-4 w-4 text-muted-foreground/20 group-hover:text-muted-foreground/50 transition-colors shrink-0" />
                        </Link>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
