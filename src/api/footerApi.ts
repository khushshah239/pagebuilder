import { unstable_cache } from "next/cache";
import { cdsFetch } from "./cdsClient";
import { CDS_PUBLISHER_ID } from "@/config/env";

export interface SocialLink {
  title: string;
  link: string;
  pk_key: number;
}

export interface QuickLink {
  name: string;
  link: string;
}

export interface QuickMenu {
  title: string;
  childQuickLinks: QuickLink[];
}

export interface AppLinks {
  apple_url?: string;
  android_url?: string;
}

export interface FooterData {
  logo?: string;
  short_bio?: string;
  copyRightText?: string;
  textColor?: string;
  accentColor?: string;
  socialLinks?: SocialLink[];
  addQuickMenu?: QuickMenu[];
  app_links?: AppLinks;
  newsletter?: boolean;
  latestStories?: boolean;
}

interface FooterResponse {
  data?: FooterData;
}

export const fetchFooter = unstable_cache(
  async (): Promise<FooterData> => {
    try {
      const res = await cdsFetch<FooterResponse>("/footer/");
      return res.data ?? {};
    } catch (err) {
      console.error("[CDS] fetchFooter failed:", err);
      return {};
    }
  },
  [`${CDS_PUBLISHER_ID}-footer`],
  { revalidate: 60 }
);
