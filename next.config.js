/** @type {import('next').NextConfig} */
const nextConfig = {
  // 2026: standalone output — produces self-contained server bundle for Docker
  // Eliminates 200MB+ of build tooling from production image (~140MB final)
  output: 'standalone',

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'hyperfocus-mode.teemill.com' },
      { protocol: 'https', hostname: 'teemill.com' },
      { protocol: 'https', hostname: 'images.podos.io' }, // Teemill product image CDN
    ],
  },
  experimental: {
    // Product image uploads run through a Server Action; the default 1MB
    // body cap would reject real photos, so allow up to a few MB.
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

module.exports = nextConfig
