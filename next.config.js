/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  swcMinify: true,
  output: 'export',
  distDir: '.vercel/output/static',
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
    return config
  },
}

module.exports = nextConfig
