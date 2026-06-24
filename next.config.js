/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'hyperfocus-mode.teemill.com' },
      { protocol: 'https', hostname: 'teemill.com' },
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
