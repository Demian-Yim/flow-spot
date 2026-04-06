import type { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  viewportFit: 'cover',
  themeColor: '#E8573A',
}

export const metadata: Metadata = {
  title: 'FLOW SPOT — 기업 교육 게임 플랫폼',
  description: '좋은 매너와 팀워크를 게임으로 배우는 기업 교육 플랫폼',
  keywords: ['기업교육', '팀빌딩', '게임', '교육', '매너', '팀워크', 'corporate training'],
  authors: [{ name: 'FLOW SPOT' }],
  openGraph: {
    title: 'FLOW SPOT — 기업 교육 게임 플랫폼',
    description: '기업의 팀 문화를 게임으로 만듭니다',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <div className="min-h-screen flex flex-col">{children}</div>
      </body>
    </html>
  )
}
