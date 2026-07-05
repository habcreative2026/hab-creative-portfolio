"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Home,
  Shield,
  Key,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Globe,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [copied, setCopied] = useState(false);

  const isRequire2FA = searchParams.get("status") === "require2fa";
  const isUnauthorized = searchParams.get("status") === "unauthorized";
  const isWaiting = searchParams.get("status") === "waiting";
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  // Tạo URL redirect
  const redirectUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/admin/dashboard`;

  // KIỂM TRA CÓ PHẢI DESKTOP APP KHÔNG
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent;
      const isElectron = userAgent.includes('Electron') || userAgent.includes('Portfolio');
      setIsDesktop(isElectron);
    }
  }, []);

  // LẮNG NGHE SỰ KIỆN TỪ MAIN PROCESS (DESKTOP APP)
  useEffect(() => {
    if (typeof window !== 'undefined' && isDesktop) {
      const electronAPI = (window as any).electronAPI;
      
      if (electronAPI && electronAPI.onOpenBrowserLogin) {
        const unsubscribe = electronAPI.onOpenBrowserLogin((data: any) => {
          console.log('[Login] Received open browser event:', data);
        });
        return unsubscribe;
      }
    }
  }, [isDesktop]);

  // NẾU LÀ DESKTOP APP VÀ ĐANG Ở TRẠNG THÁI WAITING -> MỞ TRÌNH DUYỆT
  useEffect(() => {
    if (isDesktop && isWaiting && typeof window !== 'undefined') {
      console.log('[Login] Desktop app - opening browser for Google login');
      
      const electronAPI = (window as any).electronAPI;
      if (electronAPI && electronAPI.openBrowserLogin) {
        electronAPI.openBrowserLogin();
      } else {
        window.open(`${API_URL}/api/auth/google`, '_blank');
      }
    }
  }, [isDesktop, isWaiting]);

  useEffect(() => {
    if (isUnauthorized) {
      router.push("/auth-denied");
    }
  }, [isUnauthorized, router]);

  const handleGoogleLogin = () => {
    setLoading(true);
    setError("");
    
    if (isDesktop && typeof window !== 'undefined') {
      const electronAPI = (window as any).electronAPI;
      if (electronAPI && electronAPI.openBrowserLogin) {
        electronAPI.openBrowserLogin();
      } else {
        window.open(`${API_URL}/api/auth/google`, '_blank');
      }
    } else {
      window.location.href = `${API_URL}/api/auth/google`;
    }
  };

  const handleCopyRedirectUrl = async () => {
    try {
      await navigator.clipboard.writeText(redirectUrl);
      setCopied(true);
      toast.success("Đã copy URL redirect!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Không thể copy URL");
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6 || isNaN(Number(otp))) {
      setError("Mã OTP phải bao gồm 6 chữ số.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/auth/verify-2fa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: otp }),
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Xác thực 2FA thành công!");
        router.push("/admin/dashboard");
      } else {
        setError(data.message || "Mã OTP không chính xác hoặc đã hết hạn.");
        toast.error(data.message || "Mã OTP không chính xác!");
      }
    } catch (err) {
      setError("Đã có lỗi xảy ra khi kết nối đến máy chủ.");
      toast.error("Lỗi kết nối máy chủ!");
    } finally {
      setLoading(false);
    }
  };

  if (isUnauthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white/60 text-sm font-mono animate-pulse">
          Đang kiểm tra quyền truy cập...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/25 mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">HAB Creative</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isRequire2FA ? "Xác thực bảo mật 2 lớp" : "Đăng nhập để tiếp tục"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/50 border border-white/50 p-8">
          {isRequire2FA ? (
            // FORM OTP 2FA
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-50 rounded-2xl mb-3">
                  <Key className="w-7 h-7 text-amber-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Xác thực 2 lớp
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Nhập mã OTP từ Google Authenticator
                </p>
                {email && (
                  <p className="text-xs text-gray-400 mt-2">
                    👤 {email}
                  </p>
                )}
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã bảo mật OTP
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="0 0 0 0 0 0"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full text-center tracking-[0.6em] font-mono text-2xl py-4 px-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 focus:bg-white outline-none transition-all"
                    disabled={loading}
                    required
                    autoFocus
                  />
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    Mã có hiệu lực trong 5 phút
                  </p>
                </div>

                {error && (
                  <div className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-100 rounded-2xl">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl text-sm font-medium shadow-sm shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang xác thực...
                    </>
                  ) : (
                    <>
                      Xác nhận
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            // FORM ĐĂNG NHẬP - HIỂN THỊ 3 NÚT
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-700 font-medium">
                  Đăng nhập bằng tài khoản Google
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {isDesktop 
                    ? "Nhấn nút bên dưới để mở trình duyệt đăng nhập" 
                    : "Chỉ tài khoản được cấp quyền mới có thể truy cập"}
                </p>
              </div>

              {/* ✅ NÚT 1: ĐĂNG NHẬP VỚI GOOGLE */}
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-4 py-3.5 px-6 bg-white border-2 border-gray-200 rounded-2xl text-sm font-semibold text-gray-700 shadow-sm hover:shadow-md hover:border-gray-300 focus:ring-4 focus:ring-indigo-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                    Đang chuyển hướng...
                  </>
                ) : (
                  <>
                    <Globe className="w-5 h-5 text-indigo-600" />
                    {isDesktop ? "Đăng nhập với Google (Mở trình duyệt)" : "Đăng nhập với Google →"}
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                  </>
                )}
              </button>

              {/* ✅ NÚT 2: COPY URL REDIRECT - NÚT MỚI */}
              <div className="relative">
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex-1 px-2 py-1">
                    <p className="text-xs text-gray-500 truncate font-mono">
                      {redirectUrl}
                    </p>
                  </div>
                  <button
                    onClick={handleCopyRedirectUrl}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-lg text-xs font-medium text-gray-600 hover:text-indigo-600 transition-all duration-200 shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-500" />
                        <span className="text-green-500">Đã copy</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5 text-center">
                  <ExternalLink className="w-3 h-3 inline mr-1" />
                  Dán URL này vào trình duyệt để redirect sau khi đăng nhập
                </p>
              </div>

              {/* ✅ NÚT 3: QUAY VỀ TRANG CHỦ */}
              <button
                onClick={() => router.push("/")}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-slate-50 hover:bg-slate-100 rounded-2xl text-sm font-medium text-gray-600 transition-colors"
              >
                <Home className="w-4 h-4" />
                Quay về Trang chủ
              </button>

              {/* 👉 HIỂN THỊ THÊM THÔNG BÁO KHI CHƯA CÓ QUYỀN */}
              {!isDesktop && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <p className="text-xs text-amber-700 text-center flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Chỉ tài khoản đã được cấp quyền mới có thể đăng nhập
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
            <Shield className="w-3 h-3" />
            Bảo mật 2 lớp • Phiên bản 1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
          <div className="text-white/60 text-sm font-mono animate-pulse">
            Đang tải...
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
