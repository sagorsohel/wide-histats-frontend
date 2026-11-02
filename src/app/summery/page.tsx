"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import SummaryPage from "../summary/page";

export default function SummeryPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/summary");
  }, [router]);

  return <SummaryPage />;
}
