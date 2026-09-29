import type { NextConfig } from "next";

const WP_ORIGIN = "https://onsitestorage.com";

const nextConfig: NextConfig = {
  cacheComponents: true,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'onsite-cdn.sfo3.cdn.digitaloceanspaces.com' },
      { protocol: 'https', hostname: 'bbq-spaces.sfo3.cdn.digitaloceanspaces.com' },
      { protocol: 'https', hostname: 'onsitestorage.com' },
      { protocol: 'https', hostname: 'bbq-blog.onsitestorage.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      // YouTube poster frames for the PDP video facades (lib/productVideos.ts)
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'secure.gravatar.com' },
    ],
  },

  /**
   * Long-cache the walkaround videos.
   *
   * Files under `public/` are served with `must-revalidate` by default, so
   * every return to a product page costs at least a round trip on a ~5MB file
   * — and switching container variant back and forth costs one each way. These
   * are immutable in practice: a new cut is a new upload, and the filename is
   * derived from the specs, so the only way content changes under a name is
   * someone deliberately replacing it. Ten minutes of `stale-while-revalidate`
   * covers that without making a visitor wait for it.
   */
  async headers() {
    return [
      {
        source: "/resources/pdp-videos/:file*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, stale-while-revalidate=600",
          },
        ],
      },
    ];
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
