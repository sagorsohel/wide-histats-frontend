import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/store/StoreProvider";
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
    <html lang="en" className="h-full">
      <body className="h-full overflow-hidden bg-[#eef2f7] text-slate-800 antialiased selection:bg-[#1d5b9f]/20 selection:text-[#1d5b9f]">
        <StoreProvider>
          <AuthProvider>
            <WebsiteProvider>
              <div className="h-full flex flex-col overflow-hidden">
                <Header />
                <div className="flex-1 flex overflow-hidden">
                  <Sidebar />
                  <main className="flex-1 h-full overflow-y-auto p-3 lg:p-6">
                    <div className="max-w-[1600px] w-full mx-auto">
                      {children}
                    </div>
                  </main>
                </div>
              </div>
              <TrackingModalWrapper />
            </WebsiteProvider>
          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
