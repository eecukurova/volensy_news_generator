/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'volensy.com',
      },
    ],
  },
}

module.exports = nextConfig
