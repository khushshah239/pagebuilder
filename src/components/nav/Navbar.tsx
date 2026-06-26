import Link from "next/link";
import { fetchNavigation } from "@/api/navApi";
import { fetchFooter } from "@/api/footerApi";
import { getSocialIcon, safeSocialHref } from "@/components/SocialIcons";
import { NavSearchBar } from "./NavSearchBar";

/** Server component — fetches nav items and social links from CDS APIs. */
export async function Navbar() {
  const [navItems, footer] = await Promise.all([
    fetchNavigation(),
    fetchFooter(),
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
              href={safeSocialHref(item.link)}
              {...(item.open_new_tab ? { target: "_blank", rel: "noopener noreferrer", prefetch: false } : {})}
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
                href={safeSocialHref(s.link)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.title}
                className="pb-nav-social-link"
              >
                {getSocialIcon(s.title) ?? <span>{s.title.charAt(0) || "?"}</span>}
              </a>
            ))}
          </div>
        )}

      </div>
    </nav>
  );
}
