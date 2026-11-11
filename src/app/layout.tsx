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
                function autoZoomDesktop() {
                  try {
                    var targetWidth = 1260;
                    var screenW = window.screen && window.screen.width ? window.screen.width : window.innerWidth;
                    if (screenW > 0 && screenW < targetWidth) {
                      var scale = screenW / targetWidth;
                      var meta = document.querySelector('meta[name="viewport"]');
                      if (!meta) {
                        meta = document.createElement('meta');
                        meta.name = 'viewport';
                        document.head.appendChild(meta);
                      }
                      meta.setAttribute('content', 'width=' + targetWidth + ', initial-scale=' + scale.toFixed(4) + ', minimum-scale=' + (scale * 0.4).toFixed(4) + ', maximum-scale=5.0, user-scalable=yes');
                    }
                  } catch (e) {}
                }
                autoZoomDesktop();
                window.addEventListener('resize', autoZoomDesktop);
                window.addEventListener('orientationchange', function() {
                  setTimeout(autoZoomDesktop, 150);
                });
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
