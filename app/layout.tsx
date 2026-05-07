import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { inter, spaceGrotesk } from "@/lib/fonts";

const cloudflareAnalyticsToken =
  process.env.NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN;
const gaMeasurementId =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-9T5NH19MDY";

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
      <body className={`${inter.className} ${spaceGrotesk.variable}`}>
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
        {gaMeasurementId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaMeasurementId}');
              `}
            </Script>
          </>
        )}
        {cloudflareAnalyticsToken && (
          <Script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={JSON.stringify({
              token: cloudflareAnalyticsToken,
            })}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
