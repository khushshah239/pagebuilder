/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 3600,
    // Width rungs the custom cdnLoader is asked for (full-viewport images).
    deviceSizes: [360, 640, 768, 1024, 1280, 1600, 1920],
    // Sub-viewport rungs: 16 = blur LQIP, 48-128 = avatars/icons, 200-320 = cards.
    imageSizes: [16, 48, 64, 96, 128, 200, 256, 320],
    // Next 15 requires an allowlist when a loader forwards a quality value.
    qualities: [50, 60, 70, 75],
  },
  experimental: {
    optimizePackageImports: ["react", "react-dom"],
  },
};

export default nextConfig;
