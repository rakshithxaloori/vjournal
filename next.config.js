/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    domains: ["cdn.vjournal.me", "lh3.googleusercontent.com"],
  },
  async headers() {
    return [
      {
        source: "/",
        headers: [
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "unsafe-none",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
        ],
      },
    ];
  },
  i18n: {
    locales: ["en-US", "en-IN"],
    defaultLocale: "en-US",
  },
};

module.exports = nextConfig;
