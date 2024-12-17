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
  assetPrefix: '/',
  trailingSlash: true,
}

module.exports = nextConfig
