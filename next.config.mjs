/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    RAPIDAPI_KEY: process.env.RAPIDAPI_KEY,
    RAPIDAPI_HOST: process.env.RAPIDAPI_HOST,
    AVIATIONSTACK_KEY: process.env.AVIATIONSTACK_KEY,
  },
};

export default nextConfig;
