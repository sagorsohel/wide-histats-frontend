/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async rewrites() {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "https://api.analycos.com";
    return [
      {
        source: "/tracker.js",
        destination: `${backendUrl}/tracker.js`,
      },
      {
        source: "/api/v1/track/:path*",
        destination: `${backendUrl}/api/v1/track/:path*`,
      },
    ];
  },
};

export default nextConfig;
