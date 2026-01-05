import { Inter } from "next/font/google";
import "./globals.css";
// 👇 1. 引入 Toaster 组件
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Prompt Box",
  description: "Efficient Prompt Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        {children}
        {/* 👇 2. 放置组件，position="top-center" 表示在顶部居中显示 */}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}