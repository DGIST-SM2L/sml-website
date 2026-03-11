"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import members from "@/content/members.json";
import SectionHeading from "@/components/SectionHeading";

function Avatar({ name, photo, size = "lg" }: { name: string; photo?: string; size?: "sm" | "lg" }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const colors = [
    "bg-blue-500",
    "bg-emerald-500",
    "bg-violet-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-cyan-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-orange-500",
  ];
  const color = colors[name.length % colors.length];
  const sizeClass = size === "lg" ? "h-32 w-32 text-3xl" : "h-20 w-20 text-lg";

  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        className={`${size === "lg" ? "h-32 w-32" : "h-20 w-20"} rounded-full object-cover shadow-md`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} ${color} flex items-center justify-center rounded-full font-bold text-white shadow-md`}
    >
      {initials}
    </div>
  );
}

export default function PeoplePage() {
  const [alumniOpen, setAlumniOpen] = useState(false);
  const { pi } = members;

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <SectionHeading
        title="People"
        subtitle="Meet our team of researchers and students"
      />

      {/* PI Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-16"
      >
        <h3 className="mb-6 text-xl font-bold text-slate-900 dark:text-white">
          Principal Investigator
        </h3>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start">
            <Avatar name={pi.name} photo={pi.photo} size="lg" />
            <div className="flex-1 text-center sm:text-left">
              <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
                {pi.name}{" "}
                <span className="text-lg font-normal text-slate-500">
                  ({pi.nameKo})
                </span>
              </h4>
              <p className="mt-1 text-blue-600 dark:text-blue-400">{pi.title}</p>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <h5 className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Education
                  </h5>
                  <ul className="space-y-1.5">
                    {pi.education.map((edu, i) => (
                      <li key={i} className="text-sm text-slate-700 dark:text-slate-300">
                        <span className="font-medium">{edu.degree}</span>, {edu.field}
                        <br />
                        <span className="text-slate-500">{edu.institution} ({edu.years})</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Experience
                  </h5>
                  <ul className="space-y-1.5">
                    {pi.experience.map((exp, i) => (
                      <li key={i} className="text-sm text-slate-700 dark:text-slate-300">
                        <span className="font-medium">{exp.role}</span>, {exp.institution}
                        <br />
                        <span className="text-slate-500">{exp.years}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6">
                <h5 className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Awards
                </h5>
                <ul className="space-y-1">
                  {pi.awards.map((award, i) => (
                    <li key={i} className="text-sm text-slate-700 dark:text-slate-300">
                      {award.name}{" "}
                      <span className="text-slate-500">({award.year})</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Current Members */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-16"
      >
        <h3 className="mb-6 text-xl font-bold text-slate-900 dark:text-white">
          Current Members
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.members.map((member, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="flex flex-col items-center rounded-lg border border-slate-200 bg-white p-5 text-center dark:border-slate-800 dark:bg-slate-900"
            >
              <Avatar name={member.name} photo={member.photo} size="sm" />
              <h4 className="mt-3 font-semibold text-slate-900 dark:text-white">
                {member.name}
              </h4>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                {member.position}
              </p>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                {member.research}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {member.education}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Alumni */}
      <section>
        <button
          onClick={() => setAlumniOpen(!alumniOpen)}
          className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white"
        >
          Alumni
          <svg
            className={`h-5 w-5 transition-transform ${alumniOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <AnimatePresence>
          {alumniOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {members.alumni.map((alum, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="flex flex-col items-center rounded-lg border border-slate-200 bg-white p-5 text-center dark:border-slate-800 dark:bg-slate-900"
                  >
                    <Avatar name={alum.name} photo={alum.photo || undefined} size="sm" />
                    <h4 className="mt-3 font-semibold text-slate-900 dark:text-white">
                      {alum.name}
                    </h4>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      {alum.degree} · {alum.period}
                    </p>
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                      {alum.research}
                    </p>
                    {alum.currentPosition && (
                      <p className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        Now at: {alum.currentPosition}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
