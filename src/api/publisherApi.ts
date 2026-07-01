import { unstable_cache } from "next/cache";
import { cdsFetch } from "./cdsClient";
import { CDS_PUBLISHER_ID } from "@/config/env";

/** Shape of `data` from GET /publisher/{id}/. */
export interface PublisherApiData {
  name?: string;
  short_logo?: string;
  long_logo?: string;
  dark_mode_logo?: string;
  link_color?: string;
  facebook_page_url?: string;
  twitter_page_url?: string;
  instagram_page_url?: string;
  youtube_page_url?: string;
  linkedin_page_url?: string;
}

interface PublisherApiResponse {
  status?: string;
  data?: PublisherApiData;
}

/** Fetches publisher branding from CDS (GET /publisher/{id}/). */
export const fetchPublisherData = unstable_cache(
  async (): Promise<PublisherApiData> => {
    try {
      const res = await cdsFetch<PublisherApiResponse>("/");
      return res.data ?? {};
    } catch (err) {
      console.error("[CDS] fetchPublisherData failed:", err);
      return {};
    }
  },
  [`${CDS_PUBLISHER_ID}-publisher`],
  { revalidate: 300 }
);
