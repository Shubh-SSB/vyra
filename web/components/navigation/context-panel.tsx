'use client'

import { motion } from 'framer-motion'
import { X, FileText, Image as ImageIcon, Info } from 'lucide-react'
import { slideInRightVariants } from '@/lib/animations'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ContextItem {
  id: string
  type: 'file' | 'image' | 'info'
  title: string
  description?: string
  timestamp?: string
}

interface ContextPanelProps {
  items: ContextItem[]
  isOpen: boolean
  onClose?: () => void
}

export function ContextPanel({ items, isOpen, onClose }: ContextPanelProps) {
  if (!isOpen) return null

  return (
    <motion.div
      variants={slideInRightVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-80 bg-background-secondary border-l border-border flex flex-col h-screen"
    >
      {/* Header */}
      <div className="p-lg border-b border-border flex items-center justify-between">
        <h3 className="text-heading text-text-primary">Context</h3>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="p-lg text-center">
            <p className="text-body text-text-tertiary">
              No context yet
            </p>
          </div>
        ) : (
          <div className="space-y-md p-lg">
            {items.map((item) => (
              <ContextItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {items.length > 0 && (
        <div className="border-t border-border p-lg">
          <Button
            variant="outline"
            className="w-full"
          >
            Clear Context
          </Button>
        </div>
      )}
    </motion.div>
  )
}

interface ContextItemComponentProps {
  item: ContextItem
}

function ContextItem({ item }: ContextItemComponentProps) {
  const iconMap = {
    file: FileText,
    image: ImageIcon,
    info: Info,
  }

  const Icon = iconMap[item.type]

  return (
    <div className="p-md rounded-lg bg-surface border border-border hover:border-text-secondary transition-premium cursor-pointer">
      <div className="flex gap-md">
        <Icon className="w-5 h-5 text-text-secondary flex-shrink-0 mt-xs" />
        <div className="flex-1 min-w-0">
          <p className="text-body font-medium text-text-primary truncate">
            {item.title}
          </p>
          {item.description && (
            <p className="text-caption text-text-tertiary truncate mt-xs">
              {item.description}
            </p>
          )}
          {item.timestamp && (
            <p className="text-caption text-text-tertiary mt-xs">
              {item.timestamp}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
