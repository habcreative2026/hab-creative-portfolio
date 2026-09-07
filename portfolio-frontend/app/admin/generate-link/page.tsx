"use client";

import { useState, useEffect, useRef } from "react";
import {
  Upload,
  Link2,
  Copy,
  Trash2,
  ExternalLink,
  RefreshCw,
  Image as ImageIcon,
  Globe,
  Clock,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface GeneratedLink {
  _id: string;
  slug: string;
  imageUrl: string;
  title: string;
  description: string;
  createdAt: string;
}

export default function GenerateLinkPage() {
  const [title, setTitle] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [links, setLinks] = useState<GeneratedLink[]>([]);
  const [linksLoading, setLinksLoading] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch danh sách links
  const fetchLinks = async () => {
    setLinksLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/generated-links`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setLinks(data.data);
    } catch (error) {
      console.error("Fetch links error:", error);
    } finally {
      setLinksLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Drag & drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    } else {
      toast.error("Vui lòng thả file hình ảnh!");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      toast.error("Vui lòng chọn hình ảnh!");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("title", title);
      formData.append("customSlug", customSlug);

      const res = await fetch(`${API_URL}/api/generated-links`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Tạo link thành công!");
        setTitle("");
        setCustomSlug("");
        setImage(null);
        setPreview("");
        fetchLinks();
      } else {
        toast.error(data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Generate link error:", error);
      toast.error("Có lỗi xảy ra khi tạo link");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa link này?")) return;
    try {
      const res = await fetch(`${API_URL}/api/generated-links/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Đã xóa link");
        fetchLinks();
      } else {
        toast.error(data.message || "Lỗi xóa link");
      }
    } catch (error) {
      toast.error("Lỗi xóa link");
    }
  };

  const handleCopy = (slug: string) => {
    // 👈 SỬA: thêm /link/
    const url = `${window.location.origin}/link/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Đã copy link!");
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen text-gray-800">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <span className="bg-indigo-100 p-2 rounded-lg">
                  <Link2 className="w-6 h-6 text-indigo-600" />
                </span>
                Generate Link
              </h1>
              <p className="text-sm text-gray-500 mt-2">
                Tạo trang hiển thị hình ảnh full width/height với link tùy chỉnh
              </p>
            </div>
            <button
              onClick={fetchLinks}
              className="p-2.5 text-gray-600 hover:text-indigo-600 bg-gray-50 border border-gray-200 rounded-lg hover:shadow-sm transition-all"
              title="Làm mới danh sách"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Grid 2 cột */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form tạo link */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-600" />
              Tạo Link Mới
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tiêu đề */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tiêu đề{" "}
                  <span className="text-gray-400">(không bắt buộc)</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition text-sm"
                  placeholder="Nhập tiêu đề..."
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Slug tùy chỉnh{" "}
                  <span className="text-gray-400">(không bắt buộc)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    /
                  </span>
                  <input
                    type="text"
                    value={customSlug}
                    onChange={(e) => setCustomSlug(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition font-mono text-sm"
                    placeholder="vi-du-slug"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  Nếu để trống, slug sẽ tự động tạo từ tiêu đề
                </p>
              </div>

              {/* Upload ảnh */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Hình ảnh <span className="text-red-500">*</span>
                </label>

                {/* Drag & Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
                    ${
                      dragActive
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"
                    }
                  `}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />

                  {preview ? (
                    <div className="relative">
                      <img
                        src={preview}
                        alt="Preview"
                        className="max-h-48 mx-auto object-contain rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImage(null);
                          setPreview("");
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="py-6">
                      <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 font-medium">
                        Kéo thả ảnh vào đây hoặc{" "}
                        <span className="text-indigo-600">bấm để chọn</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Hỗ trợ: PNG, JPG, SVG, WEBP (tối đa 10MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Nút tạo link */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 font-medium transition-all active:scale-95"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Tạo Link
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Danh sách links */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-600" />
                Danh Sách Links
              </h2>
              <span className="bg-indigo-100 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full">
                {links.length} links
              </span>
            </div>

            {linksLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              </div>
            ) : links.length === 0 ? (
              <div className="text-center py-16">
                <Globe className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500">Chưa có link nào</p>
                <p className="text-gray-400 text-sm mt-1">
                  Tạo link đầu tiên của bạn
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {links.map((link) => (
                  <div
                    key={link._id}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-sm transition-all group"
                  >
                    {/* Ảnh */}
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                      <img
                        src={link.imageUrl}
                        alt={link.title || "Generated Link"}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Thông tin */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {link.title || "Không có tiêu đề"}
                      </p>
                      {/* 👈 SỬA: thêm /link/ */}
                      <p className="text-xs text-indigo-600 font-mono truncate">
                        /link/{link.slug}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400">
                          {formatDate(link.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleCopy(link.slug)}
                        className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Copy link"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      {/* 👈 SỬA: thêm /link/ */}
                      <a
                        href={`/link/${link.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="Mở link"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(link._id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Xóa link"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
