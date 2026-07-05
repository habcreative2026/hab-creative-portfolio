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
  Chrome, // 👉 VẪN GIỮ NGUYÊN VÌ LUCIDE-REACT CÓ CHROME
} from "lucide-react";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isRequire2FA = searchParams.get("status") === "require2fa";
  const isUnauthorized = searchParams.get("status") === "unauthorized";
  const isSessionExpired = searchParams.get("status") === "session_expired";

  useEffect(() => {
    if (isSessionExpired) {
      toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
    }
  }, [isSessionExpired]);

  useEffect(() => {
    if (isUnauthorized) {
      router.push("/auth-denied");
    }
  }, [isUnauthorized, router]);

  const [overrideStep, setOverrideStep] = useState<1 | null>(null);
  const currentStep = overrideStep === 1 ? 1 : isRequire2FA ? 2 : 1;

  const handleGoogleLogin = () => {
    setLoading(true);
    setError("");
    window.location.href = `${API_URL}/api/auth/google`;
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
            {currentStep === 1
              ? "Đăng nhập để tiếp tục"
              : "Xác thực bảo mật 2 lớp"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/50 border border-white/50 p-8">
          {currentStep === 1 ? (
            // Step 1: Login with Google
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-gray-700 font-medium">
                  Đăng nhập bằng tài khoản Google
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Chỉ tài khoản được cấp quyền mới có thể truy cập
                </p>
              </div>

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
                    <Chrome className="w-5 h-5 text-indigo-600" />
                    Đăng nhập với Google
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                  </>
                )}
              </button>

              <button
                onClick={() => router.push("/")}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-slate-50 hover:bg-slate-100 rounded-2xl text-sm font-medium text-gray-600 transition-colors"
              >
                <Home className="w-4 h-4" />
                Quay về Trang chủ
              </button>
            </div>
          ) : (
            // Step 2: 2FA Verification
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

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setOverrideStep(1);
                      setError("");
                    }}
                    className="flex-1 py-3 px-4 border-2 border-gray-200 text-gray-700 rounded-2xl text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Quay lại
                  </button>
                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl text-sm font-medium shadow-sm shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-400">
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
