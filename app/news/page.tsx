"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import newsData from "@/content/news.json";

type NewsItem = {
  id: string;
  date: string;
  title: string;
  content: string;
  category: string;
  image: string | null;
  pinned: boolean;
};

const CATEGORIES = ["All", "Paper", "Award", "Conference", "Member", "General"];

const categoryColors: Record<string, string> = {
  Paper: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  Award: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
  Conference: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  Member: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  General: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

function renderMarkdown(text: string) {
  let html = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline dark:text-blue-400">$1</a>'
    );
  const lines = html.split("\n");
  let inList = false;
  const processed: string[] = [];
  for (const line of lines) {
    if (line.trimStart().startsWith("- ")) {
      if (!inList) { processed.push('<ul class="list-disc pl-5 mt-1">'); inList = true; }
      processed.push(`<li>${line.trimStart().slice(2)}</li>`);
    } else {
      if (inList) { processed.push("</ul>"); inList = false; }
      processed.push(line);
    }
  }
  if (inList) processed.push("</ul>");
  return processed.join("\n");
}

// Detects image aspect ratio to decide layout
function NewsImage({ src, title }: { src: string; title: string }) {
  const [layout, setLayout] = useState<"side" | "top" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const containerWidth = containerRef.current?.offsetWidth ?? 600;
    // Wide landscape images (natural width > 60% of container OR aspect ratio > 1.6) → top
    const isWide =
      img.naturalWidth / img.naturalHeight > 1.6 ||
      img.naturalWidth > containerWidth * 0.55;
    setLayout(isWide ? "top" : "side");
  };

  return (
    <div ref={containerRef} className={layout === "side" ? "flex gap-4 items-start" : "flex flex-col gap-3"}>
      <img
        src={src}
        alt={title}
        onLoad={handleLoad}
        className={`rounded-lg object-cover ${
          layout === "side"
            ? "w-48 shrink-0 max-h-48"
            : layout === "top"
            ? "w-full max-h-64"
            : "hidden" // hide until layout is known
        }`}
      />
      {/* Placeholder div to hold text slot in side mode — actual text is rendered outside */}
    </div>
  );
}

// Full expanded content with smart image layout
function ExpandedContent({ item }: { item: NewsItem }) {
  const [layout, setLayout] = useState<"side" | "top" | "noimg">(
    item.image ? "noimg" : "noimg"
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const containerWidth = containerRef.current?.offsetWidth ?? 600;
    const isWide =
      img.naturalWidth / img.naturalHeight > 1.6 ||
      img.naturalWidth > containerWidth * 0.55;
    setLayout(isWide ? "top" : "side");
  };

  const text = (
    <div
      className="prose prose-sm max-w-none text-slate-700 dark:text-slate-300"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(item.content) }}
    />
  );

  return (
    <div ref={containerRef} className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
      {!item.image && text}

      {item.image && layout === "noimg" && (
        <>
          {/* Hidden preload img to detect dimensions */}
          <img
            src={item.image}
            alt=""
            onLoad={handleLoad}
            className="hidden"
          />
          {text}
        </>
      )}

      {item.image && layout === "top" && (
        <>
          <img
            src={item.image}
            alt={item.title}
            className="mb-4 w-full max-h-64 rounded-lg object-cover"
          />
          {text}
        </>
      )}

      {item.image && layout === "side" && (
        <div className="flex gap-4 items-start">
          <img
            src={item.image}
            alt={item.title}
            className="w-44 shrink-0 rounded-lg object-cover max-h-52"
          />
          <div className="flex-1 min-w-0">{text}</div>
        </div>
      )}
    </div>
  );
}

export default function NewsPage() {
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState<string | null>(null);

  const allNews = (newsData as NewsItem[]).filter(
    (n) => filter === "All" || n.category === filter
  );

  // Pinned first, then by date desc
  const sorted = [...allNews].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.date.localeCompare(a.date);
  });

  // Separate pinned vs normal for year grouping
  const pinned = sorted.filter((n) => n.pinned);
  const normal = sorted.filter((n) => !n.pinned);

  // Group normal items by year
  const byYear: Record<number, NewsItem[]> = {};
  for (const item of normal) {
    const year = new Date(item.date).getFullYear();
    if (!byYear[year]) byYear[year] = [];
    byYear[year].push(item);
  }
  const years = Object.keys(byYear)
    .map(Number)
    .sort((a, b) => b - a);

  const NewsCard = ({ item, i }: { item: NewsItem; i: number }) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: i * 0.04 }}
    >
      <button
        onClick={() => setExpanded(expanded === item.id ? null : item.id)}
        className="w-full text-left rounded-lg border border-slate-200 bg-white p-5 transition-all hover:border-blue-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {item.pinned && (
                <span className="inline-block rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
                  Pinned
                </span>
              )}
              <span className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${categoryColors[item.category] || categoryColors.General}`}>
                {item.category}
              </span>
              <span className="text-xs text-slate-400">
                {new Date(item.date).toLocaleDateString("en-US", {
                  year: "numeric", month: "long", day: "numeric",
                })}
              </span>
            </div>
            <h3 className="mt-2 font-semibold text-slate-900 dark:text-white">
              {item.title}
            </h3>
            {expanded !== item.id && (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                {item.content}
              </p>
            )}
          </div>
          <svg
            className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${expanded === item.id ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {expanded === item.id && <ExpandedContent item={item} />}
      </button>
    </motion.div>
  );

  return (
    <>
      <section className="border-b border-slate-200 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-6 py-20 text-white dark:border-slate-800">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl text-center"
        >
          <h1 className="text-4xl font-extrabold tracking-tight">News</h1>
          <p className="mt-3 text-blue-300">Latest updates from Soft Matter Lab</p>
        </motion.div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12">
        {/* Category filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                filter === cat
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {sorted.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400">No news posts yet.</p>
        ) : (
          <div className="space-y-8">
            {/* Pinned items (no year header) */}
            {pinned.length > 0 && (
              <div className="space-y-4">
                {pinned.map((item, i) => (
                  <NewsCard key={item.id} item={item} i={i} />
                ))}
              </div>
            )}

            {/* Year groups */}
            {years.map((year) => (
              <div key={year}>
                <div className="mb-4 flex items-center gap-3">
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">{year}</h2>
                  <div className="flex-1 border-t border-slate-200 dark:border-slate-700" />
                </div>
                <div className="space-y-4">
                  {byYear[year].map((item, i) => (
                    <NewsCard key={item.id} item={item} i={i} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
