"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { useWebsite } from "@/context/WebsiteContext";
import { isPagePublic } from "@/lib/utils";

// Routes reachable without signing in. Everything else in the dashboard shell is protected.
const PUBLIC_PATHS = ["/login", "/register"];

const isPublicPath = (pathname: string) =>
  PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

export const AppShell: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const { user, initialized } = useAuth();
  const { selectedWebsite } = useWebsite();
  const isLandingPage = pathname === "/";
  const isAlwaysPublic = isPublicPath(pathname);
  const isAllowedPublicly = !user && isPagePublic(pathname, selectedWebsite);
  const isProtected = !isLandingPage && !isAlwaysPublic && !isAllowedPublicly;

  useEffect(() => {
    if (isProtected && initialized && !user) {
      // 1. Administrative routes (settings, websites, control-panel, profile) are NEVER public.
      // Redirect to login immediately without waiting.
      const cleanPath =
        pathname.replace(/^\/+|\/+$/g, "").split("/")[0] || "";
      const isManagement = [
        "settings",
        "websites",
        "control-panel",
        "profile",
      ].includes(cleanPath);

      if (isManagement) {
        const next =
          typeof window !== "undefined"
            ? window.location.pathname + window.location.search
            : pathname;
        router.replace(`/login?next=${encodeURIComponent(next)}`);
        return;
      }

      // 2. For public analytics pages with ?id=, wait up to 1.5s for website context to settle
      const hasIdParam =
        typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).has("id");

      if (hasIdParam && !selectedWebsite) {
        const timer = setTimeout(() => {
          const next =
            typeof window !== "undefined"
              ? window.location.pathname + window.location.search
              : pathname;
          router.replace(`/login?next=${encodeURIComponent(next)}`);
        }, 1500);
        return () => clearTimeout(timer);
      }

      const next =
        typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : pathname;
      router.replace(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [isProtected, initialized, user, router, pathname, selectedWebsite]);

  // For landing page (/): full-width layout with natural scrolling
  if (isLandingPage) {
    return (
      <div className="min-h-screen w-full bg-[#f8fafc] text-slate-800 antialiased">
        {children}
      </div>
    );
  }

  // Protected page while the session or public permission is unknown or missing
  const blocked =
    isProtected && (!initialized || (!user && !isAllowedPublicly));

  // Dashboard shell: 1140px boxed container, two-tier header, footer at bottom
  return (
    <div className="desktop-app-container w-[1140px] min-w-[1140px] max-w-[1140px] mx-auto h-auto min-h-0 flex flex-col bg-white border-0 border-none shadow-[0_10px_31px_rgb(1,45,121)] relative rounded-b-xl overflow-hidden">
      <Header />
      <div className="desktop-content-row flex-none border-none flex flex-col items-stretch w-full bg-[#F1F5F9]">
        <main className="desktop-main-scroll flex-none min-w-0 border-0 border-black px-2 py-2.5 lg:p-4 pb-4 bg-[linear-gradient(180deg,#1058d11f,#1058d1)]">
          {blocked ? (
            <div
              className="w-full min-h-[50vh] flex items-center justify-center text-xs font-semibold text-white/90"
              role="status"
              aria-live="polite"
            >
              <span className="w-4 h-4 mr-2 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              {initialized ? "Redirecting to sign in…" : "Checking your session…"}
            </div>
          ) : (
            <div className="w-full">{children}</div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};
