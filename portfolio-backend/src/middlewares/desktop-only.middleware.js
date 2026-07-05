const desktopOnly = (req, res, next) => {
  const userAgent = req.headers['user-agent'] || '';
  
  const isElectron = userAgent.includes('Electron') || 
                      userAgent.includes('Portfolio App') ||
                      req.headers['x-desktop-app'] === 'true';
  
  if (req.path.includes('/login') || req.path.includes('/auth')) {
    return next();
  }
  if (!isElectron) {
    console.log(`[Security]Blocked access from browser: ${userAgent}`);
    return res.status(403).json({
      success: false,
      message: 'Truy cập bị từ chối. Vui lòng sử dụng ứng dụng desktop.',
      code: 'DESKTOP_ONLY'
    });
  }
  
  next();
};

module.exports = desktopOnly;
