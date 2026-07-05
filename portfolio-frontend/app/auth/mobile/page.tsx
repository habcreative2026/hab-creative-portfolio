"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2, Smartphone } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function MobileAuthPage() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [error, setError] = useState("");
  const [userInfo, setUserInfo] = useState<any>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const qrData = searchParams.get("qr");

  console.log("[Mobile] QR data from URL:", qrData);

  useEffect(() => {
    if (!qrData) {
      setStatus('error');
      setError('Không tìm thấy dữ liệu QR. Vui lòng quét lại.');
      setLoading(false);
      return;
    }

    handleQRData(qrData);
  }, [qrData]);

  const handleQRData = (rawData: string) => {
    try {
      console.log("[Mobile] Raw QR data:", rawData);
      
      // 👉 GIẢI MÃ URL
      let decodedData = rawData;
      try {
        decodedData = decodeURIComponent(rawData);
        console.log("[Mobile] Decoded data:", decodedData);
      } catch (e) {
        console.log("[Mobile] Failed to decode, using raw data");
      }

      // 👉 PARSE JSON
      let parsedData;
      try {
        parsedData = JSON.parse(decodedData);
        console.log("[Mobile] Parsed data:", parsedData);
      } catch (e) {
        // 👉 THỬ PARSE TRỰC TIẾP NẾU DECODEURI COMPONENT BỊ LỖI
        try {
          parsedData = JSON.parse(rawData);
          console.log("[Mobile] Parsed raw data:", parsedData);
        } catch (e2) {
          console.error("[Mobile] Parse error:", e2);
          setStatus('error');
          setError('Dữ liệu QR không hợp lệ. Vui lòng quét lại.');
          setLoading(false);
          return;
        }
      }

      // 👉 LẤY SESSION ID VÀ TOKEN (HỖ TRỢ CẢ KEY NGẮN VÀ KEY DÀI)
      const sessionId = parsedData.s || parsedData.sessionId;
      const token = parsedData.t || parsedData.token;

      if (!sessionId || !token) {
        console.error("[Mobile] Missing sessionId or token:", parsedData);
        setStatus('error');
        setError('Dữ liệu QR không đầy đủ. Vui lòng quét lại.');
        setLoading(false);
        return;
      }

      console.log("[Mobile] SessionId:", sessionId);
      console.log("[Mobile] Token:", token);

      handleVerify({ sessionId, token });
      
    } catch (error) {
      console.error("[Mobile] QR parse error:", error);
      setStatus('error');
      setError('Dữ liệu QR không hợp lệ. Vui lòng quét lại.');
      setLoading(false);
    }
  };

  const handleVerify = async (data: { sessionId: string; token: string }) => {
    try {
      // Lấy token từ localStorage
      const token = localStorage.getItem('auth_token');

      if (!token) {
        setStatus('error');
        setError('Vui lòng đăng nhập trước khi quét QR');
        setLoading(false);
        setTimeout(() => {
          router.push('/admin/login');
        }, 3000);
        return;
      }

      // Lấy thông tin user
      try {
        const userRes = await axios.get(`${API_URL}/api/admin/me`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });
        if (userRes.data.success) {
          setUserInfo(userRes.data.user);
        }
      } catch (err) {
        console.log("[Mobile] Could not fetch user info");
      }

      // 👉 GỬI REQUEST XÁC THỰC QR
      const response = await axios.post(
        `${API_URL}/api/license/qr/verify`,
        {
          sessionId: data.sessionId,
          token: data.token
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      if (response.data.success) {
        setStatus('success');
        toast.success('✅ Xác thực thành công!');
        
        setTimeout(() => {
          window.close();
          if (!window.closed) {
            router.push('/admin/dashboard');
          }
        }, 2000);
      } else {
        setStatus('error');
        setError(response.data.message || 'Xác thực thất bại');
        toast.error(response.data.message || 'Xác thực thất bại');
      }
    } catch (error: any) {
      console.error("[Mobile] Verify error:", error);
      setStatus('error');
      
      if (error.response?.status === 403) {
        setError('🚫 Bạn không có quyền truy cập. Vui lòng liên hệ quản trị viên.');
      } else if (error.response?.status === 401) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        setTimeout(() => {
          router.push('/admin/login');
        }, 3000);
      } else {
        setError(error.response?.data?.message || 'Đã xảy ra lỗi khi xác thực');
      }
      toast.error(error.response?.data?.message || 'Xác thực thất bại');
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
