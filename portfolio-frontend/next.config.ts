const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://habcreative-cms.onrender.com/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
