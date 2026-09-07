"use client";

import React, { useEffect, useState } from "react";
import {
  Save,
  Plus,
  Trash2,
  Globe,
  Shield,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

type LinkItem = {
  _id?: string;
  key: string;
  url: string;
  label: string;
  category: string;
  isNewTab: boolean;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LinkAdminDashboard() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // 1. Fetch danh sách từ Backend (yêu cầu cấu hình credentials nếu có auth token/cookie)
  const fetchLinks = async () => {
    setLoading(true);
    try {
      // 1. Tại hàm fetchLinks, bổ sung credentials
      const res = await fetch(`${API_URL}/api/links/admin-list`, {
        method: "GET",
        credentials: "include", // CỰC KỲ QUAN TRỌNG: Gửi cookie kèm theo request
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) setLinks(json.data);
      } else {
        showMsg("Không thể tải danh sách liên kết từ server.", "error");
      }
    } catch (err) {
      showMsg("Lỗi kết nối đến hệ thống backend.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const showMsg = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  // 2. Cập nhật giá trị local khi Admin gõ phím
  const handleInputChange = (
    index: number,
    field: keyof LinkItem,
    value: any,
  ) => {
    const updated = [...links];
    updated[index] = { ...updated[index], [field]: value };
    setLinks(updated);
  };

  // 3. Thêm một hàng Link trống mới
  const handleAddRow = () => {
    setLinks([
      ...links,
      { key: "", url: "", label: "", category: "social", isNewTab: true },
    ]);
  };

  // 4. Xóa tạm thời một hàng khỏi danh sách hiển thị
  const handleRemoveRow = (index: number) => {
    const updated = links.filter((_, i) => i !== index);
    setLinks(updated);
  };

  // 5. Gửi mảng dữ liệu qua API bulk-update để lưu vào MongoDB
  const handleSaveAll = async () => {
    // Validate nhanh tránh để rỗng Key hoặc URL
    const hasError = links.some((item) => !item.key.trim() || !item.url.trim());
    if (hasError) {
      showMsg(
        "Vui lòng điền đầy đủ thông tin Mã Định Danh (Key) và Đường Dẫn (URL)!",
        "error",
      );
      return;
    }

    setSaving(true);
    try {
      // 2. Tại hàm handleSaveAll (Hàm lưu dữ liệu), cũng bổ sung credentials tương tự
      const res = await fetch(`${API_URL}/api/links/bulk-update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // CỰC KỲ QUAN TRỌNG: Gửi cookie kèm theo request
        body: JSON.stringify({ updates: links }),
      });
      const json = await res.json();
      if (json.success) {
        showMsg("Hệ thống đã lưu toàn bộ liên kết mới thành công!", "success");
        fetchLinks(); // Tải lại danh sách chuẩn từ DB
      } else {
        showMsg(json.message || "Lỗi cập nhật dữ liệu.", "error");
      }
    } catch (err) {
      showMsg("Lỗi hệ thống khi gửi yêu cầu cập nhật.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full bg-gray-50 p-6 sm:p-10 text-gray-800 scroll-none">
      <div className="max-w-7xl mx-auto">
        {/* Header Dashboard */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-5 gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
              <Globe className="w-6 h-6 text-indigo-600" />
              Quản Lý Liên Kết
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Quản lý toàn bộ URLs điều hướng, mạng xã hội,...
            </p>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              onClick={fetchLinks}
              className="p-2.5 text-gray-600 hover:text-indigo-600 bg-white border border-gray-300 rounded-lg hover:shadow-sm transition-all"
              title="Làm tươi dữ liệu"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={handleAddRow}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 active:scale-95 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" /> Thêm
            </button>
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 active:scale-95 transition-all shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {saving ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </div>

        {/* Thông báo trạng thái Toast-style */}
        {message.text && (
          <div
            className={`mt-4 px-4 py-3 rounded-lg text-sm font-medium border shadow-sm transition-all animate-fade-in ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Bảng Dữ Liệu Quản Trị */}
        <div className="mt-8 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400 font-mono text-sm animate-pulse">
              Đang tải gói cấu hình liên kết từ database...
            </div>
          ) : links.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              Không có liên kết nào. Bấm nút{" "}
              <b className="text-indigo-600">"Thêm Liên Kết"</b> để bắt đầu cấu
              hình!
            </div>
          ) : (
            <div className="max-h-[70vh] overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-gray-50 z-10">
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <th className="px-6 py-4 w-1/4">Key</th>
                    <th className="px-6 py-4 w-1/3">Đường dẫn thực tế</th>
                    <th className="px-6 py-4">Nhãn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm">
                  {links.map((item, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50/70 transition-colors"
                    >
                      {/* Cột 1: KEY */}
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={item.key}
                          placeholder="e.g. portfolio_bhq"
                          disabled={!!item._id} // Không cho đổi key nếu đã lưu trong DB để tránh gãy code frontend
                          onChange={(e) =>
                            handleInputChange(index, "key", e.target.value)
                          }
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none disabled:bg-gray-100 disabled:text-gray-500 font-mono text-xs"
                        />
                      </td>

                      {/* Cột 2: URL */}
                      <td className="px-6 py-4">
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            value={item.url}
                            placeholder="https://..."
                            onChange={(e) =>
                              handleInputChange(index, "url", e.target.value)
                            }
                            className="w-full pl-3 pr-8 py-1.5 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-sans text-xs text-indigo-600"
                          />
                          {item.url && item.url.startsWith("http") && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noreferrer"
                              className="absolute right-2.5 text-gray-400 hover:text-indigo-600"
                              title="Thử truy cập liên kết"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Cột 3: LABEL */}
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={item.label}
                          placeholder="Nhãn liên kết)"
                          onChange={(e) =>
                            handleInputChange(index, "label", e.target.value)
                          }
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
