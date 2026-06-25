import { cache } from "react";
import { cdsFetch } from "./cdsClient";

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

export const fetchFooter = cache(async (): Promise<FooterData> => {
  try {
    const res = await cdsFetch<FooterResponse>("/footer/");
    return res.data ?? {};
  } catch {
    return {};
  }
});
