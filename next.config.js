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
          // {
          //   key: "Access-Control-Allow-Origin",
          //   value: "*.vjournal.me",
          // },
          // {
          //   key: "Access-Control-Allow-Methods",
          //   value: "GET, POST, PUT, DELETE, OPTIONS",
          // },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
