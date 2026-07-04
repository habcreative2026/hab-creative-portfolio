"use client";

import React, { useState, useEffect, useRef } from "react";
import { Upload, Trash2, Images, Loader2, Move } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

interface LogoItem {
  _id: string;
  url: string;
  title: string;
}

export default function MarqueeAdminPage() {
  const [currentLogos, setCurrentLogos] = useState<LogoItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [isReordering, setIsReordering] = useState<boolean>(false);

  // Lưu index của phần tử đang được kéo và phần tử bị thả đè lên
  const dragItemIndex = useRef<number | null>(null);
  const dragOverItemIndex = useRef<number | null>(null);

  const fetchLogos = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/marquee`);
      const result = await res.json();
      if (result.success) setCurrentLogos(result.data);
    } catch (error) {
      console.error("Lỗi kết nối API Marquee:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogos();
  }, []);

  const handleAddLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/marquee/add`,
        {
          method: "POST",
          body: formData,
        },
      );
      const result = await res.json();
      if (result.success) setCurrentLogos(result.data);
    } catch (error) {
      toast.error("Lỗi upload dữ liệu hình ảnh.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = async (id: string) => {
    if (
      !confirm("Bạn muốn gỡ hình ảnh này khỏi chuỗi hiển thị màn hình chính?")
    )
      return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/marquee/remove/${id}`,
        {
          method: "DELETE",
        },
      );
      const result = await res.json();
      if (result.success) setCurrentLogos(result.data);
    } catch (error) {
      toast.error("Xảy ra sự cố khi gỡ hình ảnh.");
    }
  };

  // --- THUẬT TOÁN HOÁN ĐỔI VỊ TRÍ TRỰC TIẾP (SWAP POSITIONS) ---

  const handleDragStart = (index: number) => {
    dragItemIndex.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverItemIndex.current = index;
  };

  const handleDragEnd = async () => {
    const sourceIdx = dragItemIndex.current;
    const targetIdx = dragOverItemIndex.current;

    if (sourceIdx === null || targetIdx === null || sourceIdx === targetIdx) {
      // Reset nếu kéo thả ra ngoài hoặc thả tại chỗ
      dragItemIndex.current = null;
      dragOverItemIndex.current = null;
      return;
    }

    // Tiến hành Swap (đổi chỗ trực tiếp) vị trí của 2 phần tử trong mảng
    const updatedLogos = [...currentLogos];
    const temp = updatedLogos[sourceIdx];
    updatedLogos[sourceIdx] = updatedLogos[targetIdx];
    updatedLogos[targetIdx] = temp;

    // Cập nhật State để framer-motion tự kích hoạt hiệu ứng di chuyển vị trí (Layout Animation)
    setCurrentLogos(updatedLogos);

    // Reset con trỏ lưu trữ
    dragItemIndex.current = null;
    dragOverItemIndex.current = null;

    // Đồng bộ thứ tự mảng mới này xuống Database
    setIsReordering(true);
    try {
      const sortedIds = updatedLogos.map((item) => item._id);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/marquee/reorder`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortedIds }),
        },
      );
      const result = await res.json();
      if (!result.success) {
        toast.error("Không thể lưu thứ tự mới vào database.");
        fetchLogos(); // Hoàn tác nếu lỗi backend
      }
    } catch (error) {
      console.error("Lỗi cập nhật thứ tự:", error);
      fetchLogos();
    } finally {
      setIsReordering(false);
    }
  };

  return (
    <div className="space-y-6 max-w-full mx-auto p-4 md:p-6 select-none scroll-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Images className="w-6 h-6 text-indigo-600" />
            Cấu hình Logo Đối tác & Danh mục
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kéo một ô ảnh thả đè lên ô ảnh khác để hoán đổi (swap) vị trí trực
            tiếp cho nhau.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isReordering && (
            <span className="text-xs text-indigo-600 flex items-center gap-1.5 font-medium bg-indigo-50 px-3 py-1.5 rounded-xl animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang đồng bộ vị
              trí...
            </span>
          )}

          <label
            className={`flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl shadow-md hover:bg-indigo-700 cursor-pointer transition active:scale-95 ${uploading ? "opacity-50 pointer-events-none" : ""}`}
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {uploading ? "Đang xử lý dữ liệu..." : "Tải lên ảnh mới"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAddLogo}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {loading ? (
        <div className="h-48 flex items-center justify-center text-gray-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" /> Đang đồng
          bộ trạng thái giao diện...
        </div>
      ) : currentLogos.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
          Chưa có hình ảnh nào được chỉ định chạy Marquee. Vui lòng thêm ảnh
          mới!
        </div>
      ) : (
        /* Grid container sử dụng thẻ thường */
        // <div className="max-h-[70vh] overflow-y-auto pr-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 max-h-[70vh] overflow-y-auto scroll-none">
          {currentLogos.map((logo, index) => (
            <motion.div
              key={logo._id}
              layout // Kích hoạt hiệu ứng bay trượt mượt mà của framer-motion khi hoán đổi vị trí mảng
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()} // Bắt buộc phải có để tính năng thả (drop) hoạt động
              className="group relative border border-gray-200 rounded-2xl bg-white p-3 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition-shadow duration-150 flex flex-col justify-between border-t-2 hover:border-indigo-400"
            >
              {/* Khung hiển thị ảnh */}
              <div className="w-full h-28 bg-gray-50/50 rounded-xl flex items-center justify-center overflow-hidden border border-gray-100 p-2 relative">
                <img
                  src={logo.url}
                  alt={logo.title}
                  className="object-contain max-h-full max-w-full pointer-events-none"
                />
              </div>

              {/* Khu vực thông tin số thứ tự */}
              <div className="mt-3 flex items-center justify-between text-gray-400 px-1 border-t border-gray-50 pt-2">
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                  Vị trí {index + 1}
                </span>
                <Move className="w-3.5 h-3.5 opacity-30 group-hover:opacity-100 text-indigo-500 transition" />
              </div>

              {/* Nút gỡ ảnh */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Không kích hoạt nhầm sự kiện kéo thả
                  handleRemoveLogo(logo._id);
                }}
                className="absolute top-2 right-2 p-1.5 bg-white text-red-600 border border-gray-100 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-red-50 shadow-sm transition-all duration-200"
                title="Gỡ ảnh khỏi client"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
        // </div>
      )}
    </div>
  );
}
