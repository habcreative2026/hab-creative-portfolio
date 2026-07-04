// frontend/app/admin/components/TwoFactorAuthModal.tsx

"use client";

import { useState } from "react";
import {
  ShieldCheck,
  KeyRound,
  QrCode,
  RefreshCw,
  X,
  CheckCircle2,
  ShieldAlert,
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

      // ⭐ SỬA: Xử lý lỗi 401
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
        className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${
          has2FA
            ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
            : "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 animate-pulse"
        }`}
      >
        <div className="flex items-center gap-2">
          <ShieldCheck
            size={16}
            className={has2FA ? "text-emerald-600" : "text-amber-600"}
          />
          <span>Bảo mật 2FA</span>
        </div>
        <span
          className={`text-[11px] px-2 py-0.5 rounded-md font-semibold ${
            has2FA
              ? "bg-emerald-200 text-emerald-800"
              : "bg-amber-200 text-amber-800"
          }`}
        >
          {has2FA ? "Đã bật" : "Chưa bật"}
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            onClick={handleCloseModal}
          />

          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-md overflow-hidden relative z-10 transform scale-100 transition-all duration-300 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2.5">
                <div>
                  <p className="text-[11px] text-gray-500">
                    Cấu hình bảo mật (2FA)
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              {has2FA ? (
                <div className="flex flex-col items-center text-center py-4 space-y-3">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full">
                    <CheckCircle2 size={44} />
                  </div>
                  <h4 className="font-semibold text-gray-900 text-lg">
                    Tài khoản được bảo vệ
                  </h4>
                  <p className="text-sm text-gray-500 max-w-xs">
                    Mã xác thực hai lớp (2FA) đang hoạt động ổn định trên tài
                    khoản của bạn.
                  </p>
                  <div className="w-full bg-emerald-50/50 border border-emerald-100 p-3 rounded-xl flex gap-2 text-left mt-2">
                    <ShieldCheck
                      size={16}
                      className="text-emerald-600 shrink-0 mt-0.5"
                    />
                    <span className="text-xs text-emerald-800">
                      Hệ thống sẽ tự động yêu cầu mã OTP gồm 6 chữ số từ thiết
                      bị di động trong mỗi lần đăng nhập tiếp theo.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {loading && !qrCodeImg ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-2">
                      <RefreshCw
                        size={24}
                        className="animate-spin text-indigo-600"
                      />
                      <p className="text-xs text-gray-500">
                        Đang khởi tạo mã QR...
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col items-center text-center">
                        <p className="text-xs text-gray-600 mb-4 bg-indigo-50/50 text-indigo-800 border border-indigo-100 px-3 py-2 rounded-xl">
                          Quét mã QR dưới đây bằng phần mềm{" "}
                          <strong>Google Authenticator</strong> trên thiết bị
                          của bạn.
                        </p>

                        {qrCodeImg && (
                          <div className="p-2.5 bg-white border border-gray-200 rounded-xl shadow-inner">
                            <img
                              src={qrCodeImg}
                              alt="2FA QR"
                              className="w-40 h-40 object-contain"
                            />
                          </div>
                        )}
                      </div>

                      <form
                        onSubmit={handleVerifyAndActivate}
                        className="space-y-4 border-t border-gray-100 pt-4"
                      >
                        <div>
                          <label
                            htmlFor="modal-otp"
                            className="block text-xs font-medium text-gray-700 mb-1.5"
                          >
                            Nhập mã OTP xác nhận:
                          </label>
                          <input
                            id="modal-otp"
                            type="text"
                            maxLength={6}
                            placeholder="000000"
                            value={otp}
                            onChange={(e) =>
                              setOtp(e.target.value.replace(/\D/g, ""))
                            }
                            className="w-full text-center font-mono tracking-[0.4em] text-xl py-2.5 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none shadow-sm transition-all"
                            required
                            autoFocus
                          />
                        </div>

                        {error && (
                          <div className="p-2.5 bg-red-50 text-red-700 border border-red-100 rounded-xl text-xs flex gap-2">
                            <ShieldAlert
                              size={14}
                              className="shrink-0 mt-0.5"
                            />
                            <span>{error}</span>
                          </div>
                        )}

                        <div className="flex gap-2.5">
                          <button
                            type="button"
                            onClick={handleCloseModal}
                            className="w-1/3 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-xs font-medium hover:bg-gray-50 transition-colors"
                          >
                            Để sau
                          </button>
                          <button
                            type="submit"
                            disabled={loading || otp.length !== 6}
                            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                          >
                            {loading && (
                              <RefreshCw size={12} className="animate-spin" />
                            )}
                            <span>Kích hoạt bảo mật</span>
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
