import { unstable_cache } from "next/cache";
import { cdsFetch } from "./cdsClient";
import { CDS_PUBLISHER_ID } from "@/config/env";

export interface PublisherApiData {
  long_logo?: string;
  short_logo?: string;
  dark_mode_logo?: string;
  logo?: string;
  name?: string;
  tagline?: string;
}

interface PublisherApiResponse {
  data?: PublisherApiData;
  long_logo?: string;
  short_logo?: string;
  dark_mode_logo?: string;
  logo?: string;
}

/** Fetches publisher branding from CDS; handles nested or flat response shapes. */
export const fetchPublisherData = unstable_cache(
  async (): Promise<PublisherApiData> => {
    try {
      const res = await cdsFetch<PublisherApiResponse>("/");
      return res.data ?? {
        long_logo: res.long_logo,
        short_logo: res.short_logo,
        dark_mode_logo: res.dark_mode_logo,
        logo: res.logo,
      };
    } catch (err) {
      console.error("[CDS] fetchPublisherData failed:", err);
      return {};
    }
  },
  [`${CDS_PUBLISHER_ID}-publisher`],
  { revalidate: 300 }
);
