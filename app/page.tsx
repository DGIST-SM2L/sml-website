"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { motion } from "framer-motion";
import publicationsData from "@/content/publications.json";
import research from "@/content/research.json";
import newsData from "@/content/news.json";
import heroData from "@/content/hero.json";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

type NewsItem = {
  id: string;
  date: string;
  title: string;
  content: string;
  category: string;
  image: string | null;
  pinned: boolean;
};

const newsCategoryColors: Record<string, string> = {
  Paper: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  Award: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
  Conference:
    "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  Member:
    "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  General:
    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

const categoryImages = [
  "/images/home/simulation.png",
  "/images/home/computer.png",
  "/images/home/molecules.jpg",
];



function HomeInner() {
  const searchParams = useSearchParams();

  // Admin preview mode: ?bg=encoded&oc=hexNoHash&oo=0.65
  const previewBg = searchParams.get("bg");
  const previewOc = searchParams.get("oc");
  const previewOo = searchParams.get("oo");

  const hero = {
    backgroundImage: previewBg ? decodeURIComponent(previewBg) : (heroData as { backgroundImage: string }).backgroundImage,
    overlayColor: previewOc ? `#${previewOc}` : (heroData as { overlayColor: string }).overlayColor,
    overlayOpacity: previewOo ? parseFloat(previewOo) : (heroData as { overlayOpacity: number }).overlayOpacity,
  };

  const recentPubs = [...publicationsData.publications]
    .sort((a, b) => b.year - a.year)
    .slice(0, 3);
  const recentNews = (newsData as NewsItem[])
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.date.localeCompare(a.date);
    })
    .slice(0, 4);

  return (
    <>
      {/* Hero with group photo */}
      <section className="relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0">
          <img
            src={hero.backgroundImage}
            alt="SML Lab Hero Background"
            className="h-full w-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: hero.overlayColor,
              opacity: hero.overlayOpacity,
            }}
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative mx-auto max-w-5xl px-6 py-32 sm:py-44"
        >
          <p className="text-3xl font-bold uppercase tracking-widest text-blue-400 sm:text-4xl">
            DGIST
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
            <span className="text-blue-400">S</span>imulation and <span className="text-blue-400">M</span>achine Learning
            <br />
            for <span className="text-blue-400">S</span>oft <span className="text-blue-400">M</span>atter <span className="text-blue-400">L</span>ab
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
            Computational Polymer Science &amp; AI — developing mesoscale
            simulation models and machine learning approaches to discover novel
            polymer materials and understand soft matter physics.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/research"
              className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-blue-500"
            >
              Our Research
            </Link>
            <Link
              href="/people"
              className="rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/10"
            >
              Meet the Team
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Research Areas — visual cards with images */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <motion.div {...fadeUp} className="mb-14 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Research Areas
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400">
            Exploring soft matter through simulation, theory, and machine
            learning
          </p>
        </motion.div>
        <div className="grid gap-8 md:grid-cols-3">
          {research.categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
            >
              <Link
                href="/research"
                className="group block h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={categoryImages[i]}
                    alt={cat.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                    {cat.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {cat.description}
                  </p>
                  <p className="mt-4 text-xs font-semibold text-blue-600 dark:text-blue-400">
                    {cat.topics.length} research topics &rarr;
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Latest News — cards with images */}
      {recentNews.length > 0 && (
        <section className="border-y border-slate-200 bg-slate-50 px-6 py-24 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="mx-auto max-w-6xl">
            <motion.div {...fadeUp} className="mb-14 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Latest News
              </h2>
              <p className="mt-3 text-slate-600 dark:text-slate-400">
                Recent updates from our lab
              </p>
            </motion.div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {recentNews.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <Link
                    href="/news"
                    className="group block h-full overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                  >
                    {item.image && (
                      <div className="relative h-40 overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${
                            newsCategoryColors[item.category] ||
                            newsCategoryColors.General
                          }`}
                        >
                          {item.category}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(item.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold leading-snug text-slate-900 dark:text-white line-clamp-3">
                        {item.title}
                      </h3>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                href="/news"
                className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                View all news &rarr;
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Recent Publications */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <motion.div {...fadeUp} className="mb-14 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Recent Publications
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400">
            Latest work from our group
          </p>
        </motion.div>
        <div className="space-y-4">
          {recentPubs.map((pub, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="rounded-lg border border-slate-200 bg-white p-5 transition-colors hover:border-blue-200 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-800"
            >
              <a
                href={pub.doi}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-700 hover:underline dark:text-blue-400"
              >
                {pub.title}
              </a>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {pub.authors}
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">
                <span className="italic">{pub.journal}</span>, {pub.volume} (
                {pub.year})
              </p>
            </motion.div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/publications"
            className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            View all publications &rarr;
          </Link>
        </div>
      </section>

      {/* Join Us CTA */}
      <section className="px-6 pb-24">
        <motion.div
          {...fadeUp}
          className="mx-auto max-w-4xl overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-xl"
        >
          <div className="px-10 py-16 text-center sm:px-16">
            <h2 className="text-3xl font-bold text-white">Join Our Lab</h2>
            <p className="mx-auto mt-4 max-w-xl text-blue-100">
              We are always looking for motivated students and researchers
              interested in computational polymer science, soft matter physics,
              and machine learning for materials design.
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-block rounded-lg bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow transition-colors hover:bg-blue-50"
            >
              Get in Touch
            </Link>
          </div>
        </motion.div>
      </section>
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeInner />
    </Suspense>
  );
}
