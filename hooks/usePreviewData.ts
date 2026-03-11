"use client";

/**
 * Admin live preview hook.
 * When ?preview=1 is in the URL, reads data from sessionStorage
 * (set by the admin panel) instead of the bundled static JSON.
 */
export function getPreviewData<T>(key: string, defaultData: T): T {
  if (typeof window === "undefined") return defaultData;
  if (!new URLSearchParams(window.location.search).has("preview")) return defaultData;
  try {
    const stored = sessionStorage.getItem(`preview_${key}`);
    if (stored) return JSON.parse(stored) as T;
  } catch {
    // ignore
  }
  return defaultData;
}
