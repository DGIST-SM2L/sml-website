"use client";

import { useState } from "react";
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
  // Basic markdown: **bold**, [text](url), - lists
  let html = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline dark:text-blue-400">$1</a>'
    );

  // Convert lines starting with - to list items
  const lines = html.split("\n");
  let inList = false;
  const processed: string[] = [];
  for (const line of lines) {
    if (line.trimStart().startsWith("- ")) {
      if (!inList) {
        processed.push('<ul class="list-disc pl-5 mt-1">');
        inList = true;
      }
      processed.push(`<li>${line.trimStart().slice(2)}</li>`);
    } else {
      if (inList) {
        processed.push("</ul>");
        inList = false;
      }
      processed.push(line);
    }
  }
  if (inList) processed.push("</ul>");

  return processed.join("\n");
}

export default function NewsPage() {
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState<string | null>(null);

  const news = (newsData as NewsItem[])
    .filter((n) => filter === "All" || n.category === filter)
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.date.localeCompare(a.date);
    });

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
          <p className="mt-3 text-blue-300">
            Latest updates from Soft Matter Lab
          </p>
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

        {/* News list */}
        {news.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400">
            No news posts yet.
          </p>
        ) : (
          <div className="space-y-4">
            {news.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <button
                  onClick={() =>
                    setExpanded(expanded === item.id ? null : item.id)
                  }
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
                        <span
                          className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${
                            categoryColors[item.category] || categoryColors.General
                          }`}
                        >
                          {item.category}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(item.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
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
                      className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${
                        expanded === item.id ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>

                  {expanded === item.id && (
                    <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="mb-4 max-h-64 rounded-lg object-cover"
                        />
                      )}
                      <div
                        className="prose prose-sm max-w-none text-slate-700 dark:text-slate-300"
                        dangerouslySetInnerHTML={{
                          __html: renderMarkdown(item.content),
                        }}
                      />
                    </div>
                  )}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
