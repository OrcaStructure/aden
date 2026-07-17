import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: projectRoot,
  },
  env: {
    // Netlify sets COMMIT_REF at build time; surfaced in /hanzi stats so a
    // stale cached PWA bundle is identifiable at a glance
    NEXT_PUBLIC_COMMIT: process.env.COMMIT_REF || "",
  },
};

export default nextConfig;
