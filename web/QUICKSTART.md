# Vyra Quick Start Guide

## Get Started in 3 Steps

### 1. Install & Run
```bash
# Dependencies are already installed
pnpm dev
```
Visit **http://localhost:3000**

### 2. Explore the App
- **Landing Page** (`/`): See the hero section with mission messaging
- **Chat Interface** (`/chat`): Send messages, watch AI respond, open context panel

### 3. Customize
Edit files in `/components`, `/lib`, or `/app` to modify behavior.

---

## Project Structure Quick Reference

### Where to Find Things

| What | Where |
|------|-------|
| **Pages** | `app/page.tsx` (landing), `app/chat/page.tsx` (chat) |
| **Colors** | `app/globals.css` (@theme block) |
| **Fonts** | `app/layout.tsx` (Inter import) |
| **Spacing/Sizing** | `tailwind.config.ts` (extends theme) |
| **Components** | `components/` folder (organized by type) |
| **Animations** | `lib/animations.ts` (Framer Motion variants) |

---

## Common Customizations

### Change the Primary Color
Edit `app/globals.css`:
```css
@theme {
  --color-accent: hsl(220 100% 60%);  /* Change from white to blue */
}
```

### Add a New Message Variant
Edit `components/messages/message-bubble.tsx`:
```tsx
<div
  className={cn(
    'rounded-lg px-lg py-md transition-premium',
    variant === 'bot' && 'bg-surface-hover text-text-secondary',
    // ... add new variant
  )}
>
```

### Modify Button Sizes
Edit `tailwind.config.ts` in the `spacing` extend:
```ts
'xl': '24px',  // Change spacing values
'2xl': '32px',
```

### Add a New Page
1. Create `app/new-page/page.tsx`
2. Export default React component
3. Route automatically available at `/new-page`

---

## Component Usage Examples

### Use MessageBubble in a New Component
```tsx
import { MessageBubble } from '@/components/messages/message-bubble'

export function MyComponent() {
  return (
    <MessageBubble
      content="Hello, world!"
      variant="outgoing"
      timestamp="2:34 PM"
    />
  )
}
```

### Use Button Variants
```tsx
import { Button } from '@/components/ui/button'

<Button>Default</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>
<Button size="lg">Large Button</Button>
<Button size="icon"><Plus /></Button>
```

### Animate Components with Framer Motion
```tsx
import { motion } from 'framer-motion'
import { fadeVariants } from '@/lib/animations'

<motion.div
  variants={fadeVariants}
  initial="initial"
  animate="animate"
>
  Content appears with fade animation
</motion.div>
```

---

## Adding Features

### Add a New API Route
1. Create `app/api/route-name/route.ts`
2. Export `async function GET/POST(request)`
3. Access at `/api/route-name`

### Add Real Messaging
Replace the simulated AI responses in `app/chat/page.tsx`:
```tsx
// Old: setTimeout with fake response
// New: Call your API
const response = await fetch('/api/messages', {
  method: 'POST',
  body: JSON.stringify({ message })
})
const aiMessage = await response.json()
```

### Add State Persistence
Use React hooks with localStorage or a database:
```tsx
import { useEffect } from 'react'

export function MyComponent() {
  const [data, setData] = useState(null)
  
  useEffect(() => {
    // Load from database
    fetchData()
  }, [])
}
```

---

## Styling Utilities

### Available Classes (Tailwind)

#### Text Classes
```tsx
className="text-body"           // 16px body text
className="text-heading"        // 22px headings
className="text-display"        // 48px display (use custom size)
className="text-caption"        // 13px captions

className="text-text-primary"   // White
className="text-text-secondary" // Gray
className="text-text-tertiary"  // Dark gray
```

#### Background & Border
```tsx
className="bg-background"       // #0A0A0A
className="bg-surface"          // #1C1C1C
className="border-border"       // Subtle divider
```

#### Spacing
```tsx
className="p-lg"                // 16px padding
className="mb-md"               // 12px margin-bottom
className="gap-sm"              // 8px gap between items
className="px-xl py-md"         // Padding on axes
```

#### Custom Classes
```tsx
className="transition-premium"  // 300ms smooth transition
className="elevation-1"         // Subtle shadow
className="text-headline"       // Large bold text
```

---

## Troubleshooting

### Page shows blank or old code
```bash
# Clear build cache
rm -rf .next
pnpm dev
```

### Port already in use
```bash
# Kill the old process
kill $(lsof -t -i :3000)
pnpm dev
```

### TypeScript errors
```bash
# Regenerate types
pnpm build
```

### Tailwind classes not applying
1. Ensure file is in `app/` or `components/`
2. Check `tailwind.config.ts` content paths
3. Verify class names are exact (no typos)
4. Use `@apply` in CSS only, not in JSX

---

## Performance Tips

### Code Splitting
```tsx
// Lazy load heavy components
import dynamic from 'next/dynamic'
const ContextPanel = dynamic(() =>
  import('@/components/navigation/context-panel')
)
```

### Image Optimization
```tsx
// Always use Image component
import Image from 'next/image'
<Image src="/logo.png" alt="Logo" width={40} height={40} />
```

### Memoization
```tsx
// Prevent unnecessary re-renders
import { memo } from 'react'
export const MessageBubble = memo(MessageBubbleComponent)
```

---

## Deployment

### To Vercel (Recommended)
```bash
# Push to GitHub
git add .
git commit -m "Initial commit"
git push origin main

# Deploy from Vercel dashboard
# https://vercel.com/new
```

### Environment Variables
Create `.env.local`:
```
NEXT_PUBLIC_API_URL=https://api.example.com
API_SECRET=your_secret_key
```

---

## Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Framer Motion**: https://www.framer.com/motion/
- **shadcn/ui**: https://ui.shadcn.com
- **Lucide Icons**: https://lucide.dev

---

## Support

For issues or questions:
1. Check the `VYRA.md` and `BUILD_SUMMARY.md` documentation
2. Review component examples in existing code
3. Check console for TypeScript/build errors
4. Use the v0 Preview to test changes in real-time

---

**Happy Building! 🚀**

Vyra is ready for feature development. Start by connecting a real backend, adding authentication, and integrating your AI service.
