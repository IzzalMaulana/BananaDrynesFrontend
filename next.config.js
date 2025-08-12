/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    https: true
  },
  // Konfigurasi untuk development server
  devIndicators: {
    buildActivity: false
  }
}

module.exports = nextConfig
