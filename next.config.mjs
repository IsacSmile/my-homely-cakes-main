/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracing: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
      }
    ],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Disable persistent file caching in dev mode to prevent OneDrive file locking chunk corruption (missing ./948.js)
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
