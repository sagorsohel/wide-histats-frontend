"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SummeryPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/summary");
  }, [router]);

  return (
    <div className="p-8 text-center text-xs text-slate-400">
      Redirecting to /summary...
    </div>
  );
}
