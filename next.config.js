/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: '.vercel/output/static',
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  swcMinify: true,
  assetPrefix: '',
  trailingSlash: true,
  generateEtags: false,
  poweredByHeader: false,
  experimental: {
    optimizeCss: false,
    optimizePackageImports: ['@heroicons/react'],
  },
  webpack: (config, { dev, isServer }) => {
    if (!isServer && !dev) {
      config.output.webassemblyModuleFilename = 'static/wasm/[modulehash].wasm'
      config.output.globalObject = 'self'
      config.output.publicPath = '/_next/'
    }
    // Split chunks into smaller sizes
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        maxSize: 20000000, // 20MB to be safe
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
              return `vendor.${packageName.replace('@', '')}`;
            },
          },
        },
      },
    };

    // Configure output
    config.output.assetModuleFilename = `static/[hash][ext]`;
    config.output.publicPath = `/_next/`;
    return config
  },
}

module.exports = nextConfig
