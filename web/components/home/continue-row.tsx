"use client";

import { useConversations } from "@/tanstack/queries/conversation.query";
import { ConversationPreview } from "@/types/conversation";
import { getMyUserId } from "@/lib/token";
import ElasticStack from "../ui/elastic-stack";
import GooeySearch from "../ui/gooey-search";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

function getOtherUser(conv: ConversationPreview, myId: string | null) {
    if (!myId) return conv.participants[0]?.user ?? null;
    const other = conv.participants.find((p) => p.userId !== myId);
    return other?.user ?? conv.participants[0]?.user ?? null;
}

export default function ContinueRow() {
    const router = useRouter();
    const { data: conversations = [], isLoading } = useConversations();
    const myId = getMyUserId();

    const recent = conversations
        .filter((c) => c.messages?.length > 0)
        .sort((a, b) => {
            const tA = a.lastMessageAt || a.updatedAt;
            const tB = b.lastMessageAt || b.updatedAt;
            return new Date(tB).getTime() - new Date(tA).getTime();
        })
        .slice(0, 8);

    if (isLoading) {
        return (
            <section className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50">
                    Continue
                </h2>
                <div className="flex gap-4 overflow-x-auto scrollbar-none pb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 animate-pulse">
                            <div className="h-14 w-14 rounded-full bg-white/[0.04]" />
                            <div className="h-2.5 w-10 rounded-md bg-white/[0.04]" />
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    if (recent.length === 0) {
        return (
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50">
                        Continue
                    </h2>
                    <GooeySearch />
                </div>
                <div className="flex flex-col sm:flex-row items-start gap-4.5 p-5 rounded-3xl border border-white/[0.06] bg-[#151517]/40 backdrop-blur-md shadow-lg">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                        <Plus className="h-5 w-5 text-muted-foreground/70" />
                    </div>
                    <div className="space-y-2 flex-1">
                        <p className="text-[13px] font-bold text-[#eeece4]">Start your first conversation</p>
                        <p className="text-[11px] text-muted-foreground/60 leading-relaxed max-w-[340px]">
                            Connect with friends or start a chat with Vyra AI to exchange resources and build your knowledge.
                        </p>
                        <button
                            onClick={() => router.push("/chat?newChat=true")}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white text-black hover:bg-white/90 active:scale-95 rounded-xl text-[11px] font-bold transition duration-200 cursor-pointer mt-1"
                        >
                            Start Chat
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    // Map conversation previews to ElasticStack items
    const stackItems = recent.map((conv) => {
        const other = getOtherUser(conv, myId);
        return {
            id: conv.id, // we use the conversation id to navigate
            name: other?.displayName || other?.username || "Unknown",
            image: other?.avatarUrl || undefined,
            href: `/chat?convId=${conv.id}`,
        };
    });

    return (
        <section className="space-y-1">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50">
                Continue
            </h2>
            <div className="flex items-center gap-16">
                <ElasticStack
                    items={stackItems}
                    itemSize={80}
                    overlap={25}
                    pushForce={15}
                />
                <div className="shrink-0 pb-1">
                    <GooeySearch />
                </div>
            </div>
        </section>
    );
}
