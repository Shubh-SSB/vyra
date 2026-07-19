'use client'

import { motion } from 'framer-motion'
import { fadeVariants } from '@/lib/animations'
import { cn } from '@/lib/utils'

interface HeaderProps {
  title?: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
}

export function Header({
  title,
  subtitle,
  action,
  className,
}: HeaderProps) {
  return (
    <motion.div
      variants={fadeVariants}
      initial="initial"
      animate="animate"
      className={cn(
        'border-b border-border px-4 py-4 flex items-center justify-between bg-background-secondary',
        className,
      )}
    >
      <div className="flex-1 min-w-0">
        {title && (
          <h2 className="text-xl text-text-primary font-semibold">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="text-xs text-text-tertiary mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div className="ml-4 flex-shrink-0">
          {action}
        </div>
      )}
    </motion.div>
  )
}
