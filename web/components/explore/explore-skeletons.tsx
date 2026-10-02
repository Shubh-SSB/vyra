import React from "react";

interface ExploreSkeletonsProps {
    filter?: string;
}

export function ExploreSkeletons({ filter }: ExploreSkeletonsProps) {
    if (filter === "MUSIC") {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-8 animate-pulse">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex flex-col rounded-2xl border border-white/5 bg-[#0d1117]/60 p-2.5 overflow-hidden shadow-lg"
                    >
                        <div className="aspect-square w-full rounded-2xl bg-white/[0.06] mb-3" />
                        <div className="h-4 w-3/4 bg-white/10 rounded mb-2 mx-auto" />
                        <div className="h-3 w-1/2 bg-white/5 rounded mx-auto mb-1" />
                    </div>
                ))}
            </div>
        );
    }

    if (filter === "AI_MODEL") {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-8 animate-pulse">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex flex-col rounded-2xl border border-white/5 bg-[#0c1417]/50 p-5 overflow-hidden shadow-lg"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div className="space-y-1.5 flex-1">
                                <div className="h-4 w-2/3 bg-cyan-500/15 rounded" />
                                <div className="h-3 w-1/3 bg-white/5 rounded" />
                            </div>
                            <div className="h-4 w-12 bg-cyan-500/10 rounded-full" />
                        </div>
                        <div className="flex gap-2 my-2">
                            <div className="h-3 w-16 bg-white/5 rounded" />
                            <div className="h-3 w-12 bg-white/5 rounded" />
                        </div>
                        <div className="flex gap-1.5 my-3">
                            <div className="h-4 w-12 bg-white/5 rounded" />
                            <div className="h-4 w-14 bg-white/5 rounded" />
                        </div>
                        <div className="mt-auto pt-3 border-t border-white/5">
                            <div className="h-8 w-full bg-cyan-500/15 rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (filter === "GITHUB") {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-8 animate-pulse">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex flex-col rounded-2xl border border-white/5 bg-[#1a1017]/50 p-5 overflow-hidden shadow-lg"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-lg bg-pink-500/10 shrink-0" />
                            <div className="space-y-1.5 flex-1 min-w-0">
                                <div className="h-4 w-3/4 bg-pink-500/15 rounded" />
                                <div className="h-3 w-1/3 bg-white/5 rounded" />
                            </div>
                        </div>
                        <div className="h-10 w-full bg-white/[0.03] rounded-xl my-2" />
                        <div className="flex gap-3 my-2">
                            <div className="h-3 w-12 bg-white/5 rounded" />
                            <div className="h-3 w-12 bg-white/5 rounded" />
                            <div className="h-3 w-14 bg-pink-500/10 rounded" />
                        </div>
                        <div className="mt-auto pt-3 border-t border-white/5">
                            <div className="h-8 w-full bg-pink-500/15 rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Default / All Items view: mixed skeletons representing Music, AI Models, and GitHub
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-8 animate-pulse">
            {/* Music skeleton */}
            <div className="flex flex-col rounded-2xl border border-white/5 bg-[#0d1117]/60 p-2.5 overflow-hidden shadow-lg">
                <div className="aspect-square w-full rounded-2xl bg-white/[0.06] mb-3" />
                <div className="h-4 w-3/4 bg-white/10 rounded mb-2 mx-auto" />
                <div className="h-3 w-1/2 bg-white/5 rounded mx-auto mb-1" />
            </div>
            {/* AI Model skeleton */}
            <div className="flex flex-col rounded-2xl border border-white/5 bg-[#0c1417]/50 p-5 overflow-hidden shadow-lg">
                <div className="flex justify-between items-start mb-3">
                    <div className="space-y-1.5 flex-1">
                        <div className="h-4 w-2/3 bg-cyan-500/15 rounded" />
                        <div className="h-3 w-1/3 bg-white/5 rounded" />
                    </div>
                    <div className="h-4 w-12 bg-cyan-500/10 rounded-full" />
                </div>
                <div className="flex gap-2 my-2">
                    <div className="h-3 w-16 bg-white/5 rounded" />
                    <div className="h-3 w-12 bg-white/5 rounded" />
                </div>
                <div className="mt-auto pt-3 border-t border-white/5">
                    <div className="h-8 w-full bg-cyan-500/15 rounded-lg" />
                </div>
            </div>
            {/* GitHub skeleton */}
            <div className="flex flex-col rounded-2xl border border-white/5 bg-[#1a1017]/50 p-5 overflow-hidden shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-pink-500/10 shrink-0" />
                    <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="h-4 w-3/4 bg-pink-500/15 rounded" />
                        <div className="h-3 w-1/3 bg-white/5 rounded" />
                    </div>
                </div>
                <div className="h-10 w-full bg-white/[0.03] rounded-xl my-2" />
                <div className="mt-auto pt-3 border-t border-white/5">
                    <div className="h-8 w-full bg-pink-500/15 rounded-lg" />
                </div>
            </div>
            {/* Music skeleton */}
            <div className="flex flex-col rounded-2xl border border-white/5 bg-[#0d1117]/60 p-2.5 overflow-hidden shadow-lg">
                <div className="aspect-square w-full rounded-2xl bg-white/[0.06] mb-3" />
                <div className="h-4 w-3/4 bg-white/10 rounded mb-2 mx-auto" />
                <div className="h-3 w-1/2 bg-white/5 rounded mx-auto mb-1" />
            </div>
            {/* AI Model skeleton */}
            <div className="flex flex-col rounded-2xl border border-white/5 bg-[#0c1417]/50 p-5 overflow-hidden shadow-lg">
                <div className="flex justify-between items-start mb-3">
                    <div className="space-y-1.5 flex-1">
                        <div className="h-4 w-2/3 bg-cyan-500/15 rounded" />
                        <div className="h-3 w-1/3 bg-white/5 rounded" />
                    </div>
                    <div className="h-4 w-12 bg-cyan-500/10 rounded-full" />
                </div>
                <div className="flex gap-2 my-2">
                    <div className="h-3 w-16 bg-white/5 rounded" />
                    <div className="h-3 w-12 bg-white/5 rounded" />
                </div>
                <div className="mt-auto pt-3 border-t border-white/5">
                    <div className="h-8 w-full bg-cyan-500/15 rounded-lg" />
                </div>
            </div>
            {/* GitHub skeleton */}
            <div className="flex flex-col rounded-2xl border border-white/5 bg-[#1a1017]/50 p-5 overflow-hidden shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-pink-500/10 shrink-0" />
                    <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="h-4 w-3/4 bg-pink-500/15 rounded" />
                        <div className="h-3 w-1/3 bg-white/5 rounded" />
                    </div>
                </div>
                <div className="h-10 w-full bg-white/[0.03] rounded-xl my-2" />
                <div className="mt-auto pt-3 border-t border-white/5">
                    <div className="h-8 w-full bg-pink-500/15 rounded-lg" />
                </div>
            </div>
            {/* Music skeleton */}
            <div className="flex flex-col rounded-2xl border border-white/5 bg-[#0d1117]/60 p-2.5 overflow-hidden shadow-lg">
                <div className="aspect-square w-full rounded-2xl bg-white/[0.06] mb-3" />
                <div className="h-4 w-3/4 bg-white/10 rounded mb-2 mx-auto" />
                <div className="h-3 w-1/2 bg-white/5 rounded mx-auto mb-1" />
            </div>
            {/* GitHub skeleton */}
            <div className="flex flex-col rounded-2xl border border-white/5 bg-[#1a1017]/50 p-5 overflow-hidden shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-pink-500/10 shrink-0" />
                    <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="h-4 w-3/4 bg-pink-500/15 rounded" />
                        <div className="h-3 w-1/3 bg-white/5 rounded" />
                    </div>
                </div>
                <div className="h-10 w-full bg-white/[0.03] rounded-xl my-2" />
                <div className="mt-auto pt-3 border-t border-white/5">
                    <div className="h-8 w-full bg-pink-500/15 rounded-lg" />
                </div>
            </div>
        </div>
    );
}
