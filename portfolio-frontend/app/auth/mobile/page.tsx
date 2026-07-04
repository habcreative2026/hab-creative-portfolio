"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2, Smartphone } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function MobileAuthPage() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"processing" | "success" | "error">(
    "processing",
  );
  const [error, setError] = useState("");
  const [userInfo, setUserInfo] = useState<any>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const qrData = searchParams.get("qr");

  useEffect(() => {
    if (!qrData) {
      setStatus("error");
      setError("Không tìm thấy dữ liệu QR. Vui lòng quét lại.");
      setLoading(false);
      return;
    }

    // Giải mã QR data
    try {
      const decodedData = JSON.parse(decodeURIComponent(qrData));
      console.log("QR Data received:", decodedData);
      handleVerify(decodedData);
    } catch (err) {
      setStatus("error");
      setError("Dữ liệu QR không hợp lệ");
      setLoading(false);
    }
  }, [qrData]);

  const handleVerify = async (data: any) => {
    try {
      // Lấy token từ cookie
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("auth_token="))
        ?.split("=")[1];

      if (!token) {
        setStatus("error");
        setError("Vui lòng đăng nhập trước khi quét QR");
        setLoading(false);
        // Chuyển hướng về login sau 3s
        setTimeout(() => {
          router.push("/admin/login");
        }, 3000);
        return;
      }

      // Lấy thông tin user
      try {
        const userRes = await axios.get(`${API_URL}/api/admin/me`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        if (userRes.data.success) {
          setUserInfo(userRes.data.data);
        }
      } catch (err) {
        console.log("Could not fetch user info");
      }

      // Gửi request xác thực QR
      const response = await axios.post(
        `${API_URL}/api/license/qr/verify`,
        {
          sessionId: data.sessionId,
          token: data.token,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );

      if (response.data.success) {
        setStatus("success");
        toast.success("Xác thực thành công!");

        // Đóng tab sau 2 giây
        setTimeout(() => {
          window.close();
          // Nếu không close được, chuyển về dashboard
          if (!window.closed) {
            router.push("/admin/dashboard");
          }
        }, 2000);
      } else {
        setStatus("error");
        setError(response.data.message || "Xác thực thất bại");
        toast.error(response.data.message || "Xác thực thất bại");
      }
    } catch (error: any) {
      console.error("Verify error:", error);
      setStatus("error");

      if (error.response?.status === 401) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        setTimeout(() => {
          router.push("/admin/login");
        }, 3000);
      } else {
        setError(error.response?.data?.message || "Đã xảy ra lỗi khi xác thực");
      }
      toast.error(error.response?.data?.message || "Xác thực thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setLoading(true);
    setStatus("processing");
    setError("");
    // Refresh page để quét lại QR
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F19] to-[#1a2332] flex items-center justify-center p-4">
      <div className="bg-[#131A2C] rounded-2xl border border-slate-800 shadow-2xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center">
              <Smartphone className="w-8 h-8 text-indigo-400" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-white">📱 Xác thực Desktop</h1>
          <p className="text-sm text-slate-400 mt-1">
            Đang xác thực thiết bị của bạn
          </p>
        </div>

        {/* User Info */}
        {userInfo && (
          <div className="bg-[#1a2332] rounded-lg p-4 mb-6 border border-slate-700">
            <div className="flex items-center gap-3">
              {userInfo.avatar ? (
                <img
                  src={userInfo.avatar}
                  alt={userInfo.name}
                  className="w-10 h-10 rounded-full border-2 border-indigo-500"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <span className="text-indigo-400 font-bold">
                    {userInfo.name?.charAt(0) || "U"}
                  </span>
                </div>
              )}
              <div>
                <div className="text-white font-medium">{userInfo.name}</div>
                <div className="text-xs text-slate-400">{userInfo.email}</div>
              </div>
            </div>
          </div>
        )}

        {/* Status */}
        <div className="bg-[#1a2332] rounded-lg p-6 border border-slate-700">
          {loading ? (
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mx-auto mb-3" />
              <p className="text-white font-medium">Đang xác thực...</p>
              <p className="text-xs text-slate-400 mt-1">
                Vui lòng chờ trong giây lát
              </p>
            </div>
          ) : status === "success" ? (
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <CheckCircle className="w-12 h-12 text-green-400" />
              </div>
              <p className="text-white font-bold text-lg">
                Xác thực thành công!
              </p>
              <p className="text-sm text-slate-400 mt-2">
                Desktop đã được xác thực.
                <br />
                <span className="text-xs text-slate-500">
                  Cửa sổ này sẽ tự động đóng.
                </span>
              </p>
              <div className="mt-4 h-1 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-400 rounded-full animate-[progress_2s_ease-in-out]"></div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <XCircle className="w-12 h-12 text-red-400" />
              </div>
              <p className="text-white font-bold text-lg">Xác thực thất bại</p>
              <p className="text-sm text-red-400 mt-2">{error}</p>

              {error.includes("đăng nhập") && (
                <p className="text-xs text-slate-400 mt-2">
                  Đang chuyển hướng đến trang đăng nhập...
                </p>
              )}

              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleRetry}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 px-4 rounded-lg transition"
                >
                  Thử lại
                </button>
                <button
                  onClick={() => window.close()}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg transition"
                >
                  Đóng
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-[10px] text-slate-600">
            Bảo mật 2 lớp • Phiên bản 1.0.0
          </p>
        </div>

        <style jsx>{`
          @keyframes progress {
            0% {
              width: 0%;
            }
            100% {
              width: 100%;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
