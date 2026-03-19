import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              Soft Matter Lab
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              DGIST (Daegu Gyeongbuk Institute of Science and Technology)
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">
              333 Techno jungang-daero, Hyeonpung-eup, Dalseong-gun, Daegu
            </p>
            <a href="https://www.dgist.ac.kr" target="_blank" rel="noopener noreferrer" className="mt-4 inline-block">
              <Image
                src="/images/dgist-logo.png"
                alt="DGIST"
                width={243}
                height={28}
                className="object-contain opacity-80 hover:opacity-100 transition-opacity"
              />
            </a>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              Quick Links
            </h3>
            <ul className="mt-2 space-y-1">
              {[
                { href: "/research", label: "Research" },
                { href: "/publications", label: "Publications" },
                { href: "/people", label: "People" },
                { href: "/contact", label: "Contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              Connect
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Interested in joining our lab? Check our{" "}
              <Link href="/contact" className="text-blue-600 hover:underline dark:text-blue-400">
                contact page
              </Link>{" "}
              for more information.
            </p>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-200 pt-8 dark:border-slate-800">
          <p className="text-center text-xs text-slate-500 dark:text-slate-500">
            &copy; {new Date().getFullYear()} Simulation and Machine Learning for Soft Matter Lab, DGIST. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
