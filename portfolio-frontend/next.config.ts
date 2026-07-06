// portfolio-frontend/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 👉 BỎ experimental.proxy HOÀN TOÀN
  // Không cần cấu hình gì thêm, Next.js tự động nhận file proxy.ts ở root
  // Các config khác (nếu có) giữ nguyên
  // Ví dụ:
  // images: {
  //   domains: ['...'],
  // },
  // reactStrictMode: true,
  // ...
};

export default nextConfig;
