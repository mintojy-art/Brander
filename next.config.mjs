const isDev = process.env.NODE_ENV !== 'production'

// React's dev server (Fast Refresh, component-stack reconstruction) needs
// 'unsafe-eval' to run at all locally. Production never uses eval(), so the
// deployed CSP stays exactly as strict as before — this only loosens `next dev`.
const scriptSrc = isDev
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com https://www.googletagmanager.com https://connect.facebook.net"
  : "script-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.googletagmanager.com https://connect.facebook.net"

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          {
            key: 'Content-Security-Policy',
            value:
              `default-src 'self'; ${scriptSrc}; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://script.google.com https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://*.facebook.com; frame-src https://www.youtube.com https://www.youtube-nocookie.com; object-src 'none'`,
          },
        ],
      },
    ]
  },
}

export default nextConfig
