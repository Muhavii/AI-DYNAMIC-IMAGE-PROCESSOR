/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'localhost',
      'your-supabase-url.supabase.co',
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com'
    ]
  },
  // Disable webpack 5 for now to avoid ContextReplacementPlugin issues
  webpack: (config, { isServer }) => {
    // Only configure client-side
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        path: false,
        stream: false,
        crypto: false
      };
    }
    return config;
  }
};
