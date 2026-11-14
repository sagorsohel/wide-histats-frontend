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
  initialScale: 0.38,
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
                try {
                  var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (window.screen && Math.min(window.screen.width, window.screen.height) < 768);
                  if (isMobile) {
                    document.documentElement.classList.add('is-mobile-device');
                  }
                  var targetW = 1140;
                  var phoneW = Math.min(window.screen.width || targetW, window.screen.height || targetW);
                  if (phoneW > 0 && phoneW < targetW) {
                    var scale = +(phoneW / targetW).toFixed(4);
                    var meta = document.querySelector('meta[name="viewport"]');
                    if (meta) {
                      meta.setAttribute('content', 'width=' + targetW + ', initial-scale=' + scale + ', user-scalable=yes');
                    }
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen text-slate-800 antialiased selection:bg-[#1d5b9f]/20 selection:text-[#1d5b9f]">
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
