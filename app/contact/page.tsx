"use client";

import { motion } from "framer-motion";
import SectionHeading from "@/components/SectionHeading";
import contactData from "@/content/contact.json";

export default function ContactPage() {
  const c = contactData;

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <SectionHeading title="Contact" subtitle="Get in touch with our research group" />

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">{c.labName}</h3>
            <div className="space-y-4">
              {/* Address */}
              <div className="flex gap-3">
                <svg className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Address</p>
                  {c.address.split("\n").map((line, i) => (
                    <p key={i} className="text-sm text-slate-600 dark:text-slate-400">{line}</p>
                  ))}
                  {c.institution && (
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{c.institution}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              {c.email && (
                <div className="flex gap-3">
                  <svg className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Email</p>
                    <a href={`mailto:${c.email}`} className="text-sm text-blue-600 hover:underline dark:text-blue-400">{c.email}</a>
                  </div>
                </div>
              )}

              {/* Phone */}
              {c.phone && (
                <div className="flex gap-3">
                  <svg className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Phone</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{c.phone}</p>
                  </div>
                </div>
              )}

              {/* Office */}
              {c.office && (
                <div className="flex gap-3">
                  <svg className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Office</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{c.office}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Join Us */}
          {c.joinText && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950/30">
              <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">{c.joinTitle}</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300">{c.joinText}</p>
            </div>
          )}
        </motion.div>

        {/* Map */}
        {c.mapEmbed && (
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
              <iframe
                src={c.mapEmbed}
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lab Location"
                className="w-full"
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
