/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: '.vercel/output/static',
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Split chunks into smaller sizes for Cloudflare's 25MB limit
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        maxSize: 20000000, // 20MB to be safe
      },
    };

    return config;
  },
}

module.exports = nextConfig
