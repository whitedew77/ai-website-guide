import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL = "https://whitedew77.github.io/ai-website-guide/";
const SITE_NAME = "AI 建站向导 / AI Website Roadmap Builder";
const SITE_TITLE = "AI 建站向导：6 问生成网站规划、开发与部署路线";
const SITE_DESCRIPTION =
  "中英双语、本地优先的 AI 建站路线生成器。Answer six questions to plan, build, test, and deploy a website through eight evidence-gated stages.";
const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  alternateName: "AI Website Roadmap Builder",
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  applicationCategory: "EducationalApplication",
  operatingSystem: "Any device with a modern web browser",
  isAccessibleForFree: true,
  inLanguage: ["zh-CN", "en"],
  featureList: [
    "六问生成 AI 建站路线",
    "八阶段证据 Gate",
    "提示词生成器",
    "本地浏览器保存与 JSON 导入导出",
    "PWA 与单文件离线版",
    "Complete Simplified Chinese and English interface",
    "Six-question planning wizard and eight evidence-gated stages",
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  manifest: "./manifest.webmanifest",
  applicationName: SITE_NAME,
  alternates: {
    canonical: SITE_URL,
    languages: {
      "zh-CN": `${SITE_URL}?lang=zh`,
      en: `${SITE_URL}?lang=en`,
    },
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "zh_CN",
    alternateLocale: ["en_US"],
  },
  twitter: {
    card: "summary",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA).replace(/</g, "\\u003c") }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
