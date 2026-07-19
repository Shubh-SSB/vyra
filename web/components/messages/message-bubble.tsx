'use client'

import { motion } from 'framer-motion'
import { messageEnterVariants } from '@/lib/animations'
import { cn } from '@/lib/utils'

interface MessageBubbleProps {
  content: string
  variant: 'incoming' | 'outgoing'
  timestamp?: string
  isLoading?: boolean
  className?: string
}

export function MessageBubble({
  content,
  variant,
  timestamp,
  isLoading,
  className,
}: MessageBubbleProps) {
  return (
    <motion.div
      variants={messageEnterVariants}
      initial="initial"
      animate="animate"
      className={cn(
        'flex gap-2',
        variant === 'outgoing' && 'justify-end',
      )}
    >
      <div
        className={cn(
          'max-w-[70%] rounded-lg px-4 py-2 transition-premium',
          variant === 'outgoing'
            ? 'bg-accent text-background'
            : 'bg-surface text-text-primary',
          className,
        )}
      >
        <p className="text-sm break-words">
          {isLoading ? (
            <span className="flex gap-1">
              <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
              <span className="h-2 w-2 rounded-full bg-current animate-pulse delay-100" />
              <span className="h-2 w-2 rounded-full bg-current animate-pulse delay-200" />
            </span>
          ) : (
            content
          )}
        </p>
        {timestamp && !isLoading && (
          <p className="text-xs text-text-tertiary mt-1">
            {timestamp}
          </p>
        )}
      </div>
    </motion.div>
  )
}
