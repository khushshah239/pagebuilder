import { cache } from "react";
import { cdsFetch } from "./cdsClient";

export interface NavItem {
  name: string;
  link: string;
  open_new_tab: boolean;
  children?: NavItem[] | null;
}

interface NavResponse {
  data?: NavItem[];
}

export const fetchNavigation = cache(async (): Promise<NavItem[]> => {
  try {
    const res = await cdsFetch<NavResponse>("/navbar/");
    return Array.isArray(res.data) ? res.data : [];
  } catch {
    return [];
  }
});
