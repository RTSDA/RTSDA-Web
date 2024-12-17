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
        maxInitialRequests: 25,
        minSize: 20000,
        maxSize: 20000000, // 20MB to be safe
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              // Get the package name
              const match = module.context?.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/);
              const packageName = match ? match[1] : 'vendors';
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
