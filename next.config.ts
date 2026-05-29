import type { NextConfig } from "next";

const ratingApiUrl =
  process.env.NEXT_PUBLIC_RATING_API_URL?.trim() ||
  "https://script.google.com/macros/s/AKfycbwIicIKyPbV3dadg9V8qjf7NYTn7QJjm3O-GmbOUfbYkZsFqWy2pbtqQ1q1r4jQ16nI/exec";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_BASE_PATH: "",
    NEXT_PUBLIC_RATING_API_URL: ratingApiUrl,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
