import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Sora } from "next/font/google";
import { getActivePublisher } from "@/config/publishers";
import { themeToCssVariables } from "@/theme/cssVariables";
import { fetchPublisherData } from "@/api/publisherApi";
import { fetchNavigation } from "@/api/navApi";
import { fetchFooter } from "@/api/footerApi";
import { Navbar } from "@/components/nav/Navbar";
import { Footer } from "@/components/footer/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
});

const publisher = getActivePublisher();

export const metadata: Metadata = {
  title: `${publisher.name} — ${publisher.tagline}`,
  description: `${publisher.name} — pages assembled from CDS components.`,
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Warm shared caches in parallel — Navbar/Footer read from the same cache.
  await Promise.all([
    fetchPublisherData(),
    fetchNavigation(),
    fetchFooter(),
  ]);

  return (
    <html lang={publisher.lang ?? "en"} className={`${inter.variable} ${sora.variable}`}>
      <body>
        <div className="pb-root" style={themeToCssVariables(publisher.theme)}>
          <header className="pb-site-header">
            <Navbar />
          </header>

          {children}

          <Footer />
          <ScrollReveal />
        </div>
      </body>
    </html>
  );
}
