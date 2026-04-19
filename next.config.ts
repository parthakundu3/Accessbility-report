/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium-min'],
  
  // Keep your existing webpack config if needed
  webpack: (config:any, { isServer }) => {
    if (isServer) {
      config.externals.push('puppeteer-core', '@sparticuz/chromium-min');
    }
    return config;
  },
  
  // Turbopack config (if using)
  turbopack: {
    serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium-min'],
  },
};

module.exports = nextConfig;