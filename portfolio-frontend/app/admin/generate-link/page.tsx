"use client";

import { useState, useEffect } from "react";
import {
  Upload,
  Link2,
  Copy,
  Trash2,
  ExternalLink,
  RefreshCw,
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
    const url = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Đã copy link!");
  };

  return (
    <div className="w-full bg-gray-50 p-6 sm:p-10 text-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Link2 className="w-6 h-6 text-indigo-600" />
              Generate Link
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Tạo trang hiển thị hình ảnh full width/height với link tùy chỉnh
            </p>
          </div>
          <button
            onClick={fetchLinks}
            className="p-2 text-gray-600 hover:text-indigo-600 bg-white border rounded-lg"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Form tạo link */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-xl border shadow-sm"
          >
            <h2 className="text-lg font-semibold mb-4">Tạo Link Mới</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tiêu đề (không bắt buộc)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  placeholder="Nhập tiêu đề..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Slug tùy chỉnh (không bắt buộc)
                </label>
                <input
                  type="text"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-mono"
                  placeholder="vi-du-slug"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Nếu để trống, slug sẽ tự động tạo từ tiêu đề
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Hình ảnh
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>

              {preview && (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full max-h-64 object-contain rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      setPreview("");
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {loading ? "Đang tạo..." : "Tạo Link"}
              </button>
            </div>
          </form>

          {/* Danh sách links */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Danh Sách Links</h2>

            {linksLoading ? (
              <div className="p-8 text-center text-gray-400">Đang tải...</div>
            ) : links.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Chưa có link nào
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {links.map((link) => (
                  <div
                    key={link._id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border hover:shadow-sm transition-all"
                  >
                    <img
                      src={link.imageUrl}
                      alt={link.title}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {link.title || "Không có tiêu đề"}
                      </p>
                      <p className="text-xs text-gray-400 font-mono truncate">
                        /{link.slug}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleCopy(link.slug)}
                        className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                        title="Copy link"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <a
                        href={`/${link.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded"
                        title="Mở link"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(link._id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
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
