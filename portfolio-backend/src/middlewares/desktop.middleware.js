// backend/middlewares/desktop.middleware.js

const isDesktopRequest = (req) => {
  // Kiểm tra header X-Desktop-App
  if (req.headers['x-desktop-app'] === 'true') {
    return true;
  }

  // Kiểm tra User-Agent
  const ua = req.headers['user-agent'] || '';
  if (ua.toLowerCase().includes('electron')) {
    return true;
  }

  // Kiểm tra origin
  const origin = req.headers['origin'] || '';
  if (origin.startsWith('file://') || origin.startsWith('electron://')) {
    return true;
  }

  return false;
};

const desktopOnly = (req, res, next) => {
  // Skip cho các route public
  const publicRoutes = [
    '/api/auth/google',
    '/api/auth/refresh-token',
    '/api/auth/verify-2fa',
    '/api/license/verify',
    '/api/license/qr',
    '/api/health',
  ];

  const isPublic = publicRoutes.some(route => req.path.startsWith(route));
  if (isPublic) {
    return next();
  }

  // Skip cho admin routes (kiểm tra riêng)
  if (req.path.startsWith('/api/admin') || req.path.startsWith('/api/license')) {
    if (!isDesktopRequest(req)) {
      console.log(`[Desktop] ❌ Blocked request from non-desktop: ${req.path}`);
      return res.status(403).json({
        success: false,
        message: 'This API is only accessible from the Desktop Application',
        code: 'DESKTOP_ONLY',
        downloadUrl: 'https://habcreative.com/download/desktop-app'
      });
    }
    console.log(`[Desktop] ✅ Desktop request: ${req.path}`);
  }

  next();
};

module.exports = {
  isDesktopRequest,
  desktopOnly,
};
