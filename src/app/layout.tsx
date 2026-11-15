import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { StoreProvider } from "@/store/StoreProvider";
import { AuthProvider } from "@/context/AuthContext";
import { WebsiteProvider } from "@/context/WebsiteContext";
import { AppShell } from "@/components/layout/AppShell";
import { TrackingModalWrapper } from "@/components/analytics/TrackingModalWrapper";
import { UrlWebsiteSync } from "@/components/common/UrlWebsiteSync";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site";

export const viewport: Viewport = {
  width: 1140,
  initialScale: 0.38,
  userScalable: true,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s",
  },
  applicationName: SITE_NAME,
  description: SITE_DESCRIPTION,
  keywords: [
    "web analytics",
    "website statistics",
    "hit counter",
    "visitor tracking",
    "real-time visitors",
    "traffic sources",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    url: SITE_URL,
    type: "website",
    locale: "en_US",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: SITE_TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/og-image.jpg"],
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
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: SITE_NAME,
              alternateName: ["analycos.com", "Analycos Analytics"],
              url: SITE_URL + "/",
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: SITE_NAME,
              url: SITE_URL + "/",
              logo: SITE_URL + "/favicon.svg",
            }),
          }}
        />
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
