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
      const items = Array.isArray(res.data) ? res.data : [];
      // Drop blank entries and de-duplicate by name+link.
      const seen = new Set<string>();
      return items.filter((item) => {
        const name = item.name?.trim();
        if (!name) return false;
        const key = `${name.toLowerCase()}|${item.link ?? ""}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    } catch (err) {
      console.error("[CDS] fetchNavigation failed:", err);
      return [];
    }
  },
  [`${CDS_PUBLISHER_ID}-navigation`],
  { revalidate: 60 }
);
