'use client';
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Pin,
  Archive,
  Settings,
  Plus,
  Send,
  Paperclip,
  Sparkles,
  FileText,
  Image as ImageIcon,
  Info,
  MoreHorizontal,
  ArrowLeft,
} from "lucide-react";
import { VyraMark, VyraWordmark } from "@/components/vyra/logo";
import { cn } from "@/lib/utils";
import Link from "next/link";

type Message = {
  id: string;
  from: "me" | "them";
  text: string;
  time: string;
};

type Conversation = {
  id: string;
  name: string;
  handle: string;
  preview: string;
  time: string;
  unread?: number;
  pinned?: boolean;
  online?: boolean;
  messages: Message[];
};

const CONVERSATIONS: Conversation[] = [
  {
    id: "1",
    name: "Design team",
    handle: "5 members",
    preview: "Agreed. I'll ask Aria to summarize the decisions.",
    time: "now",
    pinned: true,
    online: true,
    messages: [
      { id: "m1", from: "them", text: "The new onboarding flow feels calmer. Should we ship it Thursday?", time: "10:41" },
      { id: "m2", from: "me", text: "Yes. Let's cut the third step — it's noise.", time: "10:42" },
      { id: "m3", from: "them", text: "Agreed. I'll ask Aria to summarize the decisions.", time: "10:43" },
      { id: "m4", from: "them", text: "Also — the type scale feels right now. Bold headlines, quiet body.", time: "10:44" },
    ],
  },
  {
    id: "2",
    name: "Aria",
    handle: "Your assistant",
    preview: "I organized this week's decisions into a memo.",
    time: "9:12",
    pinned: true,
    online: true,
    messages: [
      { id: "m1", from: "them", text: "I organized this week's decisions into a memo.", time: "9:12" },
    ],
  },
  {
    id: "3",
    name: "Marcus Chen",
    handle: "@marcus",
    preview: "Draft looks great. One small edit on the hero.",
    time: "Tue",
    online: true,
    messages: [
      { id: "m1", from: "them", text: "Draft looks great. One small edit on the hero.", time: "Tue" },
    ],
  },
  {
    id: "4",
    name: "Product sync",
    handle: "8 members",
    preview: "Notes from Monday attached.",
    time: "Mon",
    messages: [
      { id: "m1", from: "them", text: "Notes from Monday attached.", time: "Mon" },
    ],
  },
  {
    id: "5",
    name: "Lena Park",
    handle: "@lena",
    preview: "Sending the revised brand deck tonight.",
    time: "Sun",
    messages: [
      { id: "m1", from: "them", text: "Sending the revised brand deck tonight.", time: "Sun" },
    ],
  },
  {
    id: "6",
    name: "Growth",
    handle: "12 members",
    preview: "Landing test bumped conversion 8%.",
    time: "Nov 3",
    messages: [
      { id: "m1", from: "them", text: "Landing test bumped conversion 8%.", time: "Nov 3" },
    ],
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

/** Mobile view state: 'list' = contacts sidebar, 'chat' = active conversation */
type MobileView = "list" | "chat";

export default function ChatPage() {
  const [activeId, setActiveId] = useState(CONVERSATIONS[0].id);
  const [query, setQuery] = useState("");
  const [contextOpen, setContextOpen] = useState(true);
  const [mobileView, setMobileView] = useState<MobileView>("list");
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

  const filtered = useMemo(() => {
    if (!query) return CONVERSATIONS;
    const q = query.toLowerCase();
    return CONVERSATIONS.filter(
      (c) => c.name.toLowerCase().includes(q) || c.preview.toLowerCase().includes(q),
    );
  }, [query]);

  const active = CONVERSATIONS.find((c) => c.id === activeId) ?? CONVERSATIONS[0];
  const pinned = filtered.filter((c) => c.pinned);
  const recent = filtered.filter((c) => !c.pinned);

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

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Rail — desktop only */}
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

      {/* ── Conversation list ─────────────────────────────────────── */}
      {/* Desktop: always visible as sidebar. Mobile: full-screen when mobileView='list' */}
      <aside
        className={cn(
          // Desktop — always a 320px sidebar
          "md:flex md:w-[320px] md:shrink-0 md:flex-col md:border-r md:border-border md:bg-surface-secondary",
          // Mobile — full-width or hidden depending on mobileView
          mobileView === "list"
            ? "flex w-full flex-col bg-surface-secondary md:w-[320px]"
            : "hidden",
        )}
      >
        <div className="px-5 pt-6">
          <div className="mb-5 flex items-center justify-between">
            <h1 className="font-display text-[22px] font-semibold tracking-tight">Inbox</h1>
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
              placeholder="Search"
              className="h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-16 text-[13px] font-medium text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
            />
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-border bg-surface-elevated px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground md:inline hidden">
              ⌘K
            </span>
          </div>
        </div>

        <div className="mt-6 flex-1 overflow-y-auto px-3 pb-6">
          {pinned.length > 0 && (
            <ListSection label="Pinned">
              {pinned.map((c) => (
                <ConversationRow
                  key={c.id}
                  c={c}
                  active={c.id === activeId}
                  onClick={() => selectConversation(c.id)}
                />
              ))}
            </ListSection>
          )}
          <ListSection label="Recent">
            {recent.map((c) => (
              <ConversationRow
                key={c.id}
                c={c}
                active={c.id === activeId}
                onClick={() => selectConversation(c.id)}
              />
            ))}
          </ListSection>
        </div>
      </aside>

      {/* ── Chat area ─────────────────────────────────────────────── */}
      {/* Desktop: always visible. Mobile: only when mobileView='chat' */}
      <main
        className={cn(
          "min-w-0 flex-1 flex-col",
          // Desktop: always flex
          "md:flex",
          // Mobile: flex only when chat is active
          mobileView === "chat" ? "flex" : "hidden",
        )}
      >
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-6">
          {/* Mobile header — back arrow goes to contact list, not landing */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={goBackToList}
              className="text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="h-7 w-7 rounded-full bg-surface-elevated ring-1 ring-border" />
                {active.online && (
                  <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-success ring-2 ring-background" />
                )}
              </div>
              <div>
                <p className="text-[14px] font-semibold leading-tight">{active.name}</p>
                <p className="text-[11px] text-muted-foreground">{active.handle}</p>
              </div>
            </div>
          </div>
          {/* Desktop header */}
          <div className="hidden items-center gap-3 md:flex">
            <div className="relative">
              <div className="h-9 w-9 rounded-full bg-surface-elevated ring-1 ring-border" />
              {active.online && (
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-background" />
              )}
            </div>
            <div>
              <p className="font-display text-[15px] font-semibold tracking-tight leading-tight">
                {active.name}
              </p>
              <p className="text-[12px] text-muted-foreground">{active.handle}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <IconButton>
              <Sparkles className="h-4 w-4" strokeWidth={1.5} />
            </IconButton>
            <IconButton onClick={() => setContextOpen((v) => !v)}>
              <Info className="h-4 w-4" strokeWidth={1.5} />
            </IconButton>
            <IconButton>
              <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
            </IconButton>
          </div>
        </header>

        <ChatThread key={active.id} conversation={active} />

        <Composer />
      </main>

      {/* Context panel — desktop only */}
      <AnimatePresence initial={false}>
        {contextOpen && (
          <motion.aside
            key="context"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 340, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease }}
            className="hidden shrink-0 overflow-hidden border-l border-border bg-surface-secondary lg:block"
          >
            <ContextPanel conversation={active} />
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Rail ---------- */

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

/* ---------- Conversation list ---------- */

function ListSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="mb-1 px-3 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

function ConversationRow({
  c,
  active,
  onClick,
}: {
  c: Conversation;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
        active ? "bg-surface-elevated" : "hover:bg-surface",
      )}
    >
      <div className="relative">
        <div className="h-9 w-9 rounded-full bg-surface-elevated ring-1 ring-border" />
        {c.online && (
          <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-success ring-2 ring-surface-secondary" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-[13px] font-medium text-foreground">{c.name}</p>
          <span className="shrink-0 text-[11px] text-muted-foreground">{c.time}</span>
        </div>
        <p className="truncate text-[12px] font-light text-muted-foreground">{c.preview}</p>
      </div>
    </button>
  );
}

/* ---------- Thread ---------- */

function ChatThread({ conversation }: { conversation: Conversation }) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto flex max-w-[820px] flex-col gap-2 px-8 py-10">
        <div className="mb-6 flex items-center justify-center">
          <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Today
          </span>
        </div>

        {conversation.messages.map((m, i) => {
          const prev = conversation.messages[i - 1];
          const grouped = prev?.from === m.from;
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease, delay: i * 0.03 }}
              className={cn(
                "flex w-full",
                m.from === "me" ? "justify-end" : "justify-start",
                grouped ? "mt-1" : "mt-4",
              )}
            >
              <div
                className={cn(
                  "max-w-[70%] px-4 py-3 text-[14px] leading-[1.55]",
                  m.from === "me"
                    ? "rounded-2xl rounded-tr-md bg-foreground text-background"
                    : "rounded-2xl rounded-tl-md bg-surface text-foreground",
                )}
              >
                {m.text}
                <div
                  className={cn(
                    "mt-1 text-[10px] tracking-wide",
                    m.from === "me" ? "text-background/50" : "text-muted-foreground",
                  )}
                >
                  {m.time}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Composer ---------- */

function Composer() {
  const [value, setValue] = useState("");
  return (
    <div className="shrink-0 border-t border-border bg-background px-6 py-5">
      <div className="mx-auto flex max-w-[820px] items-end gap-2 rounded-2xl border border-border bg-surface px-3 py-2.5 focus-within:border-ring">
        <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground">
          <Paperclip className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={1}
          placeholder="Message"
          className="min-h-[32px] max-h-40 flex-1 resize-none bg-transparent px-1 py-1.5 text-[14px] leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground">
          <Sparkles className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <button
          disabled={!value.trim()}
          onClick={() => setValue("")}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-foreground text-background transition-opacity disabled:opacity-30"
        >
          <Send className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>
      <p className="mx-auto mt-2 max-w-[820px] px-1 text-[11px] text-muted-foreground">
        ⏎ to send · ⇧⏎ for new line · ⌘/ for AI commands
      </p>
    </div>
  );
}

/* ---------- Context Panel ---------- */

function ContextPanel({ conversation }: { conversation: Conversation }) {
  return (
    <div className="flex h-full w-[340px] flex-col overflow-y-auto p-5">
      <div className="flex flex-col items-center pb-6 pt-2 text-center">
        <div className="mb-4 h-16 w-16 rounded-full bg-surface-elevated ring-1 ring-border" />
        <p className="font-display text-[19px] font-semibold tracking-tight">
          {conversation.name}
        </p>
        <p className="mt-0.5 text-[12px] text-muted-foreground">{conversation.handle}</p>
      </div>

      <PanelSection label="Aria summary" icon={<Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />}>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-[13px] leading-relaxed text-foreground">
            The team aligned on shipping onboarding v2 this Thursday. Step 3 was removed
            to reduce noise. Aria will document the decisions.
          </p>
          <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Updated 2m ago</span>
            <button className="text-foreground hover:underline">Regenerate</button>
          </div>
        </div>
      </PanelSection>

      <PanelSection label="Shared files" icon={<FileText className="h-3.5 w-3.5" strokeWidth={1.5} />}>
        <div className="flex flex-col gap-1">
          {[
            { name: "Onboarding.fig", meta: "Figma · 2d ago" },
            { name: "Decisions.md", meta: "Doc · 2d ago" },
            { name: "flow-v2.mp4", meta: "Video · 3d ago" },
          ].map((f) => (
            <div
              key={f.name}
              className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-surface"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated text-muted-foreground">
                <FileText className="h-3.5 w-3.5" strokeWidth={1.5} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] text-foreground">{f.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">{f.meta}</p>
              </div>
            </div>
          ))}
        </div>
      </PanelSection>

      <PanelSection label="Media" icon={<ImageIcon className="h-3.5 w-3.5" strokeWidth={1.5} />}>
        <div className="grid grid-cols-3 gap-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-md bg-surface"
              style={{
                background: `linear-gradient(135deg, oklch(0.22 0 0) 0%, oklch(0.28 0 0) 100%)`,
              }}
            />
          ))}
        </div>
      </PanelSection>
    </div>
  );
}

function PanelSection({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-2 px-1 text-muted-foreground">
        {icon}
        <p className="text-[10px] font-medium uppercase tracking-[0.16em]">{label}</p>
      </div>
      {children}
    </div>
  );
}

/* ---------- Shared ---------- */

function IconButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
    >
      {children}
    </button>
  );
}
