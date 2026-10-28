import type { NextConfig } from 'next'

// Where the slides JSON is published. The prodeko.org Hugo site builds it
// from its content/infoscreen folder.
const SLIDES_URL =
  process.env.SLIDES_URL || 'https://prodeko.org/infoscreen/slides.json'

const nextConfig: NextConfig = {
  compiler: {
    styledComponents: true,
  },
  // Proxy the upstream APIs so the browser never needs CORS from them.
  async rewrites() {
    return [
      {
        source: '/api/restaurants/:path*',
        destination: 'https://kitchen.kanttiinit.fi/restaurants/:path*',
      },
      {
        source: '/api/slides',
        destination: SLIDES_URL,
      },
    ]
  },
}

export default nextConfig
