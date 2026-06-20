/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    RAPIDAPI_KEY: process.env.RAPIDAPI_KEY,
    RAPIDAPI_HOST: process.env.RAPIDAPI_HOST,
    OPENSKY_CLIENT_ID: process.env.OPENSKY_CLIENT_ID,
    OPENSKY_CLIENT_SECRET: process.env.OPENSKY_CLIENT_SECRET,
  },
};

export default nextConfig;
