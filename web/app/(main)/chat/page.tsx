'use client';
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Pin,
  Archive,
  Settings,
  Plus,
  Users,
  MessageSquare,
} from "lucide-react";
import { VyraMark } from "@/components/vyra/logo";
import { cn } from "@/lib/utils";
import Link from "next/link";
import SearchInput from "@/components/search/search-input";
import ChatList from "@/components/chat/chat-list";
import ChatArea from "@/components/chat/chat-area";

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

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [contextOpen, setContextOpen] = useState(true);
  const [mobileView, setMobileView] = useState<MobileView>("list");
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("chats");
  // Track whether we pushed a history entry for the chat view
  const chatHistoryPushed = useRef(false);

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
  const handleMessage = (user: Connection) => {
    // Check if a conversation with this user already exists
    let conv = conversations.find(
      (c: any) => c.name === user.name || c.handle === user.username,
    );
    if (!conv) {
      // Create a fresh conversation
      conv = {
        id: `dm-${user.id}`,
        name: user.name,
        handle: user.username,
        preview: "Say hi 👋",
        time: "now",
        online: user.online,
        // messages: [],
      };
      setConversations((prev: any) => [conv!, ...prev]);
    }
    setSidebarTab("chats");
    selectConversation(conv.id);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <aside className="hidden w-[60px] shrink-0 flex-col items-center justify-between border-r border-border bg-surface-secondary py-5 md:flex">
        <div className="flex flex-col items-center gap-6">
          <Link href="/">
            <VyraMark />
          </Link>
          <RailIcon label="Chats" active />
          <RailIcon label="Pinned" icon={<Pin className="h-4 w-4" strokeWidth={1.5} />} />
          <RailIcon label="Archive" icon={<Archive className="h-4 w-4" strokeWidth={1.5} />} />
        </div>
        <div className="flex flex-col items-center gap-4">
          <RailIcon label="Settings" icon={<Settings className="h-4 w-4" strokeWidth={1.5} />} />
          <div className="h-8 w-8 rounded-full bg-surface-elevated ring-1 ring-border" />
        </div>
      </aside>

      <aside
        className={cn(
          "md:flex md:w-[320px] md:shrink-0 md:flex-col md:border-r md:border-border md:bg-surface-secondary",
          mobileView === "list"
            ? "flex w-full flex-col bg-surface-secondary md:w-[320px]"
            : "hidden",
        )}
      >

        <div className="px-5 pt-5">
          <div className="flex items-center gap-1 rounded-xl bg-surface p-1">
            <button
              onClick={() => setSidebarTab("chats")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-[12px] font-medium transition-colors",
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
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-[12px] font-medium transition-colors",
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
      />
    </div>
  );
}

function RailIcon({
  label,
  icon,
  active,
}: {
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      title={label}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface hover:text-foreground",
        active && "bg-surface text-foreground",
      )}
    >
      {icon ?? <div className="h-1.5 w-1.5 rounded-full bg-current" />}
    </button>
  );
}
