import { unstable_cache } from "next/cache";
import { cdsFetch } from "./cdsClient";
import { CDS_PUBLISHER_ID } from "@/config/env";

/** Social handles returned by the publisher endpoint. */
export interface PublisherSocialLinks {
  twitter?: string;
  facebook?: string;
  instagram?: string;
}

/** Shape of `data` from GET /publisher/{id}/. */
export interface PublisherApiData {
  name?: string;
  logo?: string;
  favicon?: string;
  primary_color?: string;
  secondary_color?: string;
  social_links?: PublisherSocialLinks;
  meta_title?: string;
  meta_description?: string;
}

interface PublisherApiResponse {
  status?: string;
  data?: PublisherApiData;
  message?: string;
}

/** Fetches publisher branding/SEO from CDS (GET /publisher/{id}/). */
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
