import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata = { title: 'Apartment 803', description: 'AI Voice Agent Portal' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background:'#F7F5F0', margin:0, fontFamily:'Inter, system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
