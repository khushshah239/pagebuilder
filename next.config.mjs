/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // CDS media is served from arbitrary publisher CDNs; allow remote images.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
