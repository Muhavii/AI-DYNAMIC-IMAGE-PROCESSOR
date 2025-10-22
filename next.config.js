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

  // Webpack configuration - optimized for Edge Runtime
  webpack: (config, { isServer }) => {
    // Configure path aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': __dirname + '/src',
    };
    
    // Only apply these configurations for client-side code
    if (!isServer) {
      // Disable Node.js polyfills that aren't needed in the browser
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        dgram: false,
        zlib: false,
        http2: false,
        http: false,
        https: false,
        stream: false,
        crypto: false,
        path: false,
        os: false,
      };
    }
    
    return config;
  },
  
  // Enable server actions
  experimental: {
    serverActions: true,
  },
  
  // Explicitly enable webpack 5
  webpack5: true,
};

module.exports = nextConfig;
