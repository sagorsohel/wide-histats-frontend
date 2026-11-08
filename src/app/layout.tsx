import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { StoreProvider } from "@/store/StoreProvider";
import { AuthProvider } from "@/context/AuthContext";
import { WebsiteProvider } from "@/context/WebsiteContext";
import { AppShell } from "@/components/layout/AppShell";
import { TrackingModalWrapper } from "@/components/analytics/TrackingModalWrapper";
import { UrlWebsiteSync } from "@/components/common/UrlWebsiteSync";

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
    <html lang="en" className="h-full scroll-smooth">
      <body className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased selection:bg-[#1d5b9f]/20 selection:text-[#1d5b9f]">
        <StoreProvider>
          <AuthProvider>
            <WebsiteProvider>
              <Suspense fallback={null}>
                <UrlWebsiteSync />
              </Suspense>
              <AppShell>{children}</AppShell>
              <TrackingModalWrapper />
            </WebsiteProvider>
          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
