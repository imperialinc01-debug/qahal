/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@qahal/shared', '@qahal/database'],
  images: {
    domains: ['qahal-uploads.s3.amazonaws.com'],
  },
};

module.exports = nextConfig;
