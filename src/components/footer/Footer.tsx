import type { ReactElement } from "react";
import { fetchFooter } from "@/api/footerApi";
import { getActivePublisher } from "@/config/publishers";

// SVG shapes are code — the link URLs and titles come from the footer API.
const SOCIAL_ICONS: Record<string, ReactElement> = {
  Facebook: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
  ),
  Twitter: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
  ),
  LinkedIn: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
  ),
  Instagram: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
  ),
  YouTube: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>
  ),
};

/** Server component — all data from CDS /footer/ API. */
export async function Footer() {
  const publisher = getActivePublisher();
  const footer = await fetchFooter(); // GET /publisher/4027/footer/

  const socialLinks = (footer.socialLinks ?? []).sort((a, b) => a.pk_key - b.pk_key);
  const quickMenus = footer.addQuickMenu ?? [];

  return (
    <footer className="pb-site-footer">
      <div className="pb-shell">

        {/* Top row: logo + bio left, social icons right */}
        <div className="pb-footer-top">
          <div className="pb-footer-brand-col">
            {footer.logo ? (
              <img src={footer.logo} alt={publisher.name} className="pb-footer-logo" />
            ) : (
              <span className="pb-footer-brand-name">{publisher.name}</span>
            )}
            {footer.short_bio && (
              <p className="pb-footer-bio">{footer.short_bio}</p>
            )}
          </div>

          {socialLinks.length > 0 && (
            <div className="pb-footer-social">
              {socialLinks.map((s) => (
                <a
                  key={s.pk_key}
                  href={s.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.title}
                  className="pb-footer-social-link"
                >
                  {SOCIAL_ICONS[s.title] ?? <span>{s.title[0]}</span>}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Quick menus + app links */}
        {quickMenus.length > 0 && (
          <div className="pb-footer-menus">
            {quickMenus.map((menu) => (
              <div key={menu.title} className="pb-footer-menu-col">
                <h3 className="pb-footer-menu-title">{menu.title}</h3>
                <ul className="pb-footer-menu-list">
                  {menu.childQuickLinks.map((link) => (
                    <li key={link.link}>
                      <a
                        href={link.link}
                        className="pb-footer-menu-link"
                        {...(link.link.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* App store links — from footer API */}
            {(footer.app_links?.apple_url || footer.app_links?.android_url) && (
              <div className="pb-footer-menu-col">
                <h3 className="pb-footer-menu-title">Download App</h3>
                <div className="pb-footer-app-links">
                  {footer.app_links.apple_url && (
                    <a href={footer.app_links.apple_url} target="_blank" rel="noopener noreferrer" className="pb-footer-app-btn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                      App Store
                    </a>
                  )}
                  {footer.app_links.android_url && (
                    <a href={footer.app_links.android_url} target="_blank" rel="noopener noreferrer" className="pb-footer-app-btn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.39-1.32 2.76-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                      Google Play
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Copyright */}
        <div className="pb-footer-bottom">
          <p className="pb-footer-copy">
            {footer.copyRightText ?? `© ${new Date().getFullYear()} ${publisher.name}. All rights reserved.`}
          </p>
        </div>

      </div>
    </footer>
  );
}
