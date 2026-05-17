"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function sendVisitorEvent(path: string) {
  const payload = JSON.stringify({
    path,
    referrer: document.referrer || null,
    screen: `${window.screen.width}x${window.screen.height}`,
    language: navigator.language || null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
  });

  if (navigator.sendBeacon) {
    const blob = new Blob([payload], { type: "application/json" });
    if (navigator.sendBeacon("/api/visitor-log", blob)) return;
  }

  void fetch("/api/visitor-log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  });
}

export default function VisitorAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    sendVisitorEvent(query ? `${pathname}?${query}` : pathname);
  }, [pathname, searchParams]);

  return null;
}
