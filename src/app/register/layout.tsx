import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create a free account — Analycos",
  description:
    "Sign up for Analycos and start tracking visitors, pageviews and traffic sources on your website in minutes.",
  alternates: { canonical: "/register" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
