"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const isUnauthorized = searchParams.get("status") === "unauthorized";
  const isSessionExpired = searchParams.get("status") === "session_expired";
  const isLoggedOut = searchParams.get("status") === "logged_out";

  // useEffect(() => {
  //   if (isLoggedOut) {
  //     toast.success("Đã đăng xuất thành công!");
  //   } else if (isSessionExpired) {
  //     toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
  //   }
  // }, [isLoggedOut, isSessionExpired]);

  useEffect(() => {
    if (isUnauthorized) {
      router.push("/auth-denied");
    }
  }, [isUnauthorized, router]);

  const handleGoogleLogin = () => {
    setLoading(true);

    // Clear all cookies before login
    if (typeof document !== "undefined") {
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    }

    window.location.href = `${API_URL}/api/auth/google`;
  };

  if (isUnauthorized) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center text-sm text-gray-500">
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* ===== ANIMATED BACKGROUND ===== */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[70%] bg-gradient-radial from-[#e94560]/15 via-transparent to-transparent rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-[-30%] right-[-20%] w-[70%] h-[70%] bg-gradient-radial from-[#ff6b6b]/10 via-transparent to-transparent rounded-full blur-3xl animate-float-slower" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] bg-gradient-radial from-[#e94560]/5 via-transparent to-transparent rounded-full blur-3xl" />
      </div>

      {/* ===== MAIN CARD ===== */}
      <div className="relative z-10 w-full max-w-md px-4">
        {/* LOGO */}
        <div className="text-center mb-10">
          <div className="inline-block relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#e94560]/20 to-[#ff6b6b]/20 blur-2xl rounded-full" />
            <h1 className="relative text-4xl font-bold tracking-tight bg-gradient-to-r from-[#e94560] via-[#ff6b6b] to-[#ff8e8e] bg-clip-text text-transparent">
              HAB CREATIVE
            </h1>
          </div>
        </div>

        {/* CARD */}
        <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8 shadow-2xl shadow-black/20 overflow-hidden">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-white/90">
                Chào mừng trở lại
              </h2>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full relative group overflow-hidden rounded-xl px-6 py-4 bg-white text-gray-800 font-medium text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />

              <span className="relative flex items-center justify-center gap-3">
                <svg
                  className="w-5 h-5 shrink-0"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>

                {loading ? (
                  <span className="flex items-center gap-2">
                    {/* <svg
                      className="animate-spin h-4 w-4 text-gray-600"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg> */}
                    Đang chuyển hướng...
                  </span>
                ) : (
                  "Đăng nhập với Google"
                )}
              </span>
            </button>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-xs text-gray-500 font-light">
                TrongBui_
              </span>
              <div className="flex-1 h-px bg-white/5" />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="text-center mt-8">
          <p className="text-[10px] text-gray-600 tracking-widest">
            <a
              href="https://bhtdev.work"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-400 transition-colors duration-200"
            >
              © Bản Quyền Thuộc Về TrongBui_
            </a>
          </p>
        </div>
      </div>

      <style jsx>{`
        .bg-gradient-radial {
          background: radial-gradient(
            ellipse at center,
            var(--tw-gradient-from) 0%,
            var(--tw-gradient-to) 100%
          );
        }
        @keyframes float-slow {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -20px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 30px) scale(0.9);
          }
        }
        @keyframes float-slower {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(-30px, 20px) scale(0.9);
          }
          66% {
            transform: translate(20px, -30px) scale(1.1);
          }
        }
        .animate-float-slow {
          animation: float-slow 20s ease-in-out infinite;
        }
        .animate-float-slower {
          animation: float-slower 25s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center text-sm text-gray-500">
          Đang tải...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
