import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CoachAI',
  description: 'Club & coaching intelligence',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true} className="min-h-dvh bg-gray-50 text-gray-900 antialiased font-sans">
        <div className="mx-auto max-w-5xl px-4 py-6">
          {children}
        </div>
      </body>
    </html>
  )
}
