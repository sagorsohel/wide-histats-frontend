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
  width: 1140,
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
    <html lang="en" className="h-full scroll-smooth bg-[#f1f4f8]">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function fitExactViewport() {
                  var targetWidth = 1140;
                  var screenW = window.screen.width || 0;
                  var innerW = window.innerWidth || 0;
                  var w = (screenW > 0 && screenW < targetWidth) ? screenW : ((innerW > 0 && innerW < targetWidth) ? innerW : 0);
                  if (w > 0 && w < targetWidth) {
                    var scale = (w / targetWidth).toFixed(5);
                    var content = 'width=' + targetWidth + ', initial-scale=' + scale + ', minimum-scale=' + scale + ', maximum-scale=3.0, user-scalable=yes';
                    var meta = document.querySelector('meta[name="viewport"]');
                    if (meta) {
                      meta.setAttribute('content', content);
                    } else {
                      meta = document.createElement('meta');
                      meta.name = 'viewport';
                      meta.content = content;
                      document.head.appendChild(meta);
                    }
                  }
                }
                fitExactViewport();
                window.addEventListener('resize', fitExactViewport);
                window.addEventListener('orientationchange', fitExactViewport);
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[#f1f4f8] text-slate-800 antialiased selection:bg-[#1d5b9f]/20 selection:text-[#1d5b9f]">
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
