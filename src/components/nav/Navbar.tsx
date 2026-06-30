import Image from "next/image";
import Link from "next/link";
import { fetchNavigation } from "@/api/navApi";
import { fetchPublisherData } from "@/api/publisherApi";
import { getActivePublisher } from "@/config/publishers";
import { safeSocialHref } from "@/components/SocialIcons";
import { NavSearchBar } from "./NavSearchBar";

export async function Navbar() {
  const [navItems, publisherData] = await Promise.all([
    fetchNavigation(),
    fetchPublisherData(),
  ]);
  const publisher = getActivePublisher();
  const logoUrl = publisherData.logo;

  return (
    <nav className="pb-main-nav" aria-label="Primary navigation">
      <div className="pb-shell pb-nav-inner">

        <Link className="pb-brand" href="/" aria-label={`${publisher.name} home`}>
          {logoUrl ? (
            <Image
              className="pb-brand-logo"
              src={logoUrl}
              alt={publisher.name}
              width={200}
              height={44}
              priority
            />
          ) : (
            <span className="pb-brand-name">{publisher.name}</span>
          )}
        </Link>

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

        <div className="pb-nav-right">
          <NavSearchBar />
        </div>

      </div>
    </nav>
  );
}
