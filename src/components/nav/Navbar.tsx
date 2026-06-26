import Link from "next/link";
import type { ReactElement } from "react";
import { fetchNavigation } from "@/api/navApi";
import { fetchFooter } from "@/api/footerApi";
import { NavSearchBar } from "./NavSearchBar";

// SVG shapes are code — the link URLs and titles all come from the footer API.
const SOCIAL_ICONS: Record<string, ReactElement> = {
  Facebook: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
  ),
  Twitter: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
  ),
  LinkedIn: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
  ),
  Instagram: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
  ),
  YouTube: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>
  ),
};

/** Server component — fetches nav items and social links from CDS APIs. */
export async function Navbar() {
  // Both fetched from CDS — no hardcoded links
  const [navItems, footer] = await Promise.all([
    fetchNavigation(),   // GET /publisher/4027/navbar/
    fetchFooter(),       // GET /publisher/4027/footer/
  ]);

  const socialLinks = (footer.socialLinks ?? []).sort((a, b) => a.pk_key - b.pk_key);

  return (
    <nav className="pb-main-nav" aria-label="Primary navigation">
      <div className="pb-shell pb-nav-inner">

        {/* Nav links — from /navbar/ API */}
        <div className="pb-nav-links">
          {navItems.map((item) => (
            <Link
              key={item.link + item.name}
              href={item.link}
              prefetch={false}
              {...(item.open_new_tab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Search bar */}
        <NavSearchBar />

        {/* Social icons — links from /footer/ API */}
        {socialLinks.length > 0 && (
          <div className="pb-nav-social">
            {socialLinks.map((s) => (
              <a
                key={s.pk_key}
                href={s.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.title}
                className="pb-nav-social-link"
              >
                {SOCIAL_ICONS[s.title] ?? <span>{s.title[0]}</span>}
              </a>
            ))}
          </div>
        )}

      </div>
    </nav>
  );
}
