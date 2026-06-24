import next from "eslint-config-next/core-web-vitals";

/** Flat ESLint config: Next.js recommended rules + core web vitals. */
const config = [
  ...next,
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts"],
  },
  {
    rules: {
      // Organisms render arbitrary remote image URLs from the CDS payload, where
      // plain <img> is intentional — next/image would require per-host domain
      // config and change runtime fetching/layout behavior.
      "@next/next/no-img-element": "off",
    },
  },
];

export default config;
