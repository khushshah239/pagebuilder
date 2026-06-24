import { cache } from "react";
import { cdsFetch } from "./cdsClient";

export interface PublisherApiData {
  long_logo?: string;
  short_logo?: string;
  logo?: string;
  name?: string;
  tagline?: string;
}

interface PublisherApiResponse {
  data?: PublisherApiData;
  long_logo?: string;
  short_logo?: string;
  logo?: string;
}

/** Fetch publisher branding data from CDS GET /publisher/{id}/ */
export const fetchPublisherData = cache(async (): Promise<PublisherApiData> => {
  try {
    const res = await cdsFetch<PublisherApiResponse>("/");
    // CDS may return data nested under `data` or at root level
    return res.data ?? {
      long_logo: res.long_logo,
      short_logo: res.short_logo,
      logo: res.logo,
    };
  } catch {
    return {};
  }
});
