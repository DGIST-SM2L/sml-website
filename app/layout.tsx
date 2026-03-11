import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Soft Matter Lab | DGIST",
    template: "%s | Soft Matter Lab",
  },
  description:
    "Soft Matter Lab at DGIST develops mesoscale simulation models and computational tools to investigate soft matter systems, combining AI and data-driven technologies for novel polymer materials design.",
  openGraph: {
    title: "Soft Matter Lab | DGIST",
    description:
      "Mesoscale simulation and computational polymer science research group at DGIST.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
