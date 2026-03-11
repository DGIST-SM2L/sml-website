"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import pubsJson from "@/content/publications.json";
import { getPreviewData } from "@/hooks/usePreviewData";

interface Publication {
  year: number;
  authors: string;
  title: string;
  journal: string;
  volume: string;
  doi: string;
  featured?: boolean;
}

export default function PublicationsPage() {
  const publications = getPreviewData<Publication[]>("publications", pubsJson as Publication[]);
  const [search, setSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const allYears = useMemo(() => {
    const years = Array.from(new Set(publications.map((p) => p.year)));
    return years.sort((a, b) => b - a);
  }, [publications]);

  const filtered = useMemo(() => {
    let result = publications;
    if (selectedYear !== null) {
      result = result.filter((p) => p.year === selectedYear);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.authors.toLowerCase().includes(q) ||
          p.journal.toLowerCase().includes(q) ||
          String(p.year).includes(q)
      );
    }
    return result;
  }, [search, selectedYear]);

  const grouped = useMemo(() => {
    const map = new Map<number, Publication[]>();
    for (const pub of filtered) {
      const list = map.get(pub.year) || [];
      list.push(pub);
      map.set(pub.year, list);
    }
    return Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
  }, [filtered]);

  const totalCount = publications.length;

  return (
    <>
      {/* Hero banner */}
      <section className="border-b border-slate-200 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-6 py-20 text-white dark:border-slate-800">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl text-center"
        >
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Publications
          </h1>
          <p className="mt-4 text-lg text-blue-200">
            {totalCount} publications from our group
          </p>
        </motion.div>
      </section>

      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Year filter buttons */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedYear(null)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              selectedYear === null
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
            }`}
          >
            All
          </button>
          {allYears.map((year) => (
            <button
              key={year}
              onClick={() =>
                setSelectedYear(selectedYear === year ? null : year)
              }
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                selectedYear === year
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
              }`}
            >
              {year}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mb-10">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by title, author, journal, or year..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
            />
          </div>
          {(search || selectedYear !== null) && (
            <p className="mt-2 text-sm text-slate-500">
              Showing {filtered.length} of {totalCount} publications
            </p>
          )}
        </div>

        {/* Publication List */}
        {grouped.length === 0 ? (
          <p className="text-center text-slate-500">No publications found.</p>
        ) : (
          <div className="space-y-12">
            {grouped.map(([year, pubs]) => (
              <div key={year}>
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {year}
                  </h3>
                </div>
                <div className="space-y-4">
                  {pubs.map((pub, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="relative rounded-lg border border-slate-200 bg-white p-5 transition-colors hover:border-blue-200 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-800"
                    >
                      {pub.featured && (
                        <span className="absolute right-4 top-4 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                          Featured
                        </span>
                      )}
                      <a
                        href={pub.doi}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-700 hover:underline dark:text-blue-400"
                      >
                        {pub.title}
                      </a>
                      <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                        {pub.authors}
                      </p>
                      {pub.journal && (
                        <p className="mt-1 text-sm text-slate-500">
                          <span className="italic">{pub.journal}</span>
                          {pub.volume ? `, ${pub.volume}` : ""}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
