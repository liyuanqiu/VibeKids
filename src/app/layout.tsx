import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VibeKid - Create with AI",
  description: "Turn your ideas into playable creations by chatting with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
