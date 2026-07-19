import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent text-sm font-medium whitespace-nowrap transition-premium outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-accent text-background hover:bg-accent-hover',
        outline:
          'border-border bg-surface hover:bg-surface-hover text-text-primary',
        secondary:
          'bg-surface-hover text-text-primary hover:bg-surface-hover/80',
        ghost:
          'hover:bg-surface text-text-primary',
        destructive:
          'bg-error/20 text-error hover:bg-error/30',
        link: 'text-accent underline-offset-4 hover:underline',
      },
      size: {
        default:
          'h-8 gap-1.5 px-3',
        xs: "h-6 gap-1 px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 px-2.5 text-body-small [&_svg:not([class*='size-'])]:size-3.5",
        lg: 'h-9 gap-1.5 px-4',
        icon: 'size-8',
        'icon-xs': "size-6 [&_svg:not([class*='size-'])]:size-3",
        'icon-sm': 'size-7',
        'icon-lg': 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
