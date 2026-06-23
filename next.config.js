/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'hyperfocus-mode.teemill.com' },
      { protocol: 'https', hostname: 'teemill.com' },
    ],
  },
}

module.exports = nextConfig
