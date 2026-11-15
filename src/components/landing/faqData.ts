export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQS: FaqItem[] = [
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
