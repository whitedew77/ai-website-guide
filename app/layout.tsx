import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 建站向导 · Spec 到上线的 SOP",
  description: "面向零基础用户的 AI 网站制作向导：六问建站路线、证据化八阶段 SOP、提示词、技术、术语与 GitHub Skills。",
  manifest: "./manifest.webmanifest",
  applicationName: "AI 建站向导",
  icons: {
    icon: [
      { url: "./icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "./icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "./icon-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f3f6fb",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
