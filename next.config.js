/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: '.vercel/output/static', // Match Cloudflare Pages build output directory
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Split chunks into smaller sizes for Cloudflare's 25MB limit
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: 25,
        minSize: 20000,
        maxSize: 20000000, // 20MB to be safe
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
              return `vendor.${packageName.replace('@', '')}`;
            },
            priority: 10,
          },
          common: {
            minChunks: 2,
            priority: -10,
          },
        },
      },
    };

    return config;
  },
}

module.exports = nextConfig
