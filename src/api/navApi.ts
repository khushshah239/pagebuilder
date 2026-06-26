import { unstable_cache } from "next/cache";
import { cdsFetch } from "./cdsClient";
import { CDS_PUBLISHER_ID } from "@/config/env";

export interface NavItem {
  name: string;
  link: string;
  open_new_tab: boolean;
  children?: NavItem[] | null;
}

interface NavResponse {
  data?: NavItem[];
}

export const fetchNavigation = unstable_cache(
  async (): Promise<NavItem[]> => {
    try {
      const res = await cdsFetch<NavResponse>("/navbar/");
      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      console.error("[CDS] fetchNavigation failed:", err);
      return [];
    }
  },
  [`${CDS_PUBLISHER_ID}-navigation`],
  { revalidate: 60 }
);
