'use client';
import { Suspense, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Settings,
  Plus,
  Users,
  MessageCircle,
  Bell,
  MoreVertical,
  Bookmark,
  EyeOff,
  Compass,
  Send,
  ArrowLeft,
} from "lucide-react";
import { VyraIcon } from "@/components/vyra/logo";
import { cn } from "@/lib/utils";
import Link from "next/link";
import ExploreCard from "@/components/explore/explore-card";
import { useDebounce } from "use-debounce";
import { useExploreSearch } from "@/tanstack/queries/explore.query";
import ShareObjectModal from "@/components/modal/share-object.modal";
import SearchInput from "@/components/search/search-input";
import ChatList from "@/components/chat/chat-list";
import ChatArea from "@/components/chat/chat-area";
import UserProfile from "@/components/chat/user-profile";
import { ConversationService } from "@/services/conversation.service";
import { NotificationService } from "@/services/notification.service";
import { useConversations } from "@/tanstack/queries/conversation.query";
import { useMe } from "@/tanstack/queries/auth.query";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { getAccessToken } from "@/lib/token";
import { useRelationship } from "@/tanstack/queries/friend.query";
import { useSearchParams } from "next/navigation";
import { playSound } from "@/lib/sounds";
import { NewChatModal } from "@/components/modal/new-chat.modal";
import { useUnreadCount } from "@/tanstack/queries/notification.query";
import NotificationsDrawer from "@/components/notifications/notifications-drawer";


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

/** Mobile view state: 'list' = contacts sidebar, 'chat' = active conversation */
type MobileView = "list" | "chat";
type SidebarTab = "chats" | "connections" | "explore";

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

function ChatPageContent() {
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [mobileView, setMobileView] = useState<MobileView>("list");
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("chats");
  const [typingConversations, setTypingConversations] = useState<Record<string, boolean>>({});
  const [socketError, setSocketError] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const { data: unreadCount = 0 } = useUnreadCount();

  // Explore / Universal Search States
  const [exploreActive, setExploreActive] = useState(false);
  const [exploreQuery, setExploreQuery] = useState("");
  const [exploreFilter, setExploreFilter] = useState<string | undefined>(undefined);
  const [debouncedExploreQuery] = useDebounce(exploreQuery, 350);
  const [sharingObject, setSharingObject] = useState<any>(null);

  const { data: exploreResults = [], isLoading: exploreLoading } = useExploreSearch(
    debouncedExploreQuery,
    exploreFilter
  );

  // Audio Preview state
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleTogglePreview = (trackId: string, previewUrl: string) => {
    if (playingTrackId === trackId) {
      audioRef.current?.pause();
      setPlayingTrackId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(previewUrl);
      audioRef.current.play().catch((err) => console.warn("Audio preview autoplay blocked:", err));
      setPlayingTrackId(trackId);
      audioRef.current.onended = () => {
        setPlayingTrackId(null);
      };
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Pause audio preview when switching views or typing new searches
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlayingTrackId(null);
    }
  }, [exploreActive, exploreQuery, exploreFilter]);

  const searchParams = useSearchParams();
  const convId = searchParams.get("convId");

  useEffect(() => {
    if (convId) {
      setExploreActive(false);
      setActiveId(convId);
      setMobileView("chat");
    }
  }, [convId]);

  useEffect(() => {
    if (activeId) {
      sessionStorage.setItem("activeConversationId", activeId);
      NotificationService.clearConversationNotifications(activeId)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
        })
        .catch((err) => {
          console.warn("Failed to clear notifications for conversation:", err);
        });
    } else {
      sessionStorage.removeItem("activeConversationId");
    }

    return () => {
      sessionStorage.removeItem("activeConversationId");
    };
  }, [activeId, queryClient]);

  const { data: conversations } = useConversations();
  const { data: meResponse } = useMe();
  const conversationIds = conversations?.map((c) => c.id) ?? [];

  const myUserId = getMyUserId();

  const activeConversation = conversations?.find((c) => c.id === activeId);
  const otherParticipant = activeConversation?.participants.find((p) => p.userId !== myUserId);
  const otherUser = otherParticipant
    ? {
      id: otherParticipant.user.id,
      displayName: otherParticipant.user.displayName,
      username: otherParticipant.user.username,
      avatarUrl: otherParticipant.user.avatarUrl,
      bannerUrl: otherParticipant.user.bannerUrl,
      isOnline: otherParticipant.user.isOnline,
      bio: (otherParticipant.user as any).bio || undefined,
    }
    : null;

  const { data: relationship } = useRelationship(otherUser?.id);
  const isFriend = relationship === "FRIENDS";

  // Auto-close profile on active conversation changes
  useEffect(() => {
    setProfileOpen(false);
  }, [activeId]);

  const {
    connectionStatus,
    sendMessage,
    sendTypingStart,
    sendTypingStop,
    markAsRead,
    sendReaction,
    socket,
  } = useChatSocket({
    conversationIds,
    onNewMessage: (message, convId) => {
      queryClient.setQueryData<any>(["messages", convId], (current: any) => {
        if (!current) return current;
        const exists = current.pages.some((page: any[]) =>
          page.some((m) => m.id === message.id)
        );
        if (exists) return current;

        const newPages = [...current.pages];
        const lastPageIdx = newPages.length - 1;
        newPages[lastPageIdx] = [...newPages[lastPageIdx], message];

        return {
          ...current,
          pages: newPages,
        };
      });

      if (message.senderId !== myUserId) {
        playSound("received");
      }

      if (convId === activeId) {
        markAsRead(convId);
      }

      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onMessageEdited: ({ conversationId, message }) => {
      queryClient.setQueryData<any>(["messages", conversationId], (current: any) => {
        if (!current) return current;


        return {
          ...current,
          pages: current.pages.map((page: any[]) =>
            page.map((existing) => {
              if (existing.id == message.id) {
                return { ...existing, ...message };
              }

              if (existing.replyToId === message.id && existing.replyTo) {
                return {
                  ...existing,
                  replyTo: { ...existing.replyTo, ...message }
                };
              }
              return existing;
            })
          ),
        };
      });
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
    onMessagesRead: ({ conversationId, userId, lastReadAt }) => {
      queryClient.setQueryData<any[]>(["conversations"], (current = []) => {
        return current.map((conv) => {
          if (conv.id !== conversationId) return conv;
          const isMe = userId === myUserId;
          return {
            ...conv,
            unreadCount: isMe ? 0 : conv.unreadCount,
            participants: conv.participants.map((part: any) => {
              if (part.userId !== userId) return part;
              return { ...part, lastReadAt };
            }),
          };
        });
      });
    },
    onUserPresence: ({ userId, isOnline, lastSeen }) => {
      queryClient.setQueryData<any[]>(["conversations"], (current = []) => {
        return current.map((conv) => {
          return {
            ...conv,
            participants: conv.participants.map((part: any) => {
              if (part.userId !== userId) return part;
              return {
                ...part,
                user: {
                  ...part.user,
                  isOnline,
                  lastSeen,
                },
              };
            }),
          };
        });
      });
    },
    onMessageReaction: ({ conversationId, messageId, reactions }) => {
      queryClient.setQueryData<any>(["messages", conversationId], (current: any) => {
        if (!current) return current;
        return {
          ...current,
          pages: current.pages.map((page: any[]) =>
            page.map((msg) => {
              if (msg.id !== messageId) return msg;
              return { ...msg, reactions };
            })
          ),
        };
      });
    },
    onError: setSocketError,
  });

  // Mark active conversation as read when activeId changes or joins
  useEffect(() => {
    if (activeId && connectionStatus === "joined") {
      markAsRead(activeId);
    }
  }, [activeId, connectionStatus, markAsRead]);

  const openProfile = () => {
    setProfileOpen(true);
    window.history.pushState({ view: "profile" }, "");
  };

  const closeProfile = () => {
    setProfileOpen(false);
    if (window.history.state?.view === "profile") {
      window.history.back();
    }
  };

  // Intercept browser back gesture: when in chat view, go to list instead
  useEffect(() => {
    if (typeof window !== "undefined" && !window.history.state) {
      window.history.replaceState({ view: "list" }, "");
    }

    const onPopState = (e: PopStateEvent) => {
      const view = e.state?.view;
      if (profileOpen && view !== "profile") {
        setProfileOpen(false);
      }
      if (mobileView === "chat" && view !== "chat" && view !== "profile") {
        setMobileView("list");
      }
      if (mobileView === "list" && view === "chat") {
        setMobileView("chat");
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [mobileView, profileOpen]);


  /** Select a conversation — on mobile, push a history entry and switch to chat view */
  const selectConversation = (id: string) => {
    setExploreActive(false);
    setActiveId(id);
    setMobileView("chat");
    if (window.history.state?.view !== "chat") {
      window.history.pushState({ view: "chat" }, "");
    }
  };

  /** Go back to contacts list — also pop the history entry we pushed */
  const goBackToList = () => {
    setMobileView("list");
    if (window.history.state?.view === "chat") {
      window.history.back();
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
    <div className="fixed inset-0 flex h-[100dvh] w-full overflow-hidden bg-background text-foreground md:static md:h-screen">
      <NewChatModal
        open={newChatOpen}
        onClose={() => setNewChatOpen(false)}
        onStartChat={(friend) => {
          handleMessage({
            id: friend.id,
            name: friend.displayName,
            username: friend.username,
            bio: "",
            mutualCount: 0,
            online: false,
            isPublic: true,
            joinedDate: "now",
            connectionsCount: 0,
            tags: [],
            accentColor: "oklch(0.65 0.18 280)",
          });
        }}
        onGoToGlobalSearch={() => setSidebarTab("connections")}
      />

      <aside
        className={cn(
          "md:flex md:w-[320px] md:shrink-0 md:flex-col md:border-r md:rounded-tr-2xl md:border-border md:bg-surface-secondary",
          mobileView === "list"
            ? "flex w-full flex-col bg-surface-secondary md:w-[320px]"
            : "hidden",
        )}
      >
        {/* Mobile Top Bar — 3-dots nav menu */}
        <div className="relative z-30 flex h-14 shrink-0 items-center justify-between border-b border-border/60 bg-[#0E0E10]/90 px-4 backdrop-blur-xl md:hidden">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <VyraIcon height={20} width={20} />
            <span className="text-lg font-bold tracking-tight text-foreground">
              Vyra
            </span>
          </div>

          {/* Menu */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label="Menu"
            className="relative flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-white/5 hover:text-foreground active:scale-95"
          >
            <MoreVertical className="h-5 w-5" />

            {unreadCount > 0 && (
              <span className="absolute right-2 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text- [9px] font-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showMobileMenu && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowMobileMenu(false)}
                  className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
                />

                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -10 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-3 top-[calc(100%+8px)] z-50 w-[min(18rem,calc(100vw-24px))] overflow-hidden rounded-2xl border border-white/10 bg-[#111114]/95 p-1.5 shadow-2xl backdrop-blur-2xl"
                >
                  {/* Notifications */}
                  <button
                    onClick={() => { setShowMobileMenu(false); setShowNotifications(true); }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-white/5 active:bg-white/10"
                  >
                    <span className="flex items-center gap-3">
                      <Bell className="h-4 w-4 text-yellow-400" />
                      <span>Notifications</span>
                    </span>
                    {unreadCount > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </button>

                  <div className="my-1 h-px bg-white/5" />

                  {/* Nav links */}
                  <Link href="/chat" onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-white/5 active:bg-white/10">
                    <MessageCircle className="h-4 w-4 text-primary" />
                    Chats
                  </Link>
                  <Link href="/settings/hidden-messages" onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-white/5 active:bg-white/10">
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                    Hidden Messages
                  </Link>
                  <Link href="/settings/collections" onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-white/5 active:bg-white/10">
                    <Bookmark className="h-4 w-4 text-muted-foreground" />
                    Saved Collections
                  </Link>

                  <button
                    onClick={() => {
                      setShowMobileMenu(false);
                      setExploreActive(true);
                      setActiveId(null);
                      setMobileView("chat");
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-white/5 active:bg-white/10 cursor-pointer"
                  >
                    <Compass className="h-4 w-4 text-muted-foreground" />
                    Explore
                  </button>

                  <div className="my-1 h-px bg-white/5" />

                  <Link href="/settings" onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-white/5 active:bg-white/10">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    Settings
                  </Link>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
        <NotificationsDrawer
          open={showNotifications}
          onClose={() => setShowNotifications(false)}
        />

        {sidebarTab !== "explore" && (
          <div className="px-5 pt-5">
            <div className="flex items-center gap-1 rounded-2xl bg-surface p-2">
              <button
                onClick={() => setSidebarTab("chats")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-sm font-medium transition-colors",
                  sidebarTab === "chats"
                    ? "bg-surface-elevated text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.75} />
                Chats
              </button>
              <button
                onClick={() => setSidebarTab("connections")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-sm font-medium transition-colors",
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
        )}

        {sidebarTab === "chats" && (
          <>
            <div className="px-5 pt-4">
              <div className="mb-4 flex items-center justify-between">
                <h1 className="font-display text-[20px] font-semibold tracking-tight">Inbox</h1>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setExploreActive(true);
                      setActiveId(null);
                      setMobileView("chat");
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface hover:text-foreground cursor-pointer"
                    title="Explore & Share"
                  >
                    <Compass className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                  <button
                    onClick={() => setNewChatOpen(true)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface hover:text-foreground cursor-pointer"
                  >
                    <Plus className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                </div>
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
                query={query}
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
      {exploreActive ? (
        <div className={cn(
          "flex-1 h-full flex flex-col bg-background min-w-0 min-h-0",
          mobileView === "list" ? "hidden md:flex" : "flex"
        )}>
          {/* Header Banner */}
          <div className="px-8 pt-6 pb-4 border-b border-border/40 bg-surface-secondary/30 backdrop-blur-md shrink-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => {
                      setExploreActive(false);
                      setMobileView("list");
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface hover:text-foreground md:hidden cursor-pointer -ml-1"
                    title="Back to Chats"
                  >
                    <ArrowLeft className="h-4.5 w-4.5" />
                  </button>
                  <h1 className="font-display text-[24px] font-semibold tracking-tight text-foreground">Explore</h1>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Discover and pin media, publications, projects, and models straight to your chats.</p>
              </div>

              {/* Search Input */}
              <div className="relative w-full md:max-w-md shrink-0">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
                  strokeWidth={1.75}
                />
                <input
                  value={exploreQuery}
                  onChange={(e) => setExploreQuery(e.target.value)}
                  placeholder="Search songs, movies, books, code, models..."
                  className="h-9 w-full rounded-xl border border-border bg-surface pl-9 pr-4 text-[13px] font-medium text-foreground placeholder:text-muted-foreground/60 focus:border-ring focus:outline-none transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-4 scrollbar-none shrink-0">
              {[
                { label: "All Items", value: undefined },
                { label: "🎵 Music & Audio", value: "MUSIC" },
                { label: "🎬 Movies & Shows", value: "MOVIE" },
                { label: "📚 Books & Literature", value: "BOOK" },
                { label: "🎮 Video Games", value: "GAME" },
                { label: "💻 GitHub Repos", value: "GITHUB" },
                { label: "🤖 AI Models", value: "AI_MODEL" },
                { label: "📷 Photos & Images", value: "PHOTO" },
              ].map((badge) => (
                <button
                  key={badge.label}
                  onClick={() => setExploreFilter(badge.value)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-semibold rounded-full border transition whitespace-nowrap cursor-pointer",
                    exploreFilter === badge.value
                      ? "bg-primary text-primary-foreground border-primary shadow"
                      : "bg-surface-elevated/40 border-white/[0.03] text-muted-foreground hover:text-foreground hover:bg-surface-elevated"
                  )}
                >
                  {badge.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results Grid */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            {exploreLoading && (
              <div className="flex flex-col items-center justify-center py-32 gap-3">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-muted-foreground font-medium">Querying universal directory...</span>
              </div>
            )}

            {!exploreLoading && !debouncedExploreQuery && exploreResults.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center max-w-sm mx-auto select-none">
                <Compass className="h-14 w-14 text-muted-foreground/30 mb-4 animate-[pulse_3s_infinite]" />
                <p className="text-sm font-semibold text-muted-foreground/80">Search Anything</p>
                <p className="text-xs text-muted-foreground/60 leading-normal mt-1.5">
                  Explore integrations with Deezer, TMDB, OpenLibrary, RAWG, GitHub, Hugging Face, and Picsum Photos, then send rich media directly to your active contacts.
                </p>
              </div>
            )}

            {!exploreLoading && (debouncedExploreQuery || exploreFilter === "PHOTO" || exploreFilter === "MUSIC") && exploreResults.length === 0 && (
              <div className="text-center py-24 text-xs text-muted-foreground">
                No matching objects found.
              </div>
            )}

            {!exploreLoading && (debouncedExploreQuery || exploreFilter === "PHOTO" || exploreFilter === "MUSIC") && exploreResults.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-8">
                {exploreResults.map((item: any) => (
                  <ExploreCard
                    key={item.id}
                    item={item}
                    onShare={setSharingObject}
                    isPlaying={playingTrackId === item.id}
                    onPlayToggle={handleTogglePreview}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
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
          sendReaction={sendReaction}
          socket={socket}
          onToggleProfile={() => {
            if (profileOpen) {
              closeProfile();
            } else {
              openProfile();
            }
          }}
          isFriend={isFriend}
          myShowLastSeen={meResponse?.data?.showLastSeen ?? true}
        />
      )}
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
                  onClose={closeProfile}
                  onMessageClick={closeProfile}
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
                onClose={closeProfile}
                onMessageClick={closeProfile}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ShareObjectModal
        open={!!sharingObject}
        onClose={() => setSharingObject(null)}
        richObject={sharingObject}
        onSend={(conversationId) => {
          if (!sharingObject) return false;
          return sendMessage(
            JSON.stringify({
              vyraObjectType: "RICH_CARD",
              richObject: sharingObject,
            }),
            conversationId,
            null,
            "TEXT"
          );
        }}
      />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-svh items-center justify-center bg-[#09090b] text-foreground font-geist">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-white" />
          <p className="text-xs tracking-widest uppercase text-muted-foreground animate-pulse font-semibold">Loading Chat...</p>
        </div>
      </main>
    }>
      <ChatPageContent />
    </Suspense>
  );
}
