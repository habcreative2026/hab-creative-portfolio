// backend/middlewares/auth.middleware.js

const jwt = require("jsonwebtoken");

const OWNER_EMAIL = "buihaitrong.dev@gmail.com";

const authMiddleware = (req, res, next) => {
  try {
    // ⭐ Ưu tiên lấy token từ header Authorization (Desktop)
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    // ⭐ Fallback: lấy từ cookie (Web)
    if (!token) {
      token = req.cookies.auth_token;
    }

    if (!token) {
      console.log("[Auth Middleware]: Không tìm thấy token.");
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Vui lòng đăng nhập.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      ...decoded,
      id: decoded.id || decoded._id,
      _id: decoded._id || decoded.id,
    };

    console.log(
      "[Auth Middleware]: ✅ Xác thực thành công cho email:",
      req.user.email,
      "Role:",
      req.user.role,
    );
    next();
  } catch (error) {
    console.error("[Auth Middleware]: Token không hợp lệ:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token đã hết hạn. Vui lòng đăng nhập lại.",
        code: "TOKEN_EXPIRED",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ.",
      code: "INVALID_TOKEN",
    });
  }
};

authMiddleware.isSuperAdmin = (req, res, next) => {
  if (req.user.role !== "super_admin") {
    return res.status(403).json({
      success: false,
      message: "Bạn không có quyền thực hiện hành động này. Chỉ Super Admin mới được phép.",
    });
  }
  next();
};

authMiddleware.isAdmin = (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "super_admin") {
    return res.status(403).json({
      success: false,
      message: "Bạn không có quyền thực hiện hành động này. Chỉ Admin mới được phép.",
    });
  }
  next();
};

authMiddleware.isOwner = (req, res, next) => {
  if (req.user.email.toLowerCase() !== OWNER_EMAIL.toLowerCase()) {
    return res.status(403).json({
      success: false,
      message: "Chỉ Owner mới có quyền thực hiện hành động này!",
    });
  }
  next();
};

authMiddleware.is2FAVerified = (req, res, next) => {
  if (req.user.isPending2FA) {
    return res.status(403).json({
      success: false,
      message: "Vui lòng hoàn thành xác thực 2FA trước khi tiếp tục.",
      code: "2FA_REQUIRED",
    });
  }
  next();
};

module.exports = authMiddleware;
