import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**.supabase.in" },
      // Common CDNs that organizers might use for cover images
      { protocol: "https", hostname: "**.cloudinary.com" },
      { protocol: "https", hostname: "**.imgur.com" },
    ],
  },
  async redirects() {
    return [
      { source: "/", destination: "/events", permanent: false },
    ];
  },
};

export default nextConfig;
