import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { LanguageProvider } from "@/lib/i18n";
import { StudioProvider } from "@/components/StudioProvider";

export const metadata: Metadata = {
  title: "CardCraft | Apple Wallet 卡面工坊与创意社区",
  description: "探索、自制与AI生成专属 Apple Wallet 卡面。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex flex-col text-zinc-100 overflow-x-hidden selection:bg-white/30 selection:text-white relative">
        {/* 背景流动光斑系统 (Ambient Glow) */}
        <div className="fixed inset-0 -z-10 bg-[#08080a] overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-indigo-600/15 blur-[140px]" />
          <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[160px]" />
          <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[150px]" />
        </div>

        <LanguageProvider>
          <StudioProvider>
          {/* 占据顶部空间的容器，让 Navbar 悬浮 */}
          <div className="pt-6 px-4">
            <Navbar />
          </div>
          <main className="flex-1 w-full mx-auto pb-24 pt-4">
            {children}
                    </main>
          </StudioProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
