"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import researchJson from "@/content/research.json";
import { getPreviewData } from "@/hooks/usePreviewData";

type Topic = {
  title: string;
  description: string;
  image?: string;
};

const categoryStyles = [
  {
    accent: "bg-blue-600",
    light: "bg-blue-50 dark:bg-blue-950/30",
    text: "text-blue-600 dark:text-blue-400",
  },
  {
    accent: "bg-emerald-600",
    light: "bg-emerald-50 dark:bg-emerald-950/30",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  {
    accent: "bg-violet-600",
    light: "bg-violet-50 dark:bg-violet-950/30",
    text: "text-violet-600 dark:text-violet-400",
  },
];

export default function ResearchPage() {
  const research = getPreviewData("research", researchJson);
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
            Research
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-blue-200">
            Our research spans computational polymer science, machine learning
            for materials design, and the physics of self-assembly.
          </p>
        </motion.div>
      </section>

      {/* Quick nav */}
      <div className="sticky top-[73px] z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-6 py-2">
          {research.categories.map((cat, i) => {
            const style = categoryStyles[i] || categoryStyles[0];
            return (
              <a
                key={cat.id}
                href={`#${cat.id}`}
                className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${style.text}`}
              >
                <span>
                  {cat.title.length > 45
                    ? cat.title.slice(0, 43) + "…"
                    : cat.title}
                </span>
              </a>
            );
          })}
        </div>
      </div>

      {/* Categories */}
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="space-y-24">
          {research.categories.map((category, ci) => {
            const style = categoryStyles[ci] || categoryStyles[0];
            return (
              <CategorySection
                key={category.id}
                category={category}
                style={style}
                ci={ci}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}

function CategorySection({
  category,
  style,
  ci,
}: {
  category: (typeof researchJson.categories)[0];
  style: (typeof categoryStyles)[0];
  ci: number;
}) {
  const [openId, setOpenId] = useState<number | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  const topics = category.topics as Topic[];

  // Figure out which row the open item is in (2 cols on sm+)
  // We'll insert the detail panel after that row
  const colCount = 2;

  // Build rows: pairs of indices
  const rows: number[][] = [];
  for (let i = 0; i < topics.length; i += colCount) {
    rows.push(topics.slice(i, i + colCount).map((_, j) => i + j));
  }

  useEffect(() => {
    if (openId !== null && detailRef.current) {
      detailRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [openId]);

  return (
    <motion.section
      id={category.id}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
      className="scroll-mt-32"
    >
      {/* Category header */}
      <div className={`mb-10 rounded-2xl ${style.light} p-8`}>
        <div>
          <span
            className={`mb-4 block h-1 w-10 rounded-full ${style.accent}`}
          />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {category.title}
          </h2>
          <p className="mt-2 max-w-3xl leading-relaxed text-slate-600 dark:text-slate-400">
            {category.description}
          </p>
          <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-500">
            {category.topics.length} research topics
          </p>
        </div>
      </div>

      {/* Topic grid with inline detail panels */}
      <div className="space-y-5">
        {rows.map((row, ri) => {
          const openInThisRow = row.find((idx) => idx === openId);
          const openTopic =
            openInThisRow !== undefined ? topics[openInThisRow] : null;

          return (
            <div key={ri}>
              {/* Row of cards */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {row.map((ti) => {
                  const topic = topics[ti];
                  const isOpen = openId === ti;
                  return (
                    <motion.div
                      key={ti}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: ti * 0.05 }}
                      className="flex"
                    >
                      <button
                        onClick={() => setOpenId(isOpen ? null : ti)}
                        className={`flex min-h-[4.5rem] w-full items-center justify-between gap-3 rounded-xl border p-5 text-left transition-all ${
                          isOpen
                            ? "border-blue-300 bg-blue-50 shadow-md dark:border-blue-700 dark:bg-blue-950/30"
                            : "border-slate-200 bg-white shadow-sm hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                              isOpen
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                            }`}
                          >
                            {ti + 1}
                          </span>
                          <span
                            className={`font-medium leading-snug ${
                              isOpen
                                ? "text-blue-900 dark:text-blue-100"
                                : "text-slate-900 dark:text-white"
                            }`}
                          >
                            {topic.title}
                          </span>
                        </div>
                        <svg
                          className={`h-5 w-5 shrink-0 transition-transform duration-300 ${
                            isOpen
                              ? "rotate-180 text-blue-500"
                              : "text-slate-400"
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
                      </button>
                    </motion.div>
                  );
                })}
              </div>

              {/* Detail panel below the row */}
              <AnimatePresence>
                {openTopic && (
                  <motion.div
                    ref={detailRef}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-5 rounded-xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                      <div className="flex flex-col gap-6 md:flex-row">
                        {openTopic.image && (
                          <div className="shrink-0 overflow-hidden rounded-lg bg-slate-50 p-3 dark:bg-slate-800 md:w-1/2">
                            <img
                              src={openTopic.image}
                              alt={openTopic.title}
                              className="mx-auto max-h-72 w-full object-contain"
                            />
                          </div>
                        )}
                        <div
                          className={openTopic.image ? "md:w-1/2" : "w-full"}
                        >
                          <h3 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
                            {openTopic.title}
                          </h3>
                          {(() => {
                            const sentences = openTopic.description
                              .split(/(?:\. |; )/)
                              .map((s: string) => s.replace(/\.?$/, "").trim())
                              .filter(Boolean);
                            return (
                              <ul className="list-disc ml-4 space-y-1 leading-relaxed text-slate-600 dark:text-slate-400">
                                {sentences.map((s: string, idx: number) => (
                                  <li key={idx}>{s}.</li>
                                ))}
                              </ul>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.section>
  );
}
