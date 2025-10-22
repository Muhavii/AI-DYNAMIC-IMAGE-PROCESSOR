/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for development
  reactStrictMode: true,
  
  // Use SWC minification for better performance
  swcMinify: true,
  
  // Configure image optimization
  images: {
    // Allow images from these domains
    domains: [
      'localhost',
      'your-supabase-url.supabase.co',
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com'
    ],
    // Enable modern image formats (WebP, AVIF)
    formats: ['image/webp', 'image/avif'],
    // Configure device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Configure image sizes for different breakpoints
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Configure headers for security
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
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },

  // Enable webpack optimizations
  webpack: (config, { isServer }) => {
    // Add path aliases
    config.resolve.alias['@'] = __dirname + '/src';
    
    // Optimize moment.js locales
    config.plugins.push(
      new (require('next/dist/compiled/webpack/bundle5').ContextReplacementPlugin)(
        /moment[/\\]locale$/,
        /en|es|fr/,
      ),
    );
    
    // Only run these optimizations in production
    if (!isServer) {
      // Optimize lodash usage
      config.plugins.push(
        new (require('webpack').ContextReplacementPlugin)(
          /lodash/,
          null,
          'lodash',
        ),
      );
    }
    
    return config;
  },
  
  // Configure output for static export if needed
  output: 'standalone',
  
  // Enable production browser source maps
  productionBrowserSourceMaps: false,
  
  // Configure page revalidation (ISR)
  experimental: {
    // Enable server components (if using Next.js 13+)
    serverComponents: true,
    // Enable new Next.js Link behavior
    newNextLinkBehavior: true,
    // Optimize package imports
    optimizePackageImports: ['@heroicons/react', 'lodash'],
  },
};

module.exports = nextConfig;
