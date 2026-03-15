import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VibeKid - 和 AI 一起创造",
  description: "让孩子通过和 AI 对话，把想法变成可以玩的作品",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
