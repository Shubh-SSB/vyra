import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Inter } from 'next/font/google'
import './globals.css'
import QueryProvider from '@/providers/query-provider'
import { AuthInitializer } from '@/providers/auth-initializer'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
})

export const metadata: Metadata = {
  title: 'Vyra',
  description: 'AI-first communication platform. Conversations are temporary. Knowledge is permanent.',
  icons: {
    icon: [
      {
        url: '/favicon.jpg',
        type: 'image/jpeg',
      },
    ],
    shortcut: '/favicon.jpg',
    apple: '/favicon.jpg',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: [{ color: '#0A0A0A' }],
  width: 'device-width',
  initialScale: 1,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${geist.variable} antialiased bg-background text-text-primary`}>
        <QueryProvider>
          <AuthInitializer>
            {children}
          </AuthInitializer>
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </QueryProvider>
      </body>
    </html>
  )
}
