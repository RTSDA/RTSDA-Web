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
  // Configure static file handling
  headers: async () => [
    {
      source: '/_next/static/css/:path*',
      headers: [
        {
          key: 'Content-Type',
          value: 'text/css',
        },
      ],
    },
    {
      source: '/_next/static/js/:path*',
      headers: [
        {
          key: 'Content-Type',
          value: 'application/javascript',
        },
      ],
    },
  ],
}

module.exports = nextConfig
