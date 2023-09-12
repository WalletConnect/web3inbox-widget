// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  transpilePackages: ["@web3inbox/core", "@web3inbox/widget-html", "@web3inbox/widget-react"],
  experimental: {
    esmExternals: "loose",
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
