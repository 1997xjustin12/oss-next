import type { NextConfig } from "next";

const WP_ORIGIN = "https://onsitestorage.com";

const nextConfig: NextConfig = {
  cacheComponents: true,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'onsite-cdn.sfo3.cdn.digitaloceanspaces.com' },
      { protocol: 'https', hostname: 'bbq-spaces.sfo3.cdn.digitaloceanspaces.com' },
      { protocol: 'https', hostname: 'onsitestorage.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },

  // Proxy WordPress API paths so AJAX calls from the iframe avoid CORS.
  // The browser hits localhost; Next.js forwards to the live WordPress site.
  async rewrites() {
    return [
      {
        source: "/wp-json/:path*",
        destination: `${WP_ORIGIN}/wp-json/:path*`,
      },
      {
        source: "/wp-admin/:path*",
        destination: `${WP_ORIGIN}/wp-admin/:path*`,
      },
    ];
  },
};

export default nextConfig;
