/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  webpack: (config, { dev }) => {
    if (dev) {
      // Disable persistent pack caching in development to eliminate 404 missing chunk and pack header corruption
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
