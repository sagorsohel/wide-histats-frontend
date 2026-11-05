"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Activity,
  Globe2,
  Compass,
  FileText,
  Smartphone,
  Globe,
  Settings,
  Shield,
  Layers,
  Search,
  Sliders,
  TrendingUp,
} from "lucide-react";

interface NavGroup {
  title: string;
  items: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Traffic",
    items: [
      { href: "/summary", label: "Summary", icon: BarChart3 },
      { href: "/traffic-stats", label: "Traffic stats", icon: TrendingUp },
      { href: "/realtime", label: "Users online", icon: Activity, badge: "Live" },
    ],
  },
  {
    title: "Traffic Sources",
    items: [
      { href: "/sources", label: "Referring Sites", icon: Compass },
    ],
  },
  {
    title: "Visitors",
    items: [
      { href: "/devices", label: "browsers / os / lang", icon: Smartphone },
      { href: "/geography", label: "Geolocation", icon: Globe2 },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/pages", label: "Traffic by Url", icon: FileText },
    ],
  },
  {
    title: "Account & Settings",
    items: [
      { href: "/control-panel", label: "Control panel", icon: Sliders },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hide sidebar on login pages, root, and control panel
  if (
    !mounted ||
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/control-panel" ||
    pathname === "/websites"
  ) {
    return null;
  }

  return (
    <aside className="hidden md:flex md:w-60 border-r border-slate-200 bg-[#f8fafc] flex-col shrink-0 h-full overflow-y-auto p-2.5">
      <nav className="space-y-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700 px-2 py-1 flex items-center gap-1.5 border-b border-slate-200 mb-1 pb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1d5b9f]"></span>
              {group.title}
            </div>

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href === "/summary" && pathname === "/summery") ||
                  (item.href === "/control-panel" && pathname === "/websites");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold shadow-md shadow-blue-500/25"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? "text-white" : "text-slate-500"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                          isActive
                            ? "bg-white/20 text-white border border-white/40"
                            : "bg-emerald-100 text-emerald-700 border border-emerald-300 animate-pulse"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Mini counter promo banner at bottom matching screenshot */}
      <div className="mt-auto pt-4 space-y-3">
        <div className="p-3.5 rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50/70 to-white text-center shadow-xs space-y-2">
          <div className="w-10 h-10 mx-auto rounded-xl bg-blue-100/50 flex items-center justify-center text-xl">
            🚀
          </div>
          <div>
            <div className="font-extrabold text-slate-900 text-xs">
              Wide-Histat Counter
            </div>
            <p className="text-slate-500 text-[10px] leading-relaxed mt-0.5">
              Real-time visitor presence &amp; intelligent traffic analysis.
            </p>
          </div>
          <Link
            href="/websites"
            className="w-full inline-flex items-center justify-center gap-1 py-1.5 px-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shadow-sm transition-all"
          >
            <span>Get tracker code</span>
            <span className="text-xs">&rarr;</span>
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center text-[10px] text-slate-400 space-y-0.5 pb-2">
          <div>&copy; 2026 Wide-Histat</div>
          <div>Made with ❤️ in Bangladesh</div>
        </div>
      </div>
    </aside>
  );
};
