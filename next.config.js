/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['retell-sdk'],
  },
}

module.exports = nextConfig
