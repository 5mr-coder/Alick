/** @type {import('next').NextConfig} */
function getSupabaseHostname() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

const supabaseHostname = getSupabaseHostname();

const remotePatterns = [
  {
    protocol: 'https',
    hostname: 'images.unsplash.com',
  },
  ...(supabaseHostname
    ? [
        {
          protocol: 'https',
          hostname: supabaseHostname,
        },
      ]
    : []),
];

const cspDirectives = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''} https://js.paystack.co`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://api.fontshare.com",
  "font-src 'self' data: https://fonts.gstatic.com https://cdn.fontshare.com https://api.fontshare.com",
  `img-src 'self' data: blob: https://images.unsplash.com${supabaseHostname ? ` https://${supabaseHostname}` : ''}`,
  `connect-src 'self' https://api.paystack.co${supabaseHostname ? ` https://${supabaseHostname} wss://${supabaseHostname}` : ''}`,
  "frame-src https://checkout.paystack.com https://www.google.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self' https://checkout.paystack.com",
  "object-src 'none'",
].join('; ');

const nextConfig = {
  images: {
    remotePatterns,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: cspDirectives },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
