/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
      config.resolve.fallback = { fs: false, net: false, tls: false };
      return config;
    },
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'ipfs.io',
        },
        {
          protocol: 'https',
          hostname: 'assets-cdn.trustwallet.com',
        },
      ],
    },
  };
  
  export default nextConfig;