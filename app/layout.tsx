import './globals.css';

export const metadata = {
  title: '无限侦探 - Infinite Detective',
  description: '一款由 LLM 实时驱动的赛博朋克+黑色电影风格文字冒险游戏',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
