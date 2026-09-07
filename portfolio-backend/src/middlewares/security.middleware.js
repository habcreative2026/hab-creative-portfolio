// backend/middlewares/security.middleware.js

const validateGoogleCallback = (req, res, next) => {
  const { code, iss } = req.query;
  
  // 1. Kiểm tra có code không
  if (!code) {
    console.warn(`🚫 [Security] No code in callback`);
    return res.redirect(`${process.env.CLIENT_URL}/auth-denied?reason=no_code`);
  }
  
  // 2. Kiểm tra issuer (iss) phải là Google
  if (iss && !iss.includes('accounts.google.com')) {
    console.warn(`🚫 [Security] Invalid issuer: ${iss}`);
    return res.redirect(`${process.env.CLIENT_URL}/auth-denied?reason=invalid_issuer`);
  }
  
  // 3. Loại bỏ các tham số lạ
  const allowedParams = ['code', 'scope', 'authuser', 'prompt', 'iss'];
  const suspiciousParams = Object.keys(req.query).filter(
    key => !allowedParams.includes(key)
  );
  
  if (suspiciousParams.length > 0) {
    console.warn(`🚫 [Security] Suspicious params: ${suspiciousParams.join(', ')}`);
    return res.redirect(`${process.env.CLIENT_URL}/auth-denied?reason=suspicious_params`);
  }
  
  next();
};

module.exports = { validateGoogleCallback };
