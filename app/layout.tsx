import type {Metadata} from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tickster x Sanity',
  description: 'Pustervik events powered by Sanity and Tickster.',
}

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="sv">
      <body>{children}</body>
    </html>
  )
}
