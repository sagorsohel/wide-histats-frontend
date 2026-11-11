import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { StoreProvider } from "@/store/StoreProvider";
import { AuthProvider } from "@/context/AuthContext";
import { WebsiteProvider } from "@/context/WebsiteContext";
import { AppShell } from "@/components/layout/AppShell";
import { TrackingModalWrapper } from "@/components/analytics/TrackingModalWrapper";
import { UrlWebsiteSync } from "@/components/common/UrlWebsiteSync";

export const viewport: Viewport = {
  width: 1260,
  initialScale: 0.3,
  minimumScale: 0.1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: "Analycos — Free Web Stats, Hit Counter & Visitor Tracking",
  description:
    "Monitor website visitors, pageviews, and traffic sources with Analycos. Free web statistics, hit counters, and visitor tracking tools to understand your audience.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "Analycos — Free Web Stats, Hit Counter & Visitor Tracking",
    description:
      "Monitor website visitors, pageviews, and traffic sources with Analycos. Free web statistics, hit counters, and visitor tracking tools to understand your audience.",
    siteName: "Analycos",
    type: "website",
    images: [
      {
        url: "/favicon.svg",
        width: 100,
        height: 100,
        alt: "Analycos Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Analycos — Free Web Stats, Hit Counter & Visitor Tracking",
    description:
      "Monitor website visitors, pageviews, and traffic sources with Analycos. Free web statistics, hit counters, and visitor tracking tools to understand your audience.",
    images: ["/favicon.svg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function updateViewport() {
                  var w = window.screen.width;
                  if (w && w < 1260) {
                    var scale = (w / 1260).toFixed(4);
                    var mv = document.querySelector('meta[name="viewport"]');
                    if (mv) {
                      mv.setAttribute('content', 'width=1260, initial-scale=' + scale + ', minimum-scale=0.1, maximum-scale=5.0, user-scalable=yes');
                    }
                  }
                }
                updateViewport();
                window.addEventListener('orientationchange', function() {
                  setTimeout(updateViewport, 150);
                });
                window.addEventListener('resize', updateViewport);
              })();
            `,
          }}
        />
      </head>
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
