// frontend/next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://habcreative-cms.onrender.com/api/:path*',
      },
    ];
  },
  // Cấu hình images nếu có
  images: {
    domains: ['res.cloudinary.com'],
  },
};

module.exports = nextConfig;
