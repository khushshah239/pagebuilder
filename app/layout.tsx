import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { getActivePublisher } from "@/config/publishers";
import { themeToCssVariables } from "@/theme/cssVariables";
import { fetchPublisherData } from "@/api/publisherApi";
import { fetchNavigation } from "@/api/navApi";
import { fetchFooter } from "@/api/footerApi";
import { Navbar } from "@/components/nav/Navbar";
import { Footer } from "@/components/footer/Footer";
import "./globals.css";

const publisher = getActivePublisher();

export const metadata: Metadata = {
  title: `${publisher.name} — ${publisher.tagline}`,
  description: `${publisher.name} — pages assembled from CDS components.`,
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Fire all three fetches in parallel — unstable_cache makes cache hits instant.
  const [publisherData] = await Promise.all([
    fetchPublisherData(),
    fetchNavigation(),
    fetchFooter(),
  ]);
  const logoUrl =
    publisherData.long_logo ??
    publisherData.logo ??
    publisher.longLogo;

  return (
    <html lang="en">
      <body>
        <div className="pb-root" style={themeToCssVariables(publisher.theme)}>
          <header className="pb-site-header">
            <div className="pb-shell pb-masthead">
              <Link className="pb-brand" href="/" aria-label={`${publisher.name} home`}>
                {logoUrl ? (
                  <Image
                    className="pb-brand-logo"
                    src={logoUrl}
                    alt={publisher.name}
                    width={260}
                    height={60}
                    priority
                  />
                ) : (
                  <>
                    <span className="pb-brand-mark">{publisher.name[0]}</span>
                    <span>
                      <span className="pb-brand-name">{publisher.name}</span>
                      <span className="pb-brand-tagline">{publisher.tagline}</span>
                    </span>
                  </>
                )}
              </Link>
            </div>
            <Navbar />
          </header>

          {children}

          <Footer />
        </div>
      </body>
    </html>
  );
}
