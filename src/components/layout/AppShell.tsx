"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  useEffect(() => {
    const fitExactViewport = () => {
      const targetWidth = 1140;
      const screenW = window.screen.width || 0;
      const innerW = window.innerWidth || 0;
      const w =
        screenW > 0 && screenW < targetWidth
          ? screenW
          : innerW > 0 && innerW < targetWidth
            ? innerW
            : 0;

      const meta = document.querySelector('meta[name="viewport"]');
      if (w > 0 && w < targetWidth) {
        const scale = +(w / targetWidth).toFixed(5);
        const content = `width=${targetWidth}, initial-scale=${scale}, minimum-scale=${scale}, maximum-scale=3.0, user-scalable=yes`;
        if (meta) {
          meta.setAttribute("content", content);
        }
      } else if (w >= targetWidth && meta) {
        meta.setAttribute(
          "content",
          `width=${targetWidth}, initial-scale=1, user-scalable=yes`,
        );
      }
    };

    fitExactViewport();
    window.addEventListener("resize", fitExactViewport);
    window.addEventListener("orientationchange", fitExactViewport);
    return () => {
      window.removeEventListener("resize", fitExactViewport);
      window.removeEventListener("orientationchange", fitExactViewport);
    };
  }, []);

  // For landing page (/): boxed 1260px container with natural scrolling
  if (isLandingPage) {
    return (
      <div className="min-h-screen w-full bg-[#f8fafc] text-slate-800 antialiased">
        {children}
      </div>
    );
  }

  // Dashboard shell: 1140px boxed container, Header fixed at top, Left Sidebar fixed, Footer fixed at bottom, Window scroll on far right
  return (
    <div className="desktop-app-container sm:w-[1140px] sm:min-w-[1140px] sm:max-w-[1140px] mx-auto min-h-screen flex flex-col bg-white shadow-[0_0_50px_rgba(0,0,0,0.06)] border-x border-slate-200/90 relative">
      <Header />
      <div className="desktop-content-row flex-1 flex items-start">
        <Sidebar />
        <main className="desktop-main-scroll flex-1 min-w-0 px-2 py-2.5 lg:p-4 pb-14 bg-[#F1F5F9]">
          <div className="w-full">{children}</div>
        </main>
      </div>
      <Footer />
    </div>
  );
};
