'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { fadeVariants } from '@/lib/animations'
import { Send, Paperclip } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MessageInputProps {
  onSend: (message: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function MessageInput({
  onSend,
  placeholder = 'Type your message...',
  disabled = false,
  className,
}: MessageInputProps) {
  const [value, setValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (value.trim() && !disabled) {
      onSend(value)
      setValue('')
      if (textareaRef.current) {
        textareaRef.current.style.height = '48px'
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setValue(newValue)

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120)
      textareaRef.current.style.height = `${newHeight}px`
    }
  }

  return (
    <motion.div
      variants={fadeVariants}
      initial="initial"
      animate="animate"
      className={cn(
        'border-t border-border bg-background-secondary p-4',
        className,
      )}
    >
      <div className="flex gap-3 max-w-4xl mx-auto">
        <div className="flex-1 flex gap-2 items-end">
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className={cn(
                'w-full px-4 py-2 bg-surface border border-border rounded text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-accent transition-premium resize-none max-h-30',
                disabled && 'opacity-50 cursor-not-allowed',
                isFocused && 'border-accent',
              )}
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            disabled={disabled}
            className="flex-shrink-0"
          >
            <Paperclip className="w-4 h-4" />
          </Button>
        </div>
        <Button
          onClick={handleSend}
          size="icon"
          disabled={!value.trim() || disabled}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  )
}
