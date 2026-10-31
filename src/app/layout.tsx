import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { WebsiteProvider } from "@/context/WebsiteContext";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { TrackingModalWrapper } from "@/components/analytics/TrackingModalWrapper";

export const metadata: Metadata = {
  title: "Wide-Histat — Real-Time Website Analytics Platform",
  description:
    "Privacy-friendly, high-performance web analytics platform with real-time visitor tracking and interactive reports.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#eef2f7] text-slate-800 antialiased selection:bg-[#1d5b9f]/20 selection:text-[#1d5b9f]">
        <AuthProvider>
          <WebsiteProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <div className="flex-1 flex">
                <Sidebar />
                <main className="flex-1 p-3 lg:p-6 max-w-[1600px] w-full mx-auto overflow-y-auto">
                  {children}
                </main>
              </div>
            </div>
            <TrackingModalWrapper />
          </WebsiteProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
