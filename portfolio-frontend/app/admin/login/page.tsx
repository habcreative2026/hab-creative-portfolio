// "use client";

// import { useState, Suspense, useEffect } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import toast from "react-hot-toast";

// const API_URL = process.env.NEXT_PUBLIC_API_URL;

// function LoginContent() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const [otp, setOtp] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const isRequire2FA = searchParams.get("status") === "require2fa";
//   const isUnauthorized = searchParams.get("status") === "unauthorized";
//   const isSessionExpired = searchParams.get("status") === "session_expired";
//   const isLoggedOut = searchParams.get("status") === "logged_out";

//   useEffect(() => {
//     if (isLoggedOut) {
//       toast.success("Đã đăng xuất thành công!");
//     } else if (isSessionExpired) {
//       toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
//     }
//   }, [isLoggedOut, isSessionExpired]);

//   useEffect(() => {
//     if (isUnauthorized) {
//       router.push("/auth-denied");
//     }
//   }, [isUnauthorized, router]);

//   const [overrideStep, setOverrideStep] = useState<1 | null>(null);
//   const currentStep = overrideStep === 1 ? 1 : isRequire2FA ? 2 : 1;

//   const handleGoogleLogin = () => {
//     setLoading(true);
//     setError("");

//     if (typeof document !== "undefined") {
//       document.cookie.split(";").forEach((c) => {
//         document.cookie = c
//           .replace(/^ +/, "")
//           .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
//       });
//     }

//     window.location.href = `${API_URL}/api/auth/google`;
//   };

//   const handleVerifyOTP = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (otp.length !== 6 || isNaN(Number(otp))) {
//       setError("Mã OTP phải bao gồm 6 chữ số.");
//       return;
//     }

//     setLoading(true);
//     setError("");

//     try {
//       const res = await fetch(`${API_URL}/api/auth/verify-2fa`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ token: otp }),
//         credentials: "include",
//       });

//       const data = await res.json();

//       if (res.ok && data.success) {
//         toast.success("Xác thực 2FA thành công!");
//         router.push("/admin/dashboard");
//       } else {
//         setError(data.message || "Mã OTP không chính xác hoặc đã hết hạn.");
//         toast.error(data.message || "Mã OTP không chính xác!");
//       }
//     } catch (err) {
//       setError("Đã có lỗi xảy ra khi kết nối đến máy chủ.");
//       toast.error("Lỗi kết nối máy chủ!");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (isUnauthorized) {
//     return (
//       <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center text-sm text-gray-500">
//         Đang kiểm tra quyền truy cập...
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center p-4">
//       {/* Background glow */}
//       <div className="fixed inset-0 pointer-events-none overflow-hidden">
//         <div className="absolute top-[-30%] left-[-20%] w-[60%] h-[60%] bg-gradient-radial from-[#e94560]/10 via-transparent to-transparent rounded-full blur-3xl" />
//         <div className="absolute bottom-[-30%] right-[-20%] w-[60%] h-[60%] bg-gradient-radial from-[#ff6b6b]/5 via-transparent to-transparent rounded-full blur-3xl" />
//       </div>

//       <div className="relative z-10 w-full max-w-md px-4">
//         <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
//           {currentStep === 1 && (
//             <div className="space-y-6">
//               <button
//                 onClick={handleGoogleLogin}
//                 disabled={loading}
//                 className="w-full relative flex items-center justify-center gap-3 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-gray-700 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden"
//               >
//                 {/* Hover glow */}
//                 <span className="absolute inset-0 bg-gradient-to-r from-[#e94560]/10 to-[#ff6b6b]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

//                 {/* Google SVG Icon - động */}
//                 <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                   <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
//                   <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
//                   <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
//                   <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
//                 </svg>

//                 <span className="relative z-10">
//                   {loading ? (
//                     <span className="flex items-center gap-2">
//                       <svg className="animate-spin h-4 w-4 text-gray-600" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
//                       </svg>
//                       Đang chuyển hướng...
//                     </span>
//                   ) : (
//                     "Đăng nhập với Google"
//                   )}
//                 </span>
//               </button>
//             </div>
//           )}

//           {currentStep === 2 && (
//             <div className="space-y-6">
//               <div className="text-center">
//                 <h2 className="text-xl font-bold text-white">Xác thực 2 lớp</h2>
//                 <p className="text-sm text-gray-400 mt-1">
//                   Nhập mã từ ứng dụng Google Authenticator
//                 </p>
//               </div>

//               <form onSubmit={handleVerifyOTP} className="space-y-4">
//                 <div>
//                   <label htmlFor="otp" className="block text-xs font-medium text-gray-400 mb-1.5">
//                     Mã OTP (6 chữ số)
//                   </label>
//                   <div className="relative">
//                     <input
//                       id="otp"
//                       type="text"
//                       maxLength={6}
//                       placeholder="0 0 0 0 0 0"
//                       value={otp}
//                       onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
//                       className="w-full text-center tracking-[0.5em] font-mono text-2xl py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all duration-200"
//                       disabled={loading}
//                       required
//                       autoFocus
//                     />
//                     <div className="absolute inset-0 rounded-xl pointer-events-none bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 opacity-0 focus-within:opacity-100 transition-opacity duration-500" />
//                   </div>
//                   <p className="text-[10px] text-gray-500 mt-2 text-center">
//                     Mã được tạo từ ứng dụng Google Authenticator
//                   </p>
//                 </div>

//                 {error && (
//                   <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
//                     <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>
//                     <span>{error}</span>
//                   </div>
//                 )}

//                 <div className="flex gap-3 pt-2">
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setOverrideStep(1);
//                       setError("");
//                     }}
//                     className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 text-sm font-medium hover:bg-white/5 hover:text-white transition-all duration-200"
//                   >
//                     Quay lại
//                   </button>
//                   <button
//                     type="submit"
//                     disabled={loading || otp.length !== 6}
//                     className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-sm font-medium shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//                   >
//                     {loading ? (
//                       <>
//                         <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
//                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
//                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
//                         </svg>
//                         Xác thực...
//                       </>
//                     ) : (
//                       "Xác nhận"
//                     )}
//                   </button>
//                 </div>
//               </form>
//             </div>
//           )}
//         </div>

//         {/* Footer */}
//         <div className="text-center mt-8">
//           <p className="text-[10px] text-gray-600 tracking-widest">
//             <a href="https://bhtdev.work" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 transition-colors">
//               © Bản Quyền Thuộc Về TrongBui_
//             </a>
//           </p>
//         </div>
//       </div>

//       {/* CSS gradient radial */}
//       <style jsx>{`
//         .bg-gradient-radial {
//           background: radial-gradient(ellipse at center, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 100%);
//         }
//       `}</style>
//     </div>
//   );
// }

// export default function LoginPage() {
//   return (
//     <Suspense
//       fallback={
//         <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center text-sm text-gray-500">
//           Đang tải...
//         </div>
//       }
//     >
//       <LoginContent />
//     </Suspense>
//   );
// }

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

  const isRequire2FA = searchParams.get("status") === "require2fa";
  const isUnauthorized = searchParams.get("status") === "unauthorized";
  const isSessionExpired = searchParams.get("status") === "session_expired";
  const isLoggedOut = searchParams.get("status") === "logged_out";

  useEffect(() => {
    if (isLoggedOut) {
      toast.success("Đã đăng xuất thành công!");
    } else if (isSessionExpired) {
      toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
    }
  }, [isLoggedOut, isSessionExpired]);

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

    if (typeof document !== "undefined") {
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    }

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
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center text-sm text-gray-500">
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* ===== ANIMATED BACKGROUND ===== */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Orb 1 */}
        <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[70%] bg-gradient-radial from-[#e94560]/15 via-transparent to-transparent rounded-full blur-3xl animate-float-slow" />
        {/* Orb 2 */}
        <div className="absolute bottom-[-30%] right-[-20%] w-[70%] h-[70%] bg-gradient-radial from-[#ff6b6b]/10 via-transparent to-transparent rounded-full blur-3xl animate-float-slower" />
        {/* Orb 3 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] bg-gradient-radial from-[#e94560]/5 via-transparent to-transparent rounded-full blur-3xl" />

        {/* Floating particles */}
        <div className="absolute top-[20%] left-[10%] w-1 h-1 bg-white/20 rounded-full animate-pulse" />
        <div className="absolute top-[60%] right-[15%] w-2 h-2 bg-white/10 rounded-full animate-pulse delay-300" />
        <div className="absolute bottom-[30%] left-[25%] w-1.5 h-1.5 bg-white/15 rounded-full animate-pulse delay-700" />
        <div className="absolute top-[40%] right-[30%] w-1 h-1 bg-white/10 rounded-full animate-pulse delay-500" />
        <div className="absolute bottom-[20%] right-[40%] w-0.5 h-0.5 bg-white/20 rounded-full animate-pulse delay-1000" />
      </div>

      {/* ===== MAIN CARD ===== */}
      <div className="relative z-10 w-full max-w-md px-4">
        {/* ===== LOGO ===== */}
        <div className="text-center mb-10">
          <div className="inline-block relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#e94560]/20 to-[#ff6b6b]/20 blur-2xl rounded-full" />
            <h1 className="relative text-4xl font-bold tracking-tight bg-gradient-to-r from-[#e94560] via-[#ff6b6b] to-[#ff8e8e] bg-clip-text text-transparent">
              HAB CREATIVE
            </h1>
          </div>
          <p className="text-xs text-gray-500 tracking-[0.3em] uppercase mt-2 font-light">
            Studio
          </p>
        </div>

        {/* ===== CARD ===== */}
        <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8 shadow-2xl shadow-black/20 overflow-hidden">
          {/* Card gradient border glow */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div
              className={`w-2 h-2 rounded-full transition-all duration-300 ${currentStep === 1 ? "bg-[#e94560] w-6" : "bg-white/20"}`}
            />
            <div
              className={`w-2 h-2 rounded-full transition-all duration-300 ${currentStep === 2 ? "bg-[#e94560] w-6" : "bg-white/20"}`}
            />
          </div>

          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-white/90">
                  Chào mừng trở lại
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Đăng nhập để tiếp tục quản lý
                </p>
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full relative group overflow-hidden rounded-xl px-6 py-4 bg-white text-gray-800 font-medium text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {/* Hover shimmer */}
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
                      <svg
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
                      </svg>
                      Đang chuyển hướng...
                    </span>
                  ) : (
                    "Đăng nhập với Google"
                  )}
                </span>
              </button>

              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-xs text-gray-500 font-light">hoặc</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>

              <button
                onClick={() => {
                  setOverrideStep(1);
                  setError("");
                }}
                className="w-full text-center text-sm text-gray-500 hover:text-white/70 transition-colors duration-200"
              >
                Quay lại trang đăng nhập
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-indigo-500/20 to-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  <svg
                    className="w-6 h-6 text-indigo-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-white/90">
                  Xác thực 2 lớp
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Nhập mã từ ứng dụng{" "}
                  <span className="text-indigo-400">Google Authenticator</span>
                </p>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <label
                    htmlFor="otp"
                    className="block text-xs font-medium text-gray-400 mb-2"
                  >
                    Mã OTP (6 chữ số)
                  </label>
                  <div className="relative">
                    <input
                      id="otp"
                      type="text"
                      maxLength={6}
                      placeholder="• • • • • •"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, ""))
                      }
                      className="w-full text-center tracking-[0.5em] font-mono text-2xl py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all duration-300 disabled:opacity-50"
                      disabled={loading}
                      required
                      autoFocus
                    />
                    {/* OTP input glow */}
                    <div className="absolute inset-0 rounded-xl pointer-events-none bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 opacity-0 focus-within:opacity-100 transition-opacity duration-500" />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-3 text-center">
                    Mã được tạo từ ứng dụng Google Authenticator
                  </p>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2.5">
                    <svg
                      className="w-4 h-4 shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOverrideStep(1);
                      setError("");
                    }}
                    className="flex-1 py-3.5 rounded-xl border border-white/10 text-gray-400 text-sm font-medium hover:bg-white/5 hover:text-white/90 transition-all duration-200"
                  >
                    Quay lại
                  </button>
                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-sm font-medium shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4"
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
                        </svg>
                        Xác thực...
                      </>
                    ) : (
                      "Xác nhận"
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* ===== FOOTER ===== */}
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

      {/* ===== CSS ===== */}
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
        .animate-pulse {
          animation: pulse 3s ease-in-out infinite;
        }
        .delay-300 {
          animation-delay: 300ms;
        }
        .delay-500 {
          animation-delay: 500ms;
        }
        .delay-700 {
          animation-delay: 700ms;
        }
        .delay-1000 {
          animation-delay: 1000ms;
        }
        @keyframes pulse {
          0%,
          100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.5);
          }
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
