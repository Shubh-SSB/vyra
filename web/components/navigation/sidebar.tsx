'use client'

import { motion } from 'framer-motion'
import { Search, Settings, LogOut } from 'lucide-react'
import { slideInLeftVariants } from '@/lib/animations'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Chat {
  id: string
  name: string
  isPinned?: boolean
  isArchived?: boolean
  lastMessage?: string
  timestamp?: string
}

interface SidebarProps {
  chats: Chat[]
  activeChat?: string
  onSelectChat?: (id: string) => void
  onNewChat?: () => void
}

export function Sidebar({ chats, activeChat, onSelectChat, onNewChat }: SidebarProps) {
  const pinnedChats = chats.filter((c) => c.isPinned)
  const recentChats = chats.filter((c) => !c.isPinned && !c.isArchived)
  const archivedChats = chats.filter((c) => c.isArchived)

  return (
    <motion.div
      variants={slideInLeftVariants}
      initial="initial"
      animate="animate"
      className="w-72 bg-background-secondary border-r border-border flex flex-col h-screen"
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <Button
          onClick={onNewChat}
          className="w-full"
          variant="outline"
        >
          New Chat
        </Button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search chats..."
            className="w-full pl-10 pr-3 py-2 bg-surface border border-border rounded text-sm placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-accent transition-premium"
          />
        </div>
      </div>

      {/* Chats List */}
      <div className="flex-1 overflow-y-auto">
        {/* Pinned Section */}
        {pinnedChats.length > 0 && (
          <div>
            <p className="px-4 pt-4 pb-2 text-xs text-text-tertiary font-medium uppercase">
              Pinned
            </p>
            <div className="space-y-1 px-2">
              {pinnedChats.map((chat) => (
                <ChatItem
                  key={chat.id}
                  chat={chat}
                  isActive={activeChat === chat.id}
                  onClick={() => onSelectChat?.(chat.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Recent Section */}
        {recentChats.length > 0 && (
          <div>
            <p className="px-4 pt-4 pb-2 text-xs text-text-tertiary font-medium uppercase">
              Recent
            </p>
            <div className="space-y-1 px-2">
              {recentChats.map((chat) => (
                <ChatItem
                  key={chat.id}
                  chat={chat}
                  isActive={activeChat === chat.id}
                  onClick={() => onSelectChat?.(chat.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Archived Section */}
        {archivedChats.length > 0 && (
          <div>
            <p className="px-4 pt-4 pb-2 text-xs text-text-tertiary font-medium uppercase">
              Archived
            </p>
            <div className="space-y-1 px-2">
              {archivedChats.map((chat) => (
                <ChatItem
                  key={chat.id}
                  chat={chat}
                  isActive={activeChat === chat.id}
                  onClick={() => onSelectChat?.(chat.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border p-4 flex gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="flex-1 justify-start"
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="flex-1 justify-start"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </Button>
      </div>
    </motion.div>
  )
}

interface ChatItemProps {
  chat: Chat
  isActive: boolean
  onClick: () => void
}

function ChatItem({ chat, isActive, onClick }: ChatItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-3 py-2 rounded transition-premium',
        isActive
          ? 'bg-surface text-text-primary'
          : 'text-text-secondary hover:bg-surface hover:text-text-primary',
      )}
    >
      <p className="text-sm font-medium truncate">{chat.name}</p>
      {chat.lastMessage && (
        <p className="text-xs text-text-tertiary truncate mt-1">
          {chat.lastMessage}
        </p>
      )}
    </button>
  )
}
