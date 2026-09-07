"use client";

import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface LogoData {
  logo_image: string;
  logo_alt: string;
  logo_link: string;
  logo_width: number;
  logo_height: number;
}

export default function LogoAdminPage() {
  const [loading, setLoading] = useState(false);
  const [logoData, setLogoData] = useState<LogoData>({
    logo_image: "/logo_bhq.png",
    logo_alt: "Logo",
    logo_link: "/",
    logo_width: 120,
    logo_height: 32,
  });

  // ⭐ State cho preview và resize
  const [previewWidth, setPreviewWidth] = useState(120);
  const [previewHeight, setPreviewHeight] = useState(32);
  const [isResizing, setIsResizing] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(120 / 32);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);

  // ⭐ Ref cho kéo thả
  const logoRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const dragStartWidth = useRef(0);
  const dragStartHeight = useRef(0);

  const fetchLogoData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/logo`);
      const data = await res.json();
      if (data.success && data.data) {
        setLogoData(data.data);
        setPreviewWidth(data.data.logo_width || 120);
        setPreviewHeight(data.data.logo_height || 32);
        setAspectRatio(
          (data.data.logo_width || 120) / (data.data.logo_height || 32),
        );
      }
    } catch (error) {
      console.error("Error fetching logo data:", error);
      toast.error("Lỗi tải dữ liệu logo!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogoData();
  }, []);

  // ⭐ HÀM KÉO THẢ ĐỔI KÍCH THƯỚC
  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsResizing(true);
    isDragging.current = true;

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    dragStartX.current = clientX;
    dragStartY.current = clientY;
    dragStartWidth.current = previewWidth;
    dragStartHeight.current = previewHeight;

    document.addEventListener("mousemove", handleResizeMove);
    document.addEventListener("mouseup", handleResizeEnd);
    document.addEventListener("touchmove", handleResizeMove);
    document.addEventListener("touchend", handleResizeEnd);
  };

  const handleResizeMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging.current) return;

    const clientX =
      "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY =
      "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

    const deltaX = clientX - dragStartX.current;
    const deltaY = clientY - dragStartY.current;

    let newWidth = Math.max(20, dragStartWidth.current + deltaX);
    let newHeight = Math.max(20, dragStartHeight.current + deltaY);

    if (lockAspectRatio) {
      newHeight = newWidth / aspectRatio;
      newWidth = newHeight * aspectRatio;
    }

    setPreviewWidth(Math.round(newWidth));
    setPreviewHeight(Math.round(newHeight));
  };

  const handleResizeEnd = () => {
    isDragging.current = false;
    setIsResizing(false);
    document.removeEventListener("mousemove", handleResizeMove);
    document.removeEventListener("mouseup", handleResizeEnd);
    document.removeEventListener("touchmove", handleResizeMove);
    document.removeEventListener("touchend", handleResizeEnd);
  };

  // ⭐ CAPTURE ASPECT RATIO KHI TẢI ẢNH
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ⭐ LẤY ASPECT RATIO TỪ ẢNH
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const ratio = img.width / img.height;
      setAspectRatio(ratio);
      setPreviewWidth(Math.min(img.width, 300));
      setPreviewHeight(Math.min(img.height, 300) * ratio);
      URL.revokeObjectURL(objectUrl);
    };
    img.src = objectUrl;

    const formData = new FormData();
    formData.append("logoImage", file);

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/logo/upload-image`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.data) {
        const newImageUrl = data.data.logo_image;
        if (newImageUrl) {
          setLogoData({ ...logoData, logo_image: newImageUrl });
          toast.success("Cập nhật logo thành công!");
        }
      } else {
        toast.error("Upload thất bại: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Đã xảy ra lỗi khi upload ảnh!");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const payload = {
        logo_image: logoData.logo_image,
        logo_alt: logoData.logo_alt,
        logo_link: logoData.logo_link,
        logo_width: previewWidth,
        logo_height: previewHeight,
      };

      const res = await fetch(`${API_URL}/api/logo`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Lưu thay đổi thành công!");
        setLogoData({
          ...logoData,
          logo_width: previewWidth,
          logo_height: previewHeight,
        });
        fetchLogoData();
      } else {
        toast.error("Lỗi lưu dữ liệu: " + data.message);
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Đã xảy ra lỗi khi lưu dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  // ⭐ RESET VỀ DEFAULT
  const resetSize = () => {
    setPreviewWidth(120);
    setPreviewHeight(32);
    setAspectRatio(120 / 32);
  };

  if (loading && !logoData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 font-mono text-xs">LOADING LOGO...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 text-gray-900 px-4 mt-4">
      <div className="max-w-full mx-auto">
        {/* ⭐ PREVIEW VÀ KÉO THẢ */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-blue-600 text-xs uppercase tracking-wider">
              Preview & Kéo thả resize
            </h3>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={lockAspectRatio}
                  onChange={(e) => setLockAspectRatio(e.target.checked)}
                  className="w-4 h-4 accent-blue-600"
                />
                Giữ tỉ lệ
              </label>
              <button
                onClick={resetSize}
                className="text-xs text-gray-400 hover:text-blue-600 transition px-2 py-1 border border-gray-200 rounded"
              >
                Reset
              </button>
            </div>
          </div>

          {/* ⭐ VÙNG PREVIEW VỚI KÉO THẢ */}
          <div className="relative bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 flex items-center justify-center min-h-[200px] transition-all">
            <div
              ref={logoRef}
              className="relative group cursor-nw-resize"
              style={{
                width: previewWidth,
                height: previewHeight,
                transition: isResizing ? "none" : "width 0.1s, height 0.1s",
              }}
            >
              {logoData.logo_image ? (
                <img
                  src={logoData.logo_image}
                  alt="Logo preview"
                  className="w-full h-full object-contain select-none"
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                  No Logo
                </div>
              )}

              {/* ⭐ NÚT KÉO THẢ Ở GÓC PHẢI DƯỚI */}
              <div
                className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-full cursor-nw-resize opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg"
                onMouseDown={handleResizeStart}
                onTouchStart={handleResizeStart}
              >
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 8l4 4-4 4"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 8l4 4-4 4"
                  />
                </svg>
              </div>

              {/* ⭐ KÍCH THƯỚC HIỂN THỊ */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-blue-600/90 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {previewWidth} × {previewHeight} px
              </div>
            </div>

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-gray-400">
              Kéo góc phải dưới để thay đổi kích thước
            </div>
          </div>

          {/* ⭐ THANH SLIDER ĐIỀU CHỈNH */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-600 block mb-1 font-medium">
                Chiều rộng: {previewWidth}px
              </label>
              <input
                type="range"
                min="20"
                max="400"
                value={previewWidth}
                onChange={(e) => {
                  const newWidth = Number(e.target.value);
                  setPreviewWidth(newWidth);
                  if (lockAspectRatio) {
                    setPreviewHeight(Math.round(newWidth / aspectRatio));
                  }
                }}
                className="w-full accent-blue-600"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1 font-medium">
                Chiều cao: {previewHeight}px
              </label>
              <input
                type="range"
                min="20"
                max={lockAspectRatio ? 400 : 400}
                value={previewHeight}
                onChange={(e) => {
                  const newHeight = Number(e.target.value);
                  setPreviewHeight(newHeight);
                  if (lockAspectRatio) {
                    setPreviewWidth(Math.round(newHeight * aspectRatio));
                  }
                }}
                className="w-full accent-blue-600"
                disabled={lockAspectRatio}
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm space-y-4 max-h-[26vh] overflow-auto">
          {/* Logo Image */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="w-48 h-16 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center p-2">
                {logoData.logo_image ? (
                  <img
                    src={logoData.logo_image}
                    alt="Logo"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <span className="text-gray-400 text-xs">Chưa có logo</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-lg transition inline-block text-center font-medium">
                  Chọn ảnh logo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[10px] text-gray-400">
                  Hỗ trợ: PNG, JPG, SVG, WEBP
                </p>
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1 font-medium">
              Alt Text
            </label>
            <input
              type="text"
              value={logoData.logo_alt}
              onChange={(e) =>
                setLogoData({ ...logoData, logo_alt: e.target.value })
              }
              className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-gray-900 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition"
              placeholder="Ví dụ: TRONGBUI Logo"
            />
          </div>

          <div>
            <label className="text-xs text-gray-600 block mb-1 font-medium">
              Link Logo
            </label>
            <input
              type="text"
              value={logoData.logo_link}
              onChange={(e) =>
                setLogoData({ ...logoData, logo_link: e.target.value })
              }
              className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-gray-900 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition"
              placeholder="Ví dụ: /"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-600 block mb-1 font-medium">
                Chiều rộng (*120px)
              </label>
              <input
                type="number"
                value={logoData.logo_width}
                onChange={(e) =>
                  setLogoData({
                    ...logoData,
                    logo_width: Number(e.target.value),
                  })
                }
                className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-gray-900 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1 font-medium">
                Chiều cao (*32px)
              </label>
              <input
                type="number"
                value={logoData.logo_height}
                onChange={(e) =>
                  setLogoData({
                    ...logoData,
                    logo_height: Number(e.target.value),
                  })
                }
                className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-gray-900 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition active:scale-95 disabled:opacity-50 flex-1"
          >
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}
