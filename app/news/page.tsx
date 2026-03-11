"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import newsData from "@/content/news.json";
import galleryData from "@/content/gallery.json";

type NewsItem = {
  id: string;
  date: string;
  title: string;
  content: string;
  category: string;
  image: string | null;
  pinned: boolean;
};

type GalleryItem = {
  id: string;
  src: string;
  caption: string;
  album: string;
  date: string;
};

// Gallery albums → unified category mapping
const ALBUM_TO_CATEGORY: Record<string, string> = {
  "Lab Life": "Lab Life",
  "Group Photo": "Group Photo",
  "Event": "Event",
  "Conference": "Event",
  "Research": "Lab Life",
};

const CATEGORIES = ["All", "Award", "Conference", "Member", "Lab Life", "Group Photo", "Event"];

const categoryColors: Record<string, string> = {
  Award: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
  Conference: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  Member: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  "Lab Life": "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  "Group Photo": "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
  Event: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
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

// Unified item type
type UnifiedItem = {
  id: string;
  date: string;
  title: string;
  content: string;
  category: string;
  image: string | null;
  pinned: boolean;
  kind: "news" | "photo";
};

function ExpandedContent({ item }: { item: UnifiedItem }) {
  const [layout, setLayout] = useState<"side" | "top" | "noimg">("noimg");

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const isWide = img.naturalWidth / img.naturalHeight > 1.6;
    setLayout(isWide ? "top" : "side");
  };

  const text = item.content ? (
    <div
      className="prose prose-sm max-w-none text-slate-700 dark:text-slate-300"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(item.content) }}
    />
  ) : null;

  return (
    <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
      {!item.image && text}
      {item.image && layout === "noimg" && (
        <>
          <img src={item.image} alt="" onLoad={handleLoad} className="hidden" />
          {text}
        </>
      )}
      {item.image && layout === "top" && (
        <>
          <img src={item.image} alt={item.title} className="mb-4 w-full max-h-72 rounded-lg object-cover" />
          {text}
        </>
      )}
      {item.image && layout === "side" && (
        <div className="flex gap-4 items-start">
          <img src={item.image} alt={item.title} className="w-44 shrink-0 rounded-lg object-cover max-h-52" />
          <div className="flex-1 min-w-0">{text}</div>
        </div>
      )}
    </div>
  );
}

// Photo lightbox card
function PhotoCard({ item, onClick }: { item: UnifiedItem; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={item.image!}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-2">
        <span className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${categoryColors[item.category] || ""}`}>
          {item.category}
        </span>
        <p className="mt-1 text-xs font-medium text-slate-800 dark:text-slate-200 line-clamp-2">{item.title}</p>
        <p className="text-xs text-slate-400">{new Date(item.date).toLocaleDateString("en-US", { year: "numeric", month: "short" })}</p>
      </div>
    </button>
  );
}

export default function NewsGalleryPage() {
  const [catFilter, setCatFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<UnifiedItem | null>(null);

  // Merge news + gallery into unified list
  const newsItems: UnifiedItem[] = (newsData as NewsItem[])
    .filter((n) => !["Paper", "General"].includes(n.category))
    .map((n) => ({ ...n, kind: "news" as const }));

  const galleryItems: UnifiedItem[] = (galleryData as GalleryItem[]).map((g) => ({
    id: g.id,
    date: g.date,
    title: g.caption || "Photo",
    content: "",
    category: ALBUM_TO_CATEGORY[g.album] ?? "Lab Life",
    image: g.src,
    pinned: false,
    kind: "photo" as const,
  }));

  const allItems = [...newsItems, ...galleryItems];

  // Available years
  const allYears = Array.from(
    new Set(allItems.map((n) => new Date(n.date).getFullYear()))
  ).sort((a, b) => b - a);

  const filtered = allItems.filter((n) => {
    const matchCat = catFilter === "All" || n.category === catFilter;
    const matchYear = yearFilter === null || new Date(n.date).getFullYear() === yearFilter;
    return matchCat && matchYear;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.date.localeCompare(a.date);
  });

  // Split: news cards vs photo cards
  const newsCards = sorted.filter((i) => i.kind === "news");
  const photoCards = sorted.filter((i) => i.kind === "photo" || (i.kind === "news" && ["Lab Life", "Group Photo", "Event"].includes(i.category) && i.image));

  // For rendering: news cards as list, photo cards as grid? Or unified list?
  // Decision: photo-category items with images → grid, others → list
  const listItems = sorted.filter(
    (i) => i.kind === "news" && !["Lab Life", "Group Photo", "Event"].includes(i.category)
  );
  const gridItems = sorted.filter(
    (i) => i.kind === "photo" || (["Lab Life", "Group Photo", "Event"].includes(i.category) && i.image)
  );
  // Events without image → also list
  const noImgEvents = sorted.filter(
    (i) => ["Lab Life", "Group Photo", "Event"].includes(i.category) && !i.image
  );

  const allListItems = [...listItems, ...noImgEvents].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <section className="border-b border-slate-200 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-6 py-20 text-white dark:border-slate-800">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-5xl text-center"
        >
          <h1 className="text-4xl font-extrabold tracking-tight">News & Gallery</h1>
          <p className="mt-3 text-blue-300">Latest updates and moments from Soft Matter Lab</p>
        </motion.div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-12">
        {/* Filters */}
        <div className="mb-8 space-y-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setYearFilter(null)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                yearFilter === null
                  ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
              }`}
            >
              All Years
            </button>
            {allYears.map((y) => (
              <button
                key={y}
                onClick={() => setYearFilter(yearFilter === y ? null : y)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  yearFilter === y
                    ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                }`}
              >
                {y}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCatFilter(cat)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  catFilter === cat
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {sorted.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400">No items found.</p>
        ) : (
          <div className="space-y-10">
            {/* Photo grid */}
            {gridItems.length > 0 && (
              <div>
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Photos</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {gridItems.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: i * 0.03 }}
                    >
                      <PhotoCard item={item} onClick={() => setLightbox(item)} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* News list */}
            {allListItems.length > 0 && (
              <div>
                {gridItems.length > 0 && (
                  <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">News</h2>
                )}
                <div className="space-y-4">
                  {allListItems.map((item, i) => (
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
                                <span className="inline-block rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700">Pinned</span>
                              )}
                              <span className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${categoryColors[item.category] || "bg-slate-100 text-slate-600"}`}>
                                {item.category}
                              </span>
                              <span className="text-xs text-slate-400">
                                {new Date(item.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                              </span>
                            </div>
                            <h3 className="mt-2 font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                            {expanded !== item.id && item.content && (
                              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{item.content}</p>
                            )}
                          </div>
                          <svg className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${expanded === item.id ? "rotate-180" : ""}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                        {expanded === item.id && <ExpandedContent item={item} />}
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-w-3xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={lightbox.image!} alt={lightbox.title} className="w-full rounded-xl object-contain max-h-[75vh]" />
              <div className="mt-3 text-center">
                <p className="text-white font-medium">{lightbox.title}</p>
                <p className="text-slate-400 text-sm mt-1">
                  {new Date(lightbox.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
              <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 text-white text-2xl hover:text-slate-300">✕</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
