// frontend/app/admin/login/page.tsx

"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const isRequire2FA = searchParams.get("status") === "require2fa";
  const isUnauthorized = searchParams.get("status") === "unauthorized";
  const isSessionExpired = searchParams.get("status") === "session_expired";

  // ⭐ Detect desktop app
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.electronAPI) {
        setIsDesktop(true);
        console.log("✅ Running in Electron desktop app");
      }
    }
  }, []);

  // ⭐ Desktop: check if already authenticated
  useEffect(() => {
    if (isDesktop && window.electronAPI) {
      window.electronAPI
        .getAuthToken()
        .then((token) => {
          if (token) {
            router.push("/admin/dashboard");
          }
        })
        .catch(() => {
          // Ignore error
        });
    }
  }, [isDesktop, router]);

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

    if (isDesktop && window.electronAPI) {
      window.electronAPI.openBrowserLogin();
      pollAuthStatus();
    } else {
      window.location.href = `${API_URL}/api/auth/google`;
    }
  };

  const pollAuthStatus = () => {
    let attempts = 0;
    const maxAttempts = 30;

    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/me`, {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            router.push("/admin/dashboard");
            return;
          }
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkAuth, 2000);
        } else {
          setLoading(false);
          toast.error("Không thể xác thực. Vui lòng thử lại.");
        }
      } catch (error) {
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkAuth, 2000);
        }
      }
    };

    setTimeout(checkAuth, 3000);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-sm text-gray-500">
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative antialiased text-gray-900">
      <div className="sm:mx-auto w-full max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl border border-gray-100 rounded-2xl sm:px-10">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="mt-2 text-lg text-black font-bold">
                  {isDesktop
                    ? "Đăng nhập bằng Google qua trình duyệt"
                    : "Vui lòng đăng nhập bằng tài khoản Google được cấp quyền."}
                </p>
                {isDesktop && (
                  <p className="text-sm text-gray-500 mt-2">
                    Trình duyệt sẽ mở để bạn đăng nhập. Sau khi đăng nhập, quay
                    lại ứng dụng.
                  </p>
                )}
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 rounded-xl bg-white border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 transition-all"
              >
                {loading ? "Đang chuyển hướng..." : "Đăng nhập với Google"}
              </button>
              <button
                onClick={() => router.push("/")}
                className="w-full flex items-center justify-center gap-3 rounded-xl bg-white border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 transition-all"
              >
                <span>Quay về Trang chủ</span>
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                  Xác thực 2 Lớp (2FA)
                </h1>
                <p className="mt-2 text-sm text-gray-500">
                  Nhập mã xác thực gồm 6 chữ số từ ứng dụng Google Authenticator
                  của bạn.
                </p>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <label
                    htmlFor="otp"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Mã bảo mật OTP
                  </label>
                  <input
                    id="otp"
                    type="text"
                    maxLength={6}
                    placeholder="0 0 0 0 0 0"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full text-center tracking-[0.5em] font-mono text-xl rounded-xl border border-gray-300 px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    disabled={loading}
                    required
                    autoFocus
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">
                    {error}
                  </p>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setOverrideStep(1);
                      setError("");
                    }}
                    className="py-2.5 px-4 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Quay lại
                  </button>
                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="flex-1 py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                  >
                    {loading ? "Đang xác thực..." : "Xác nhận"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center text-sm text-gray-500">
          Đang tải...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
