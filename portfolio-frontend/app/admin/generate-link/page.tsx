"use client";

import { useState, useEffect, useRef, useMemo } from "react";
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
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Grid3x3,
  List,
  SortAsc,
  SortDesc,
  Eye,
  X,
  Calendar,
  TrendingUp,
  Sparkles,
  ChevronDown,
  Zap,
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

type ViewMode = "grid" | "list";
type SortMode = "newest" | "oldest" | "name";

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

  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [previewLink, setPreviewLink] = useState<GeneratedLink | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleCopy = async (slug: string, id?: string) => {
    if (!slug) {
      toast.error("Slug không hợp lệ!");
      return;
    }
    const url = `${window.location.origin}/g/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Đã copy link!");
      if (id) {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 1500);
      }
    } catch (_) {
      toast.error("Không copy được");
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatRelative = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Vừa xong";
    if (mins < 60) return `${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} ngày trước`;
    return formatDate(date);
  };

  const processedLinks = useMemo(() => {
    let result = [...links];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (l) =>
          (l.title || "").toLowerCase().includes(q) ||
          (l.slug || "").toLowerCase().includes(q),
      );
    }

    result.sort((a, b) => {
      if (sortMode === "newest") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      if (sortMode === "oldest") {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
      return (a.title || "").localeCompare(b.title || "", "vi");
    });

    return result;
  }, [links, searchQuery, sortMode]);

  const stats = useMemo(() => {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const thisWeek = links.filter(
      (l) => new Date(l.createdAt).getTime() > weekAgo,
    ).length;
    return {
      total: links.length,
      thisWeek,
    };
  }, [links]);

  const sortLabels: Record<SortMode, string> = {
    newest: "Mới nhất",
    oldest: "Cũ nhất",
    name: "Tên A-Z",
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 text-gray-800">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* ============ GRID 2 CỘT ============ */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:items-start">
          {/* ============ CỘT TRÁI: FORM ============ */}
          <div className="lg:col-span-2 lg:sticky lg:top-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm h-full lg:min-h-[640px] flex flex-col">
              <div className="flex items-center gap-2 mb-5">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                </div>
                <h2 className="text-base font-semibold text-gray-900">
                  Tạo Link Mới
                </h2>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-4 flex-1 flex flex-col"
              >
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">
                    Tiêu đề
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 bg-gray-50/50 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white outline-none transition text-sm"
                    placeholder="Ví dụ: Banner khuyến mãi"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">
                    Slug tùy chỉnh
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-mono">
                      /g/
                    </span>
                    <input
                      type="text"
                      value={customSlug}
                      onChange={(e) => setCustomSlug(e.target.value)}
                      className="w-full pl-12 pr-3.5 py-2.5 border border-gray-200 bg-gray-50/50 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white outline-none transition font-mono text-sm"
                      placeholder="vi-du-slug"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Để trống sẽ tự động tạo từ tiêu đề
                  </p>
                </div>

                <div className="flex-1 flex flex-col">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">
                    Hình ảnh <span className="text-red-500">*</span>
                  </label>

                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                      relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all overflow-hidden flex-1 flex items-center justify-center min-h-[180px]
                      ${
                        dragActive
                          ? "border-indigo-500 bg-indigo-50 scale-[1.01]"
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
                      <div className="relative w-full">
                        <img
                          src={preview}
                          alt="Preview"
                          className="max-h-52 mx-auto object-contain rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setImage(null);
                            setPreview("");
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg active:scale-90 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded-full">
                          {image?.name}
                        </div>
                      </div>
                    ) : (
                      <div className="py-6">
                        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-indigo-50 flex items-center justify-center">
                          <ImageIcon className="w-7 h-7 text-indigo-400" />
                        </div>
                        <p className="text-sm text-gray-700 font-medium">
                          Kéo thả hoặc{" "}
                          <span className="text-indigo-600 underline underline-offset-2">
                            chọn ảnh
                          </span>
                        </p>
                        <p className="text-[11px] text-gray-400 mt-1">
                          PNG, JPG, SVG, WEBP — tối đa 10MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-all active:scale-[0.98] shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300/40"
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
          </div>

          {/* ============ CỘT PHẢI: DANH SÁCH ============ */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden h-full lg:min-h-[640px] flex flex-col">
              {/* Header danh sách */}
              <div className="p-5 border-b border-gray-100 shrink-0">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                      <Globe className="w-4 h-4 text-indigo-600" />
                    </div>
                    <h2 className="text-base font-semibold text-gray-900">
                      Danh Sách Links
                    </h2>
                    <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {processedLinks.length}
                      {searchQuery && links.length !== processedLinks.length
                        ? `/${links.length}`
                        : ""}
                    </span>
                  </div>

                  <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-1.5 rounded-md transition ${
                        viewMode === "list"
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                      title="Xem dạng danh sách"
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-1.5 rounded-md transition ${
                        viewMode === "grid"
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                      title="Xem dạng lưới"
                    >
                      <Grid3x3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm theo tiêu đề hoặc slug..."
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 bg-gray-50/50 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white outline-none transition"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setShowSortMenu(!showSortMenu)}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 bg-gray-50/50 rounded-lg hover:bg-gray-100 transition whitespace-nowrap"
                    >
                      {sortMode === "newest" && (
                        <SortDesc className="w-4 h-4" />
                      )}
                      {sortMode === "oldest" && <SortAsc className="w-4 h-4" />}
                      {sortMode === "name" && <Filter className="w-4 h-4" />}
                      <span className="hidden sm:inline">
                        {sortLabels[sortMode]}
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${
                          showSortMenu ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {showSortMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowSortMenu(false)}
                        />
                        <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-lg p-1 z-20">
                          {(["newest", "oldest", "name"] as SortMode[]).map(
                            (mode) => (
                              <button
                                key={mode}
                                onClick={() => {
                                  setSortMode(mode);
                                  setShowSortMenu(false);
                                }}
                                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition flex items-center justify-between ${
                                  sortMode === mode
                                    ? "bg-indigo-50 text-indigo-700 font-medium"
                                    : "text-gray-700 hover:bg-gray-50"
                                }`}
                              >
                                {sortLabels[mode]}
                                {sortMode === mode && (
                                  <CheckCircle2 className="w-4 h-4" />
                                )}
                              </button>
                            ),
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Body — CHỈ VÙNG NÀY SCROLL */}
              <div
                className="p-5 overflow-y-auto custom-scroll flex-1"
                style={{
                  maxHeight: "min(calc(100vh - 220px), 720px)",
                  willChange: "scroll-position",
                  overscrollBehavior: "contain",
                }}
              >
                {linksLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                    <p className="text-sm text-gray-500">Đang tải...</p>
                  </div>
                ) : processedLinks.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
                      {searchQuery ? (
                        <Search className="w-10 h-10 text-indigo-300" />
                      ) : (
                        <Globe className="w-10 h-10 text-indigo-300" />
                      )}
                    </div>
                    <p className="text-gray-700 font-medium">
                      {searchQuery
                        ? "Không tìm thấy link nào"
                        : "Chưa có link nào"}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      {searchQuery
                        ? "Thử từ khóa khác xem sao"
                        : "Tạo link đầu tiên của bạn"}
                    </p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Xóa bộ lọc
                      </button>
                    )}
                  </div>
                ) : viewMode === "list" ? (
                  <div className="space-y-2">
                    {processedLinks.map((link) => (
                      <div
                        key={link._id}
                        className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all"
                      >
                        <div className="relative w-14 h-14 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                          <img
                            src={link.imageUrl}
                            alt={link.title || "Generated Link"}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => setPreviewLink(link)}
                            className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity"
                            title="Xem ảnh"
                          >
                            <Eye className="w-4 h-4 text-white" />
                          </button>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {link.title || "Không có tiêu đề"}
                          </p>
                          <p className="text-xs text-indigo-600 font-mono truncate mt-0.5">
                            /g/{link.slug}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-[11px] text-gray-500">
                              {formatRelative(link.createdAt)}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-0.5">
                          <button
                            onClick={() => handleCopy(link.slug, link._id)}
                            className={`p-2 rounded-lg transition ${
                              copiedId === link._id
                                ? "text-green-600 bg-green-50"
                                : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
                            }`}
                            title="Copy link"
                          >
                            {copiedId === link._id ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          <a
                            href={`/g/${link.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="Mở link"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => setDeleteConfirm(link._id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Xóa link"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {processedLinks.map((link) => (
                      <div
                        key={link._id}
                        className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-indigo-200 hover:shadow-lg transition-all"
                      >
                        <div className="relative aspect-video bg-gray-100 overflow-hidden">
                          <img
                            src={link.imageUrl}
                            alt={link.title || "Generated Link"}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => setPreviewLink(link)}
                            className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-lg hover:bg-white transition"
                            title="Xem ảnh"
                          >
                            <Eye className="w-4 h-4 text-gray-700" />
                          </button>
                        </div>

                        <div className="p-3">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {link.title || "Không có tiêu đề"}
                          </p>
                          <p className="text-xs text-indigo-600 font-mono truncate mt-0.5">
                            /g/{link.slug}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              <span className="text-[11px] text-gray-500">
                                {formatDate(link.createdAt)}
                              </span>
                            </div>
                            <div className="flex gap-0.5">
                              <button
                                onClick={() => handleCopy(link.slug, link._id)}
                                className={`p-1.5 rounded-lg transition ${
                                  copiedId === link._id
                                    ? "text-green-600 bg-green-50"
                                    : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
                                }`}
                                title="Copy"
                              >
                                {copiedId === link._id ? (
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <a
                                href={`/g/${link.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                                title="Mở"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                              <button
                                onClick={() => setDeleteConfirm(link._id)}
                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Xóa"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {previewLink && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewLink(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {previewLink.title || "Không có tiêu đề"}
                </h3>
                <p className="text-xs text-indigo-600 font-mono mt-0.5">
                  /g/{previewLink.slug}
                </p>
              </div>
              <button
                onClick={() => setPreviewLink(null)}
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 p-4 max-h-[60vh] overflow-auto">
              <img
                src={previewLink.imageUrl}
                alt={previewLink.title}
                className="max-w-full mx-auto rounded-lg shadow-sm"
              />
            </div>

            <div className="flex items-center gap-2 p-4 border-t border-gray-100">
              <button
                onClick={() => handleCopy(previewLink.slug, previewLink._id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm"
              >
                <Copy className="w-4 h-4" />
                Copy link
              </button>
              <a
                href={`/g/${previewLink.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Mở link
              </a>
              <button
                onClick={() => {
                  const id = previewLink._id;
                  setPreviewLink(null);
                  setDeleteConfirm(id);
                }}
                className="p-2.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
                title="Xóa"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ DELETE CONFIRM ============ */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-50 flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-1">
              Xóa link này?
            </h3>
            <p className="text-sm text-gray-500 text-center mb-5">
              Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ CUSTOM SCROLLBAR ============ */}
      <style jsx global>{`
        .custom-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 4px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
        .custom-scroll {
          contain: layout style paint;
        }
      `}</style>
    </div>
  );
}
