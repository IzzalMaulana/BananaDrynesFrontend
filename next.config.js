/** @type {import('next').NextConfig} */
const nextConfig = {
  // Konfigurasi untuk development server
  eslint: {
    ignoreDuringBuilds: true, // Ignore ESLint errors during build
  },
}

module.exports = nextConfig
