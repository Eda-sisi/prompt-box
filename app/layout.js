import './globals.css' 

export const metadata = {
  title: '提示词管理系统',
  description: 'Prompt Manager System',
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}