// 👉 MIDDLEWARE KIỂM TRA CHỈ CHO PHÉP TRUY CẬP TỪ DESKTOP APP
const desktopOnly = (req, res, next) => {
  const userAgent = req.headers['user-agent'] || '';
  
  // 👉 CHO PHÉP LOGIN PAGE, AUTH, LICENSE TRUY CẬP TỪ TRÌNH DUYỆT
  const publicPaths = [
    '/admin/login',
    '/auth/',
    '/license/verify',
    '/license/qr/',
  ];
  
  // 👉 KIỂM TRA PATH
  const isPublicPath = publicPaths.some(path => req.path.includes(path));
  if (isPublicPath) {
    return next();
  }
  
  // 👉 KIỂM TRA XEM CÓ PHẢI ELECTRON APP KHÔNG
  const isElectron = userAgent.includes('Electron') || 
                      userAgent.includes('Portfolio') ||
                      req.headers['x-desktop-app'] === 'true';
  
  // 👉 CHẶN NẾU KHÔNG PHẢI TỪ DESKTOP APP
  if (!isElectron) {
    console.log(`[Security] Blocked access from browser: ${userAgent} - Path: ${req.path}`);
    return res.status(403).json({
      success: false,
      message: 'Truy cập bị từ chối. Vui lòng sử dụng ứng dụng desktop.',
      code: 'DESKTOP_ONLY'
    });
  }
  
  next();
};

module.exports = desktopOnly;
