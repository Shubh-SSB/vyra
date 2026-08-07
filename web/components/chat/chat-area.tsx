"use client";

import { useEffect, useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Pin, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAccessToken } from "@/lib/token";
import { Message } from "@/types/message";
import { useInfiniteMessages, usePinnedMessages } from "@/tanstack/queries/message.query";
import { useConversations } from "@/tanstack/queries/conversation.query";
import { MessageService } from "@/services/message.service";
import ChatHeader from "./chat-header";
import ChatThread from "./chat-thread";
import ChatComposer from "./chat-composer";
import { ForwardMessageModal } from "./forward-message-modal";
import MailAnimation from "./mail-animation";

function getMyUserId(): string | null {
    try {
        const token = getAccessToken();
        if (!token) return null;

        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.sub ?? payload.id ?? payload.userId ?? null;
    } catch {
        return null;
    }
}

type Props = {
    conversationId: string | null;
    mobileView: string;
    goBackToList: () => void;
    typingConversations: Record<string, boolean>;
    connectionStatus: string;
    socketError: string | null;
    setSocketError: (err: string | null) => void;
    sendMessage: (
        content: string,
        convId?: string | null,
        replyToId?: string | null,
        type?: "TEXT" | "VOICE",
        attachments?: { id: string }[],
    ) => boolean;
    sendTypingStart: (convId?: string | null) => void;
    sendTypingStop: (convId?: string | null) => void;
    sendReaction: (messageId: string, reaction: string) => void;
    onToggleProfile?: () => void;
    isFriend?: boolean;
    myShowLastSeen?: boolean;
    socket?: any;
};

export default function ChatArea({
    conversationId,
    mobileView,
    goBackToList,
    typingConversations,
    connectionStatus,
    socketError,
    setSocketError,
    sendMessage,
    sendTypingStart,
    sendTypingStop,
    sendReaction,
    onToggleProfile,
    isFriend = true,
    myShowLastSeen,
    socket,
}: Props) {
    const queryClient = useQueryClient();
    const myUserId = getMyUserId();
    const {
        data: messagesData,
        isLoading: historyLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteMessages(conversationId);

    const { data: pinnedMessages = [] } = usePinnedMessages(conversationId);
    const [currentPinnedIndex, setCurrentPinnedIndex] = useState(0);

    // Keep currentPinnedIndex within bounds when pinnedMessages list changes
    useEffect(() => {
        if (currentPinnedIndex >= pinnedMessages.length) {
            setCurrentPinnedIndex(Math.max(0, pinnedMessages.length - 1));
        }
    }, [pinnedMessages.length, currentPinnedIndex]);

    const historyMessages = messagesData ? [...messagesData.pages].reverse().flat() : [];
    const { data: conversations } = useConversations();
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const [editingMessage, setEditingMessage] = useState<Message | null>(null);

    // ─── Selection State ─────────────────────────────────────────────────────
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [forwardModalOpen, setForwardModalOpen] = useState(false);
    const [forwardMessageIds, setForwardMessageIds] = useState<string[]>([]);

    const enterSelectMode = useCallback((firstId: string) => {
        setSelectionMode(true);
        setSelectedIds(new Set([firstId]));
    }, []);

    const exitSelectMode = useCallback(() => {
        setSelectionMode(false);
        setSelectedIds(new Set());
    }, []);

    const toggleSelect = useCallback((id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const handleEdit = (message: Message) => {
        setReplyingTo(null);
        setEditingMessage(message);
    };

    // Reset reply state on active conversation change or mobile view transition
    useEffect(() => {
        setReplyingTo(null);
        setEditingMessage(null);
        exitSelectMode();
    }, [conversationId, mobileView]);

    const updateEditedMessageInCache = (
        updatedMessage: Pick<Message, "id" | "content" | "editedAt">,
    ) => {
        if (!conversationId) return;

        queryClient.setQueryData<any>(["messages", conversationId], (current: any) => {
            if (!current) return current;

            return {
                ...current,
                pages: current.pages.map((page: Message[]) =>
                    page.map((existingMessage) => {
                        if (existingMessage.id === updatedMessage.id) {
                            return { ...existingMessage, ...updatedMessage };
                        }

                        if (
                            existingMessage.replyToId === updatedMessage.id &&
                            existingMessage.replyTo
                        ) {
                            return {
                                ...existingMessage,
                                replyTo: {
                                    ...existingMessage.replyTo,
                                    ...updatedMessage,
                                },
                            };
                        }

                        return existingMessage;
                    }),
                ),
            };
        });
    };

    const handleSaveEdit = async (content: string) => {
        if (!editingMessage) return false;

        setSocketError(null);

        try {
            const response = await MessageService.editMessage(
                editingMessage.id,
                content,
            );

            updateEditedMessageInCache(response.data);
            setEditingMessage(null);
            return true;
        } catch (error: unknown) {
            const errorMessage =
                error &&
                    typeof error === "object" &&
                    "message" in error &&
                    typeof error.message === "string"
                    ? error.message
                    : "Unable to edit the message. Please try again.";

            setSocketError(errorMessage);
            return false;
        }
    };

    const conversation = conversations?.find((item) => item.id === conversationId);
    const otherParticipant = conversation?.participants.find((participant) => participant.userId !== myUserId);
    const otherUser = otherParticipant
        ? {
            id: otherParticipant.user.id,
            displayName: otherParticipant.user.displayName,
            username: otherParticipant.user.username,
            avatarUrl: otherParticipant.user.avatarUrl,
            isOnline: otherParticipant.user.isOnline,
            lastSeen: otherParticipant.user.lastSeen,
            bio: (otherParticipant.user as any).bio || undefined,
        }
        : null;

    const otherUserTyping = conversationId ? !!typingConversations[conversationId] : false;

    const handleSend = (
        content: string,
        type?: "TEXT" | "VOICE",
        attachments?: { id: string }[],
    ) => {
        setSocketError(null);

        if (!sendMessage(content, conversationId, replyingTo?.id, type, attachments)) {
            setSocketError("Chat is still connecting. Please try again in a moment.");
        } else {
            setReplyingTo(null);
        }
    };

    const removeMessageFromCache = (messageId: string) => {
        if (!conversationId) return;
        queryClient.setQueryData<any>(['messages', conversationId], (current: any) => {
            if (!current) return current;
            return {
                ...current,
                pages: current.pages.map((page: Message[]) =>
                    page.filter((msg) => msg.id !== messageId),
                ),
            };
        });
    };

    const markMessageDeleted = (messageId: string) => {
        if (!conversationId) return;
        queryClient.setQueryData<any>(['messages', conversationId], (current: any) => {
            if (!current) return current;
            return {
                ...current,
                pages: current.pages.map((page: Message[]) =>
                    page.map((msg) =>
                        msg.id === messageId
                            ? { ...msg, deletedAt: new Date().toISOString(), content: 'This message was deleted' }
                            : msg,
                    ),
                ),
            };
        });
    };

    const handleDeleteForMe = useCallback(async (messageId: string) => {
        try {
            await MessageService.deleteForMe(messageId);
            removeMessageFromCache(messageId); // immediately remove from UI
        } catch (error: any) {
            setSocketError(error.message ?? 'Failed to delete message');
        }
    }, [conversationId, queryClient]);

    const handlePin = useCallback(async (messageId: string, pinnedDuration?: string | null) => {
        try {
            await MessageService.pinMessage(messageId, pinnedDuration);
            queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
            queryClient.invalidateQueries({ queryKey: ["pinnedMessages", conversationId] });
        } catch (error: any) {
            setSocketError(error.message ?? 'Failed to pin message');
        }
    }, [conversationId, queryClient]);

    const handleUnpin = useCallback(async (messageId: string) => {
        try {
            await MessageService.unpinMessage(messageId);
            queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
            queryClient.invalidateQueries({ queryKey: ["pinnedMessages", conversationId] });
        } catch (error: any) {
            setSocketError(error.message ?? 'Failed to unpin message');
        }
    }, [conversationId, queryClient]);

    const handleDeleteForEveryone = useCallback(async (messageId: string) => {
        try {
            await MessageService.deleteForEveryone(messageId);
            markMessageDeleted(messageId); // mark as deleted in UI
            // The socket event 'messageDeleted' will handle the other participants
        } catch (error: any) {
            setSocketError(error.message ?? 'Failed to delete message');
        }
    }, [conversationId, queryClient]);

    const handleHide = useCallback(async (messageId: string) => {
        try {
            await MessageService.hideMessage(messageId);
            removeMessageFromCache(messageId); // just remove from this user's view
        } catch (error: any) {
            setSocketError(error.message ?? 'Failed to hide message');
        }
    }, [conversationId, queryClient]);

    // ─── Bulk Handlers ───────────────────────────────────────────────────────
    const handleBulkDeleteForMe = useCallback(async () => {
        const ids = Array.from(selectedIds);
        try {
            await MessageService.bulkDeleteForMe(ids);
            ids.forEach((id) => removeMessageFromCache(id));
            exitSelectMode();
        } catch (err: any) {
            setSocketError(err?.message ?? 'Failed to delete messages');
        }
    }, [selectedIds, conversationId, queryClient, exitSelectMode]);

    const handleBulkDeleteForEveryone = useCallback(async () => {
        const ids = Array.from(selectedIds).filter((id) => {
            const msg = historyMessages.find((m) => m.id === id);
            return msg?.senderId === myUserId;
        });
        try {
            await MessageService.bulkDeleteForEveryone(ids);
            ids.forEach((id) => markMessageDeleted(id));
            exitSelectMode();
        } catch (err: any) {
            setSocketError(err?.message ?? 'Failed to delete messages');
        }
    }, [selectedIds, conversationId, queryClient, exitSelectMode, historyMessages, myUserId]);

    const handleBulkHide = useCallback(async () => {
        const ids = Array.from(selectedIds);
        try {
            await MessageService.bulkHideMessages(ids);
            ids.forEach((id) => removeMessageFromCache(id));
            exitSelectMode();
        } catch (err: any) {
            setSocketError(err?.message ?? 'Failed to hide messages');
        }
    }, [selectedIds, conversationId, queryClient, exitSelectMode]);

    const handleBulkForward = useCallback(() => {
        const ids = Array.from(selectedIds);
        setForwardMessageIds(ids);
        setForwardModalOpen(true);
    }, [selectedIds]);

    const handleForwardSingle = useCallback((message: Message) => {
        setForwardMessageIds([message.id]);
        setForwardModalOpen(true);
    }, []);



    if (!conversationId) {
        return (
            <main className={cn(
                "min-w-0 flex-1 flex-col items-center justify-center bg-background",
                "md:flex",
                mobileView === "chat" ? "flex" : "hidden",
            )}>
                <div className="flex flex-col items-center gap-3 text-center">
                    <MailAnimation size={150} scale={2.2} className="mb-2" />
                    <p className="text-[14px] font-medium">Select a conversation</p>
                    <p className="text-[12px] text-muted-foreground">
                        Choose from your chats to start messaging
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className={cn(
            "relative min-w-0 flex-1 flex-col overflow-hidden",
            "md:flex",
            mobileView === "chat" ? "flex" : "hidden",
        )}
            style={{ backgroundImage: `url('/chat-bg-5.jpg')` }}>
            {/* Unified dark overlay to dim the background image evenly across the chat history and composer */}
            <div className="absolute inset-0 bg-black/95 pointer-events-none z-0" />

            <div className="relative z-10 flex flex-1 flex-col min-h-0 w-full h-full">
                <ForwardMessageModal
                    open={forwardModalOpen}
                    messageIds={forwardMessageIds}
                    onClose={() => { setForwardModalOpen(false); exitSelectMode(); }}
                    onSuccess={(count) => {
                        console.log(`Forwarded to ${count} chat(s)`);
                    }}
                />

                <ChatHeader
                    conversationId={conversationId}
                    user={otherUser}
                    onBack={goBackToList}
                    onToggleContext={onToggleProfile ?? (() => { })}
                    isFriend={isFriend}
                    isTyping={otherUserTyping}
                    myShowLastSeen={myShowLastSeen}
                    selectionMode={selectionMode}
                    selectedCount={selectedIds.size}
                    onExitSelectMode={exitSelectMode}
                    onBulkDeleteForMe={handleBulkDeleteForMe}
                    onBulkDeleteForEveryone={handleBulkDeleteForEveryone}
                    onBulkHide={handleBulkHide}
                    onBulkForward={handleBulkForward}
                    selectedOwnCount={
                        Array.from(selectedIds).filter((id) => {
                            const msg = historyMessages.find((m) => m.id === id);
                            return msg?.senderId === myUserId;
                        }).length
                    }
                />

                {pinnedMessages.length > 0 && !selectionMode && (
                    <div className="relative z-20 flex w-full items-center justify-between border-b border-border bg-[#18181b]/80 backdrop-blur px-6 py-2 animate-in slide-in-from-top-2 duration-200">
                        <div className="flex flex-1 items-center gap-3 min-w-0 select-none cursor-pointer" onClick={() => {
                            const pinnedMsg = pinnedMessages[currentPinnedIndex];
                            if (pinnedMsg) {
                                const el = document.getElementById(`msg-${pinnedMsg.id}`);
                                if (el) {
                                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                                    el.classList.add("bg-emerald-500/10");
                                    setTimeout(() => {
                                        el.classList.remove("bg-emerald-500/10");
                                    }, 2000);
                                }
                            }
                        }}>
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                                <Pin className="h-4 w-4 rotate-45" />
                            </div>
                            <div className="flex flex-col min-w-0 leading-tight">
                                <p className="text-[11px] font-semibold text-emerald-400">
                                    {pinnedMessages.length > 1 
                                        ? `Pinned Message (${currentPinnedIndex + 1}/${pinnedMessages.length})` 
                                        : "Pinned Message"}
                                </p>
                                <p className="text-xs text-foreground font-medium truncate max-w-[500px]">
                                    <span className="text-muted-foreground mr-1">
                                        {pinnedMessages[currentPinnedIndex]?.sender?.displayName}:
                                    </span>
                                    {pinnedMessages[currentPinnedIndex]?.content || (pinnedMessages[currentPinnedIndex]?.type === "VOICE" ? "Voice message" : "Attachment")}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 ml-4">
                            {pinnedMessages.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentPinnedIndex((prev) => (prev - 1 + pinnedMessages.length) % pinnedMessages.length);
                                        }}
                                        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 transition cursor-pointer"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentPinnedIndex((prev) => (prev + 1) % pinnedMessages.length);
                                        }}
                                        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 transition cursor-pointer"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </>
                            )}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleUnpin(pinnedMessages[currentPinnedIndex].id);
                                }}
                                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                                title="Unpin"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}

                <ChatThread
                    messages={historyMessages ?? []}
                    myUserId={myUserId}
                    isLoading={historyLoading}
                    isTyping={otherUserTyping}
                    otherParticipantLastReadAt={otherParticipant?.lastReadAt}
                    sendReaction={sendReaction}
                    onReply={setReplyingTo}
                    fetchNextPage={fetchNextPage}
                    hasNextPage={!!hasNextPage}
                    isFetchingNextPage={isFetchingNextPage}
                    onEdit={handleEdit}
                    onDeleteForMe={handleDeleteForMe}
                    onDeleteForEveryone={handleDeleteForEveryone}
                    onHide={handleHide}
                    onForward={handleForwardSingle}
                    selectionMode={selectionMode}
                    selectedIds={selectedIds}
                    onToggleSelect={toggleSelect}
                    onEnterSelectMode={enterSelectMode}
                    onExitSelectMode={exitSelectMode}
                    onBulkDeleteForMe={handleBulkDeleteForMe}
                    onBulkDeleteForEveryone={handleBulkDeleteForEveryone}
                    onBulkHide={handleBulkHide}
                    onBulkForward={handleBulkForward}
                    onPin={handlePin}
                    onUnpin={handleUnpin}
                />

                {(connectionStatus !== "joined" || socketError) && (
                    <p className="px-6 pb-2 text-center text-[11px] text-muted-foreground bg-transparent">
                        {socketError ?? "Connecting to chat…"}
                    </p>
                )}

                <ChatComposer
                    onSend={handleSend}
                    disabled={connectionStatus !== "joined"}
                    onTypingStart={() => conversationId && sendTypingStart(conversationId)}
                    onTypingStop={() => conversationId && sendTypingStop(conversationId)}
                    replyingTo={replyingTo}
                    onCancelReply={() => setReplyingTo(null)}
                    editingMessage={editingMessage}
                    onSaveEdit={handleSaveEdit}
                    onCancelEdit={() => setEditingMessage(null)}
                />
            </div>
        </main>
    );
}
