import { PbImage } from "@/components/PbImage";
import type { AppPromoCardProps } from "@/types/homepage/organism.types";
import { fetchFooter } from "@/api/footerApi";
import styles from "@/styles/organisms/homepage/AppPromoCard.module.css";

/**
 * App-download banner.
 * Labels come from CMS fields — found by scanning all props for keys containing
 * "android" or "iphone/ios" so the exact stored key name doesn't matter.
 * URLs come from the CDS /footer/ API app_links — nothing hardcoded.
 */
export async function AppPromoCard(props: AppPromoCardProps) {
  const { identifier, title, background_image } = props;
  if (!title) return null;

  // Find labels by scanning every prop key — handles cta(Android), cta_android,
  // ctaAndroid, etc. whatever the CDS stored.
  const allKeys = Object.keys(props) as (keyof typeof props)[];

  const androidLabel = allKeys
    .filter((k) => /android/i.test(String(k)))
    .map((k) => props[k])
    .find((v) => typeof v === "string" && v.trim() !== "") as string | undefined;

  const iosLabel = allKeys
    .filter((k) => /iphone|ios/i.test(String(k)))
    .map((k) => props[k])
    .find((v) => typeof v === "string" && v.trim() !== "") as string | undefined;

  const footer = await fetchFooter();
  const appleUrl   = footer.app_links?.apple_url   ?? null;
  const androidUrl = footer.app_links?.android_url ?? null;

  return (
    <section className={styles.card} data-organism={identifier}>
      {background_image ? (
        <span className={styles.bg}>
          <PbImage
            src={background_image}
            alt=""
            aria-hidden
            fillParent
            placeholder="none"
            sizes="100vw"
          />
        </span>
      ) : null}
      <span className={background_image ? styles.overlay : styles.overlayLight} aria-hidden="true" />

      <div className={styles.content}>
        <h2 className={styles.title}>{title}</h2>

        {(iosLabel || androidLabel) && (
          <div className={styles.appLinks}>
            {iosLabel && (appleUrl ? (
              <a href={appleUrl} target="_blank" rel="noopener noreferrer" className={styles.appBtn}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                {iosLabel}
              </a>
            ) : (
              <button type="button" className={styles.appBtn}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                {iosLabel}
              </button>
            ))}

            {androidLabel && (androidUrl ? (
              <a href={androidUrl} target="_blank" rel="noopener noreferrer" className={styles.appBtn}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.39-1.32 2.76-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                {androidLabel}
              </a>
            ) : (
              <button type="button" className={styles.appBtn}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.39-1.32 2.76-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                {androidLabel}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
