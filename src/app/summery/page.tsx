"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function SummeryRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  useEffect(() => {
    router.replace(id ? `/summary/?id=${id}` : "/summary");
  }, [router, id]);

  return (
    <div className="p-8 text-center text-xs text-slate-400">
      Redirecting to /summary...
    </div>
  );
}

export default function SummeryPageRedirect() {
  return (
    <Suspense fallback={null}>
      <SummeryRedirect />
    </Suspense>
  );
}
