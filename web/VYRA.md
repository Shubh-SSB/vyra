# Vyra - AI-First Communication Platform

## Overview

Vyra is a premium, AI-first communication platform built with Next.js, Tailwind CSS, and Framer Motion. The core philosophy is: **"Conversations are temporary. Knowledge is permanent."**

## Philosophy

Unlike traditional messaging apps that focus solely on real-time communication, Vyra transforms every conversation into actionable intelligence. The platform treats conversations as temporary streams of input that feed into a permanent knowledge base—enabling users to search, retrieve, and act on insights from past interactions.

## Design System

### Color Palette (Dark Theme)
- **Background**: #0A0A0A - Primary dark background
- **Background Secondary**: #1A1A1A - Secondary surfaces
- **Surface**: #1C1C1C - Interactive surfaces
- **Text Primary**: #FFFFFF - Main text
- **Text Secondary**: #A8A8A8 - Secondary text
- **Text Tertiary**: #727272 - Tertiary/muted text
- **Accent**: #FFFFFF - Pure white for primary actions
- **Success**: #3DDC84 - Positive actions
- **Warning**: #FFB547 - Warnings
- **Error**: #FF5F57 - Errors

### Typography
- **Headings**: Inter font family (system fallback to sans-serif)
- **Body**: Inter with 16px base size, 1.5 line height
- **Size Scale**: 48px (H1) → 13px (Caption)
- **Font Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Spacing & Grid
- **Base Unit**: 8px grid system
- **Spacing Scale**: xs(4px), sm(8px), md(12px), lg(16px), xl(24px), 2xl(32px), 3xl(40px), 4xl(48px), 5xl(64px)
- **Border Radius**: 4px, 6px, 8px, 12px, 16px
- **Elevation System**: 3 shadow levels for subtle depth (no Material Design)

### Animation & Motion
- **Duration**: 150-250ms ease-out for all transitions
- **Message Entrance**: Fade + slide up animation
- **Interactions**: Smooth hover states with 1.02x scale
- **Transitions**: Consistent `transition-premium` (300ms) and `transition-smooth` (200ms)

## Architecture

### Pages
- **Landing Page** (`/`): Cinematic hero with mission statement and CTA
- **Chat Interface** (`/chat`): Three-column desktop layout

### Layout Structure
```
┌─────────────────────────────────────────┐
│       Navigation Bar (Landing)           │
├────────────┬──────────────┬──────────────┤
│  Sidebar   │  Main Chat   │   Context    │
│  (280px)   │   (flex)     │   (320px)    │
│            │              │              │
│ - Pinned   │ - Messages   │ - Files      │
│ - Recent   │ - Input      │ - Media      │
│ - Archived │              │ - Info       │
├────────────┼──────────────┼──────────────┤
│         All responsive - Mobile stacks   │
└────────────┴──────────────┴──────────────┘
```

## Component Library

### Navigation
- **Sidebar**: Organized chat list with sections (pinned, recent, archived)
- **Header**: Reusable header for pages/sections
- **ContextPanel**: Right sidebar for file/media/info context

### Messages
- **MessageBubble**: Two variants (incoming/outgoing) with timestamps
- **MessageInput**: Auto-expanding textarea with attachment support
- **MessageList**: Container with animation support (AnimatePresence)

### Base UI
- **Button**: Minimalist design with variants (default, outline, ghost, destructive, link)
- **Input**: Clean styling with focus states
- **Card**: Subtle elevation with hover effect

### Animations
- **Message Entrance**: Fade + slide up (200ms)
- **Page Transitions**: Fade (300ms)
- **Sidebar/Panel**: Slide in from edges (250ms)
- **Scale Interactions**: Button press effects (150ms)
- **Stagger Container**: 50ms delay between list items

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 with custom design tokens
- **Animations**: Framer Motion 12
- **Typography**: Inter via @next/font
- **UI Components**: shadcn/ui (customized)
- **State Management**: React hooks (useState, useRef, useEffect)
- **Build Tool**: Turbopack (default in Next.js 16)

## Features

### Landing Page
- Cinematic hero section with mission messaging
- Smooth fade-in animations
- Feature highlights with dots
- Call-to-action button to chat interface
- Premium minimal design

### Chat Interface
- **Real-time messaging** with simulated AI responses
- **Sidebar navigation**: Quick access to conversations
- **Message history**: Preserved across sessions (state-based)
- **Context panel**: Toggleable right sidebar
- **Auto-expanding input**: Textarea grows with content
- **Typing indicators**: Loading animation while AI responds
- **Timestamp grouping**: Messages organized with time labels

### Design Implementation
- **Responsive**: Mobile → Tablet → Desktop layouts
- **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation
- **Performance**: Optimized animations, efficient re-renders
- **Dark Mode**: Default dark theme with CSS variables

## File Structure

```
/app
  /chat
    page.tsx          # Chat interface
  layout.tsx          # Root layout
  globals.css         # Design tokens & Tailwind config
  page.tsx            # Landing page

/components
  /navigation
    sidebar.tsx       # Left sidebar
    header.tsx        # Page headers
    context-panel.tsx # Right context panel
  /messages
    message-bubble.tsx    # Individual message
    message-input.tsx     # Message textarea
  /ui                 # shadcn base components (customized)

/lib
  animations.ts       # Framer Motion variants
  utils.ts            # Utility functions (cn)
```

## Development

### Running Locally
```bash
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server
```

### Customization
- **Colors**: Edit CSS variables in `app/globals.css` (@theme block)
- **Typography**: Update font sizes in `tailwind.config.ts`
- **Spacing**: Modify scale in `tailwind.config.ts` (extends theme)
- **Animations**: Add variants to `lib/animations.ts`

## Future Enhancements

1. **Real Backend Integration**: Replace simulated AI with actual API
2. **Authentication**: User accounts and session management
3. **Knowledge Base**: Persistent storage and search
4. **File Uploads**: Handle attachments and media
5. **Search**: Global conversation search across knowledge base
6. **Export**: Download conversations and insights
7. **Themes**: Light mode variant, custom themes
8. **AI Customization**: Adjustable AI personality and tone
9. **Team Collaboration**: Shared workspaces
10. **Analytics**: Usage insights and productivity metrics

## Design Principles

- **Minimal**: Only essential UI elements
- **Calm**: Soothing colors and smooth interactions
- **Premium**: High-quality typography and spacing
- **Fast**: Responsive interactions without lag
- **Accessible**: Works for everyone, keyboard navigation
- **Consistent**: Unified design language throughout
- **Focused**: Conversation-centric interface

## License

Created with v0.app - Vercel's AI-powered code generation platform.
