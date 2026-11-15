import React from "react";
import Link from "next/link";

export interface LegalSection {
  id: string;
  title: string;
  body: React.ReactNode;
}

interface LegalPageProps {
  title: string;
  subtitle: string;
  updated: string;
  sections: LegalSection[];
}

/** Shared white-card layout for static info pages (Privacy, Terms, Docs). */
export const LegalPage: React.FC<LegalPageProps> = ({
  title,
  subtitle,
  updated,
  sections,
}) => (
  <div className="w-full bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
    <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
      <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
      <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      <p className="mt-1 text-[11px] text-slate-400">Last updated: {updated}</p>
    </div>

    <div className="flex gap-6 px-6 py-5">
      <nav
        aria-label="On this page"
        className="w-52 shrink-0 text-xs self-start sticky top-4"
      >
        <p className="mb-2 font-bold uppercase tracking-wide text-[10px] text-slate-400">
          On this page
        </p>
        <ul className="space-y-1.5">
          {sections.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="text-slate-600 hover:text-[#1455bb]">
                {s.title}
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-5 pt-4 border-t border-slate-200 space-y-1.5">
          <Link href="/privacy" className="block text-slate-600 hover:text-[#1455bb]">Privacy Policy</Link>
          <Link href="/terms" className="block text-slate-600 hover:text-[#1455bb]">Terms of Service</Link>
          <Link href="/documentation" className="block text-slate-600 hover:text-[#1455bb]">Documentation</Link>
        </div>
      </nav>

      <div className="min-w-0 flex-1 space-y-6 text-[13px] leading-relaxed text-slate-700">
        {sections.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-4">
            <h2 className="text-sm font-bold text-slate-900 mb-1.5">{s.title}</h2>
            <div className="space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:bg-slate-100 [&_code]:text-[12px] [&_a]:text-[#1455bb] [&_a:hover]:underline">
              {s.body}
            </div>
          </section>
        ))}
      </div>
    </div>
  </div>
);
