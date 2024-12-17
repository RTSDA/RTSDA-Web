const crypto = require('crypto');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // These packages are only used server-side
      config.resolve.alias = {
        ...config.resolve.alias,
        'nodemailer': false,
        '@prisma/client': false,
        'prisma': false,
        'server-only': false,
      };
    }

    // Disable chunk splitting for now
    config.optimization.splitChunks = false;
    config.optimization.runtimeChunk = false;

    return config;
  },
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ['@mui/icons-material', '@mui/material'],
  },
  swcMinify: true,
  productionBrowserSourceMaps: false,
  compress: true,
}

module.exports = nextConfig
