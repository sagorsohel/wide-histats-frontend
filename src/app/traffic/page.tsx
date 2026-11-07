"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function TrafficRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  useEffect(() => {
    router.replace(id ? `/traffic-stats/?id=${id}` : "/traffic-stats");
  }, [router, id]);

  return (
    <div className="p-8 text-center text-xs text-slate-400">
      Redirecting to /traffic-stats...
    </div>
  );
}

export default function TrafficPage() {
  return (
    <Suspense fallback={null}>
      <TrafficRedirect />
    </Suspense>
  );
}
