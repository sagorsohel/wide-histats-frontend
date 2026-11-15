import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Real-time Visitors — Analycos",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
