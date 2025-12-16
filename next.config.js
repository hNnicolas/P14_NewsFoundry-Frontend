/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  experimental: {
    serverActions: true,
  },

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "app"),
    };
    return config;
  },
};

module.exports = nextConfig;
