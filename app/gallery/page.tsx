"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import galleryData from "@/content/gallery.json";

type GalleryItem = {
  id: string;
  src: string;
  caption: string;
  album: string;
  date: string;
};

const ALBUMS = ["All", "Lab Life", "Conference", "Group Photo", "Research", "Event"];

export default function GalleryPage() {
  const [filter, setFilter] = useState("All");
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);

  const photos = (galleryData as GalleryItem[])
    .filter((p) => filter === "All" || p.album === filter)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <section className="border-b border-slate-200 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-6 py-20 text-white dark:border-slate-800">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl text-center"
        >
          <h1 className="text-4xl font-extrabold tracking-tight">Gallery</h1>
          <p className="mt-3 text-blue-300">
            Photos from our lab and events
          </p>
        </motion.div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        {/* Album filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          {ALBUMS.map((album) => (
            <button
              key={album}
              onClick={() => setFilter(album)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                filter === album
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
              }`}
            >
              {album}
            </button>
          ))}
        </div>

        {/* Photo grid */}
        {photos.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400">
            No photos yet.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo, i) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="group cursor-pointer overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                onClick={() => setLightbox(photo)}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={photo.src}
                    alt={photo.caption}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {photo.caption}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      {photo.album}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(photo.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Lightbox modal */}
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
              className="relative max-h-[90vh] max-w-[90vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={lightbox.src}
                alt={lightbox.caption}
                className="max-h-[80vh] rounded-lg object-contain"
              />
              <div className="mt-3 text-center">
                <p className="text-sm font-medium text-white">
                  {lightbox.caption}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {lightbox.album} &middot;{" "}
                  {new Date(lightbox.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                  })}
                </p>
              </div>
              <button
                onClick={() => setLightbox(null)}
                className="absolute -right-2 -top-2 rounded-full bg-white/10 p-2 text-white backdrop-blur transition-colors hover:bg-white/20"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
