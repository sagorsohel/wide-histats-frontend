"use client";

import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "How do I install Analycos?",
    answer:
      "Simply create an account, register your website domain, and copy the small snippet code provided. Paste it into your website header or right before the closing </body> tag. Insights start recording instantly without cookies or bulky libraries.",
  },
  {
    question: "Can I track multiple websites?",
    answer:
      "Yes, absolutely! You can manage multiple domains and websites simultaneously from your dashboard, with independent analytics, tracking IDs, and real-time visitor counts.",
  },
  {
    question: "Can I customize my hit counter?",
    answer:
      "Yes! You can choose between Minimal, Classic, or Outline styles and adjust styles to seamlessly match your site's aesthetic.",
  },
];

export const LandingFaq: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="w-full max-w-[1260px] mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-100">
      <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight mb-8">
        FAQ
      </h2>

      <div className="divide-y divide-slate-100">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="py-4">
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full flex items-center justify-between text-left py-2 gap-4 cursor-pointer group"
              >
                <span className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                  {faq.question}
                </span>
                <span className="shrink-0 p-1 rounded-full text-slate-400 group-hover:text-slate-700 transition-colors">
                  {isOpen ? (
                    <Minus className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </span>
              </button>

              {isOpen && (
                <div className="pt-2 pb-3 text-xs sm:text-sm text-slate-500 leading-relaxed animate-fade-in pr-6">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

