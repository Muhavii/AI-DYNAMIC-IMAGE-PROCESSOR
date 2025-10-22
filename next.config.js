/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Configure image optimization
  images: {
    domains: [
      'localhost',
      'your-supabase-url.supabase.co',
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com'
    ],
    formats: ['image/webp'],
    deviceSizes: [640, 750, 1080, 1200, 1920],
    imageSizes: [64, 96, 128, 256],
  },

  // Basic security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ];
  },

  // Webpack configuration
  webpack: (config) => {
    config.resolve.alias['@'] = __dirname + '/src';
    return config;
  },
  
  // Enable server actions
  experimental: {
    serverActions: true
  },
};

module.exports = nextConfig;
