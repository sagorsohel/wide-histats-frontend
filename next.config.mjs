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
        source: "/js15_as.js",
        destination: `${backendUrl}/js15_as.js`,
      },
      {
        source: "/0.gif",
        destination: `${backendUrl}/0.gif`,
      },
      {
        source: "/livearray",
        destination: `${backendUrl}/livearray`,
      },
      {
        source: "/api/v1/track/:path*",
        destination: `${backendUrl}/api/v1/track/:path*`,
      },
      {
        source: "/counter/:path*",
        destination: `${backendUrl}/counter/:path*`,
      },
    ];
  },
};

export default nextConfig;
