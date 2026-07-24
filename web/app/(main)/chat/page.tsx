'use client';
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Pin,
  Archive,
  Settings,
  Plus,
  Users,
  MessageSquare,
} from "lucide-react";
import { VyraIcon, VyraMark } from "@/components/vyra/logo";
import { cn } from "@/lib/utils";
import Link from "next/link";
import SearchInput from "@/components/search/search-input";
import ChatList from "@/components/chat/chat-list";
import ChatArea from "@/components/chat/chat-area";
import UserProfile from "@/components/chat/user-profile";
import { ConversationService } from "@/services/conversation.service";
import { useConversations } from "@/tanstack/queries/conversation.query";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { getAccessToken } from "@/lib/token";
import Image from "next/image";

type Conversation = {
  id: string;
  name: string;
  handle: string;
  preview: string;
  time: string;
  unread?: number;
  pinned?: boolean;
  online?: boolean;
  // messages: Message[]
};

type Connection = {
  id: string;
  name: string;
  username: string;
  bio: string;
  mutualCount: number;
  online?: boolean;
  // Extended profile fields
  isPublic: boolean;
  location?: string;
  website?: string;
  joinedDate: string;
  connectionsCount: number;
  tags: string[];
  accentColor: string; // hsl string for avatar gradient
};


const ease = [0.22, 1, 0.36, 1] as const;

/** Mobile view state: 'list' = contacts sidebar, 'chat' = active conversation */
type MobileView = "list" | "chat";
type SidebarTab = "chats" | "connections";

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

export default function ChatPage() {
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [contextOpen, setContextOpen] = useState(true);
  const [mobileView, setMobileView] = useState<MobileView>("list");
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("chats");
  const [typingConversations, setTypingConversations] = useState<Record<string, boolean>>({});
  const [socketError, setSocketError] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  // Track whether we pushed a history entry for the chat view
  const chatHistoryPushed = useRef(false);

  const { data: conversations } = useConversations();
  const conversationIds = conversations?.map((c) => c.id) ?? [];

  const myUserId = getMyUserId();

  const activeConversation = conversations?.find((c) => c.id === activeId);
  const otherParticipant = activeConversation?.participants.find((p) => p.userId !== myUserId);
  const otherUser = otherParticipant
    ? {
      displayName: otherParticipant.user.displayName,
      username: otherParticipant.user.username,
      avatarUrl: otherParticipant.user.avatarUrl,
      isOnline: otherParticipant.user.isOnline,
      bio: (otherParticipant.user as any).bio || undefined,
    }
    : null;

  // Auto-close profile on active conversation changes
  useEffect(() => {
    setProfileOpen(false);
  }, [activeId]);

  const {
    connectionStatus,
    sendMessage,
    sendTypingStart,
    sendTypingStop,
  } = useChatSocket({
    conversationIds,
    onNewMessage: (message, convId) => {
      queryClient.setQueryData<any[]>(["messages", convId], (current = []) => {
        if (current.some((existing) => existing.id === message.id)) return current;
        return [...current, message];
      });

      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onTypingStart: (payload) => {
      if (payload.userId === myUserId) return;
      setTypingConversations((prev) => ({
        ...prev,
        [payload.conversationId]: true,
      }));
    },
    onTypingStop: (payload) => {
      if (payload.userId === myUserId) return;
      setTypingConversations((prev) => ({
        ...prev,
        [payload.conversationId]: false,
      }));
    },
    onError: setSocketError,
  });

  // Intercept browser back gesture: when in chat view, go to list instead
  useEffect(() => {
    const onPopState = (e: PopStateEvent) => {
      if (e.state?.mobileChat === true) {
        // User swiped/pressed back while in chat — go to list
        setMobileView("list");
        chatHistoryPushed.current = false;
        // Push the list state back so further back navigations work correctly
        window.history.pushState({ mobileChat: false }, "");
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);


  /** Select a conversation — on mobile, push a history entry and switch to chat view */
  const selectConversation = (id: string) => {
    setActiveId(id);
    setMobileView("chat");
    // Push a history entry so swipe-back hits this state and we can intercept it
    window.history.pushState({ mobileChat: true }, "");
    chatHistoryPushed.current = true;
  };

  /** Go back to contacts list — also pop the history entry we pushed */
  const goBackToList = () => {
    setMobileView("list");
    if (chatHistoryPushed.current) {
      window.history.back();
      chatHistoryPushed.current = false;
    }
  };

  /** Open or create a DM with a Connection, then switch to Chats tab */
  const handleMessage = async (user: Connection) => {
    try {
      const response = await ConversationService.createDirectConversation(user.id);

      await queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setSidebarTab("chats");
      selectConversation(response.data.id);
    } catch (error) {
      console.error("Unable to create the conversation.", error);
    }
  };


  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">


      <aside
        className={cn(
          "md:flex md:w-[320px] md:shrink-0 md:flex-col md:border-r md:rounded-tr-2xl md:border-border md:bg-surface-secondary",
          mobileView === "list"
            ? "flex w-full flex-col bg-surface-secondary md:w-[320px]"
            : "hidden",
        )}
      >

        <div className="px-5 pt-5">
          <div className="flex items-center gap-1 rounded-2xl bg-surface p-2">
            <button
              onClick={() => setSidebarTab("chats")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-md font-medium transition-colors",
                sidebarTab === "chats"
                  ? "bg-surface-elevated text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.75} />
              Chats
            </button>
            <button
              onClick={() => setSidebarTab("connections")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-md font-medium transition-colors",
                sidebarTab === "connections"
                  ? "bg-surface-elevated text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Users className="h-3.5 w-3.5" strokeWidth={1.75} />
              Connections
            </button>
          </div>
        </div>

        {sidebarTab === "chats" && (
          <>
            <div className="px-5 pt-4">
              <div className="mb-4 flex items-center justify-between">
                <h1 className="font-display text-[20px] font-semibold tracking-tight">Inbox</h1>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface hover:text-foreground">
                  <Plus className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
                  strokeWidth={1.75}
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search conversations"
                  className="h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-4 text-[13px] font-medium text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
                />
              </div>
            </div>
            <div className="mt-4 flex-1 overflow-y-auto px-3 pb-6">
              <ChatList
                activeId={activeId ?? undefined}
                onSelect={(conv) => selectConversation(conv.id)}
                typingConversations={typingConversations}
              />
            </div>
          </>
        )}

        {sidebarTab === "connections" && (
          <SearchInput
            onMessage={(user) => {
              handleMessage({
                id: user.id,
                name: user.displayName,
                username: user.username,
                bio: user.bio || "",
                mutualCount: 0,
                online: false,
                isPublic: user.profileVisibility !== "PRIVATE",
                joinedDate: "now",
                connectionsCount: 0,
                tags: [],
                accentColor: "oklch(0.65 0.18 280)",
              });
            }}
          />
        )}
      </aside>
      <ChatArea
        conversationId={activeId}
        mobileView={mobileView}
        goBackToList={goBackToList}
        typingConversations={typingConversations}
        connectionStatus={connectionStatus}
        socketError={socketError}
        setSocketError={setSocketError}
        sendMessage={sendMessage}
        sendTypingStart={sendTypingStart}
        sendTypingStop={sendTypingStop}
        onToggleProfile={() => setProfileOpen((prev) => !prev)}
      />
      <AnimatePresence>
        {profileOpen && activeId && (
          <>
            {/* PC Side Panel Drawer */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 380, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 180, damping: 22 }}
              className="hidden lg:block lg:shrink-0 h-full overflow-hidden border-l border-border bg-background"
            >
              <div className="w-[380px] h-full">
                <UserProfile
                  user={otherUser}
                  onClose={() => setProfileOpen(false)}
                  onMessageClick={() => setProfileOpen(false)}
                />
              </div>
            </motion.div>
            {/* Mobile Fullscreen Overlay */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 180, damping: 22 }}
              className="fixed inset-0 z-50 lg:hidden w-full h-full"
            >
              <UserProfile
                user={otherUser}
                onClose={() => setProfileOpen(false)}
                onMessageClick={() => setProfileOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
