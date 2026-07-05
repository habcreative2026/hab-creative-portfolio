"use client";

import { useState } from "react";
import {
  Shield,
  Key,
  QrCode,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Fingerprint,
  Lock,
  Unlock,
} from "lucide-react";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface TwoFactorAuthModalProps {
  has2FA: boolean;
  onActivationSuccess: () => void;
}

export default function TwoFactorAuthModal({
  has2FA,
  onActivationSuccess,
}: TwoFactorAuthModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qrCodeImg, setQrCodeImg] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

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
    if (!has2FA && !qrCodeImg) {
      handleFetchQR();
    }
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    setError("");
  };

  return (
    <>
      <button
        onClick={handleOpenModal}
        className={`w-full flex items-center justify-between gap-3 px-5 py-3 rounded-2xl text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md ${
          has2FA
            ? "bg-emerald-50/80 border border-emerald-200 text-emerald-700 hover:bg-emerald-100/80 hover:border-emerald-300"
            : "bg-gradient-to-r from-amber-50/80 to-orange-50/80 border border-amber-200 text-amber-700 hover:from-amber-100/80 hover:to-orange-100/80 hover:border-amber-300 animate-pulse"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-xl ${
              has2FA ? "bg-emerald-100" : "bg-amber-100"
            }`}
          >
            <Shield
              size={18}
              className={has2FA ? "text-emerald-600" : "text-amber-600"}
            />
          </div>
          <div className="text-left">
            <span className="block font-semibold">Bảo mật 2 lớp</span>
            <span className="text-[10px] opacity-70">
              {has2FA ? "Đã kích hoạt" : "Chưa kích hoạt"}
            </span>
          </div>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-[10px] font-bold ${
            has2FA
              ? "bg-emerald-200 text-emerald-800"
              : "bg-amber-200 text-amber-800"
          }`}
        >
          {has2FA ? "BẬT" : "TẮT"}
        </div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
            onClick={handleCloseModal}
          />

          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="relative px-7 py-5 bg-gradient-to-r from-indigo-600 to-purple-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-lg">
                      Xác thực 2 lớp
                    </h2>
                    <p className="text-white/70 text-xs">
                      {has2FA ? "Đã được bảo vệ" : "Thiết lập bảo mật"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors text-white/70 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-7">
              {has2FA ? (
                // ✅ Đã bật 2FA
                <div className="flex flex-col items-center text-center py-6 space-y-4">
                  <div className="p-4 bg-emerald-50 rounded-full">
                    <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Tài khoản được bảo vệ
                  </h3>
                  <p className="text-sm text-gray-500 max-w-sm">
                    Mã xác thực hai lớp đang hoạt động, giúp bảo vệ tài khoản
                    của bạn an toàn hơn.
                  </p>
                  <div className="w-full bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3 text-left">
                    <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      Mỗi lần đăng nhập sẽ yêu cầu mã OTP 6 chữ số từ ứng dụng
                      Google Authenticator.
                    </p>
                  </div>
                </div>
              ) : (
                // 🔧 Chưa bật 2FA
                <div className="space-y-6">
                  {loading && !qrCodeImg ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-3">
                      <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
                      <p className="text-sm text-gray-500">
                        Đang khởi tạo mã QR...
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* QR Code */}
                      <div className="flex flex-col items-center">
                        <div className="bg-indigo-50/50 rounded-2xl p-4 w-full text-center">
                          <p className="text-xs text-indigo-800 mb-3 flex items-center justify-center gap-2">
                            <QrCode className="w-4 h-4" />
                            Quét mã QR bằng{" "}
                            <strong>Google Authenticator</strong>
                          </p>

                          {qrCodeImg && (
                            <div className="inline-block p-3 bg-white rounded-2xl border border-gray-200 shadow-sm">
                              <img
                                src={qrCodeImg}
                                alt="2FA QR"
                                className="w-44 h-44 object-contain"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* OTP Form */}
                      <form
                        onSubmit={handleVerifyAndActivate}
                        className="space-y-4 border-t border-gray-100 pt-5"
                      >
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                            <Key className="w-4 h-4 text-gray-400" />
                            Mã OTP xác nhận
                          </label>
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="0 0 0 0 0 0"
                            value={otp}
                            onChange={(e) =>
                              setOtp(e.target.value.replace(/\D/g, ""))
                            }
                            className="w-full text-center font-mono tracking-[0.5em] text-2xl py-3.5 rounded-2xl border border-gray-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none shadow-sm transition-all"
                            required
                            autoFocus
                          />
                        </div>

                        {error && (
                          <div className="flex items-start gap-2.5 p-3 bg-red-50 rounded-2xl border border-red-100">
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <span className="text-sm text-red-700">
                              {error}
                            </span>
                          </div>
                        )}

                        <div className="flex gap-3 pt-2">
                          <button
                            type="button"
                            onClick={handleCloseModal}
                            className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 rounded-2xl text-sm font-medium hover:bg-gray-50 transition-colors"
                          >
                            Để sau
                          </button>
                          <button
                            type="submit"
                            disabled={loading || otp.length !== 6}
                            className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl text-sm font-medium shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {loading && (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            )}
                            Kích hoạt
                          </button>
                        </div>
                      </form>
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
