"use client";

import React from "react";
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

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Traffic",
    items: [
      { href: "/summary", label: "Summary", icon: BarChart3 },
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
      { href: "/websites", label: "Websites", icon: Globe },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  // Hide sidebar on login pages
  if (pathname === "/" || pathname === "/login") {
    return null;
  }

  return (
    <aside className="w-60 border-r border-slate-200 bg-[#f8fafc] flex flex-col shrink-0 h-full overflow-y-auto p-2.5">
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
                  (item.href === "/summary" && pathname === "/summery");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                      isActive
                        ? "bg-[#e5eff9] text-[#1c5396] font-bold border-l-3 border-[#1c5396] shadow-2xs"
                        : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon
                        className={`w-3.5 h-3.5 ${
                          isActive ? "text-[#1c5396]" : "text-slate-500"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-300 animate-pulse">
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

      {/* Mini histats counter promo banner at bottom matching screenshot */}
      <div className="mt-auto p-3 rounded-lg border border-slate-200 bg-white text-xs shadow-2xs">
        <div className="font-bold text-slate-800 text-[11px] flex items-center gap-1 mb-1">
          <span className="text-[#1d5b9f]">Wide-Histat</span> Counter
        </div>
        <p className="text-slate-500 text-[10px] leading-tight mb-2">
          High-precision real-time visitor presence & telemetry tracking.
        </p>
        <Link
          href="/websites"
          className="text-[#1d5b9f] hover:underline font-semibold text-[10px] flex items-center gap-1"
        >
          Get Tracker Code &rarr;
        </Link>
      </div>
    </aside>
  );
};
