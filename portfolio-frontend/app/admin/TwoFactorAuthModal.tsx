"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  KeyRound,
  QrCode,
  RefreshCw,
  X,
  CheckCircle2,
  ShieldAlert,
  Smartphone,
  Lock,
} from "lucide-react";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface TwoFactorAuthModalProps {
  has2FA: boolean;
  onActivationSuccess: () => void;
  isSidebarOpen?: boolean;
}

export default function TwoFactorAuthModal({
  has2FA,
  onActivationSuccess,
  isSidebarOpen = true,
}: TwoFactorAuthModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qrCodeImg, setQrCodeImg] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState<"init" | "qr" | "verify">("init");

  useEffect(() => {
    if (isOpen && !has2FA) {
      setStep("init");
      setQrCodeImg("");
      setSecretKey("");
      setOtp("");
      setError("");
      handleFetchQR();
    }
  }, [isOpen, has2FA]);

  const handleFetchQR = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/auth/setup-2fa`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();

      if (res.status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
        setIsOpen(false);
        return;
      }

      if (res.ok && data.success) {
        setQrCodeImg(data.qrCode);
        setSecretKey(data.secret);
        setStep("qr");
        toast.success("Đã tạo mã QR thành công!");
      } else {
        setError(data.message || "Không thể lấy mã QR Code.");
        toast.error(data.message || "Lỗi tạo mã QR!");
      }
    } catch (err) {
      setError("Lỗi kết nối đến máy chủ.");
      toast.error("Lỗi kết nối máy chủ!");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Vui lòng nhập đủ 6 chữ số!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/auth/activate-2fa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: otp, secret: secretKey }),
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Kích hoạt 2FA thành công!");
        onActivationSuccess();
        setQrCodeImg("");
        setOtp("");
        setStep("init");
        setIsOpen(false);
      } else {
        setError(data.message || "Mã OTP không chính xác.");
        toast.error(data.message || "Mã OTP không chính xác!");
      }
    } catch (err) {
      setError("Lỗi kết nối xác thực.");
      toast.error("Lỗi kết nối máy chủ!");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setIsOpen(true);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    setError("");
    setStep("init");
    setOtp("");
  };

  return (
    <>
      <button
        onClick={handleOpenModal}
        className={`
          w-full flex items-center gap-2 rounded-xl text-sm font-medium border transition-all duration-200
          ${isSidebarOpen ? "px-4 py-2.5 justify-between" : "px-2 py-2.5 justify-center"}
          ${
            has2FA
              ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
              : "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
          }
        `}
        title={!isSidebarOpen ? (has2FA ? "2FA: Đã bật" : "2FA: Chưa bật") : ""}
      >
        <div className="flex items-center gap-2">
          <ShieldCheck
            size={16}
            className={has2FA ? "text-emerald-600" : "text-amber-600 shrink-0"}
          />
          {isSidebarOpen && <span>Bảo mật 2FA</span>}
        </div>
        {isSidebarOpen && (
          <span
            className={`
              text-[11px] px-2 py-0.5 rounded-md font-semibold
              ${
                has2FA
                  ? "bg-emerald-200 text-emerald-800"
                  : "bg-amber-200 text-amber-800"
              }
            `}
          >
            {has2FA ? "Đã bật" : "Chưa bật"}
          </span>
        )}
      </button>

      {/* ⭐ Modal - center màn hình với z-index cao */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseModal}
          />

          {/* Modal content */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-md overflow-hidden relative z-10 transform scale-100 transition-all duration-300 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Lock size={18} className="text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    Xác thực hai lớp
                  </h3>
                  <p className="text-[10px] text-gray-500">
                    {has2FA ? "Đã kích hoạt" : "Thiết lập bảo mật"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {has2FA ? (
                <div className="flex flex-col items-center text-center py-6 space-y-4">
                  <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full">
                    <CheckCircle2 size={48} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg">
                      Tài khoản được bảo vệ
                    </h4>
                    <p className="text-sm text-gray-500 mt-1 max-w-xs">
                      Xác thực hai lớp (2FA) đang hoạt động trên tài khoản của
                      bạn.
                    </p>
                  </div>
                  <div className="w-full bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl flex gap-3 text-left">
                    <ShieldCheck
                      size={18}
                      className="text-emerald-600 shrink-0 mt-0.5"
                    />
                    <div className="text-xs text-emerald-800 space-y-1">
                      <p className="font-medium">Bảo mật nâng cao</p>
                      <p className="text-emerald-700/80">
                        Hệ thống sẽ yêu cầu mã OTP 6 chữ số từ Google
                        Authenticator mỗi lần đăng nhập.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {loading && !qrCodeImg && step === "init" ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-3">
                      <RefreshCw
                        size={32}
                        className="animate-spin text-indigo-600"
                      />
                      <p className="text-sm text-gray-500">
                        Đang khởi tạo mã QR...
                      </p>
                    </div>
                  ) : (
                    <>
                      {step === "qr" && qrCodeImg && (
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-2 mb-2">
                            <Smartphone size={16} className="text-indigo-600" />
                            <span className="text-xs font-medium text-gray-700">
                              Quét mã QR với Google Authenticator
                            </span>
                          </div>
                          <div className="p-3 bg-white border-2 border-indigo-100 rounded-xl shadow-inner">
                            <img
                              src={qrCodeImg}
                              alt="2FA QR Code"
                              className="w-44 h-44 object-contain"
                            />
                          </div>
                          <div className="mt-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-[10px] text-gray-500 font-mono truncate max-w-[200px]">
                              Secret: {secretKey.substring(0, 16)}...
                            </p>
                          </div>
                        </div>
                      )}

                      <form
                        onSubmit={handleVerifyAndActivate}
                        className="space-y-4 border-t border-gray-100 pt-4"
                      >
                        <div>
                          <label
                            htmlFor="modal-otp"
                            className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1.5"
                          >
                            <KeyRound size={14} className="text-gray-400" />
                            <span>Nhập mã OTP xác nhận (6 chữ số)</span>
                          </label>
                          <input
                            id="modal-otp"
                            type="text"
                            maxLength={6}
                            placeholder="0 0 0 0 0 0"
                            value={otp}
                            onChange={(e) =>
                              setOtp(e.target.value.replace(/\D/g, ""))
                            }
                            className="w-full text-center font-mono tracking-[0.4em] text-xl py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none shadow-sm transition-all"
                            required
                            autoFocus
                            disabled={loading}
                          />
                          <p className="text-[10px] text-gray-400 mt-1.5 text-center">
                            Mã OTP được tạo từ ứng dụng Google Authenticator
                          </p>
                        </div>

                        {error && (
                          <div className="p-3 bg-red-50 text-red-700 border border-red-100 rounded-xl text-xs flex gap-2 items-start">
                            <ShieldAlert
                              size={14}
                              className="shrink-0 mt-0.5"
                            />
                            <span>{error}</span>
                          </div>
                        )}

                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={handleCloseModal}
                            className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                          >
                            Để sau
                          </button>
                          <button
                            type="submit"
                            disabled={loading || otp.length !== 6}
                            className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-sm font-medium shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {loading && (
                              <RefreshCw size={14} className="animate-spin" />
                            )}
                            <span>Kích hoạt</span>
                          </button>
                        </div>
                      </form>

                      <div className="mt-2 p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                        <p className="text-[10px] text-blue-700 flex items-center gap-2">
                          <QrCode size={14} className="shrink-0" />
                          <span>
                            Chưa có Google Authenticator? Tải từ{" "}
                            <a
                              href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline hover:text-blue-800"
                            >
                              Play Store
                            </a>{" "}
                            hoặc{" "}
                            <a
                              href="https://apps.apple.com/app/google-authenticator/id388497605"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline hover:text-blue-800"
                            >
                              App Store
                            </a>
                          </span>
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
