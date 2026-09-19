"use client";

import React, { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import {
  Users,
  Trash2,
  Send,
  Mail,
  Image as ImageIcon,
  X,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Clock,
  Search,
  Filter,
  Plus,
  History,
  Sparkles,
  TrendingUp,
  UserCheck,
  UserX,
  Loader2,
  ChevronDown,
  Copy,
  Check,
  Calendar,
  Download,
  Upload,
  AlertTriangle,
  BarChart3,
  Megaphone,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface Subscriber {
  _id: string;
  email: string;
  isActive: boolean;
  subscribedAt: string;
  createdAt: string;
}

interface Broadcast {
  _id: string;
  subject: string;
  content: string;
  imageUrl?: string;
  recipientsCount: number;
  successCount: number;
  failedCount: number;
  status: string;
  createdAt: string;
}

type TabType = "list" | "broadcast" | "history";

export default function SubscribersAdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>("list");
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");

  // Form state
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // ================= FETCH =================
  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/subscribers`);
      const data = await res.json();
      if (data.success) setSubscribers(data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Không tải được danh sách!");
    } finally {
      setLoading(false);
    }
  };

  const fetchBroadcasts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/subscribers/broadcast`);
      const data = await res.json();
      if (data.success) setBroadcasts(data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSubscribers();
    fetchBroadcasts();
  }, []);

  // ================= STATS =================
  const stats = useMemo(() => {
    const total = subscribers.length;
    const active = subscribers.filter((s) => s.isActive).length;
    const inactive = total - active;

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recent = subscribers.filter(
      (s) => new Date(s.createdAt) >= weekAgo,
    ).length;

    return { total, active, inactive, recent };
  }, [subscribers]);

  // ================= FILTERED =================
  const filteredSubscribers = useMemo(() => {
    let list = [...subscribers];

    if (filterStatus === "active") list = list.filter((s) => s.isActive);
    if (filterStatus === "inactive") list = list.filter((s) => !s.isActive);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((s) => s.email.toLowerCase().includes(q));
    }

    return list;
  }, [subscribers, filterStatus, searchQuery]);

  // ================= ACTIONS =================
  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa subscriber này?")) return;
    try {
      const res = await fetch(`${API_URL}/api/subscribers/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Đã xóa subscriber!");
        fetchSubscribers();
      }
    } catch {
      toast.error("Xóa thất bại!");
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/subscribers/${id}/toggle`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Đã cập nhật trạng thái!");
        fetchSubscribers();
      }
    } catch {
      toast.error("Cập nhật thất bại!");
    }
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    toast.success("Đã copy email!");
    setTimeout(() => setCopiedEmail(null), 1500);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploading(true);
      const res = await fetch(
        `${API_URL}/api/subscribers/broadcast/upload-image`,
        {
          method: "POST",
          body: formData,
        },
      );
      const data = await res.json();
      if (data.success && data.data?.imageUrl) {
        setImageUrl(data.data.imageUrl);
        toast.success("Upload ảnh thành công!");
      } else {
        toast.error("Upload thất bại!");
      }
    } catch {
      toast.error("Upload thất bại!");
    } finally {
      setUploading(false);
    }
  };

  const handleSendBroadcast = async () => {
    if (!subject.trim() || !content.trim()) {
      toast.error("Vui lòng nhập tiêu đề và nội dung!");
      return;
    }

    if (stats.active === 0) {
      toast.error("Chưa có subscriber active nào để gửi!");
      return;
    }

    if (
      !window.confirm(
        `Bạn chắc chắn muốn gửi tin nhắn tới ${stats.active} subscriber?`,
      )
    )
      return;

    try {
      setSending(true);
      const res = await fetch(`${API_URL}/api/subscribers/broadcast/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, content, imageUrl }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setSubject("");
        setContent("");
        setImageUrl("");
        fetchBroadcasts();
        setActiveTab("history");
      } else {
        toast.error(data.message || "Gửi thất bại!", { duration: 6000 });
        if (data.error?.includes("verify a domain")) {
          toast.error(
            "👉 Verify domain tại resend.com/domains trước khi gửi!",
            {
              duration: 8000,
            },
          );
        }
      }
    } catch {
      toast.error("Có lỗi xảy ra!");
    } finally {
      setSending(false);
    }
  };

  const handleDeleteBroadcast = async (id: string) => {
    if (!window.confirm("Xóa broadcast này khỏi lịch sử?")) return;
    try {
      const res = await fetch(`${API_URL}/api/subscribers/broadcast/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Đã xóa!");
        fetchBroadcasts();
      }
    } catch {
      toast.error("Xóa thất bại!");
    }
  };

  const handleExportCSV = () => {
    const csv = [
      "Email,Trạng thái,Ngày đăng ký",
      ...subscribers.map(
        (s) =>
          `${s.email},${s.isActive ? "Active" : "Inactive"},${new Date(
            s.createdAt,
          ).toLocaleString("vi-VN")}`,
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Đã xuất file CSV!");
  };

  const tabs = [
    {
      id: "list" as TabType,
      label: "Danh sách",
      icon: Users,
      count: stats.total,
    },
    {
      id: "broadcast" as TabType,
      label: "Soạn thông báo",
      icon: Megaphone,
    },
    {
      id: "history" as TabType,
      label: "Lịch sử",
      icon: History,
      count: broadcasts.length,
    },
  ];

  return (
    <div className="h-screen flex flex-col bg-[#0B0F19] text-slate-200 overflow-hidden">
      {/* ================= HEADER ================= */}
      <div className="shrink-0 border-b border-slate-800/60 bg-[#0B0F19]/95 backdrop-blur-sm z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Users size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-white leading-tight">
                  Subscribers
                </h1>
                <p className="text-[11px] text-slate-500">
                  Quản lý người đăng ký & gửi thông báo
                </p>
              </div>
            </div>

            <button
              onClick={handleExportCSV}
              disabled={subscribers.length === 0}
              className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-[#131A2C] border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition disabled:opacity-50 w-fit"
            >
              <Download size={14} />
              Xuất CSV
            </button>
          </div>
        </div>
      </div>

      {/* ================= STATS + TABS ================= */}
      <div className="shrink-0 bg-[#0B0F19] z-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-4 pb-3 space-y-3">
          {/* Stats - compact row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            <StatCard
              icon={Users}
              label="Tổng cộng"
              value={stats.total}
              color="blue"
            />
            <StatCard
              icon={UserCheck}
              label="Hoạt động"
              value={stats.active}
              color="green"
            />
            <StatCard
              icon={UserX}
              label="Đã tắt"
              value={stats.inactive}
              color="red"
            />
            <StatCard
              icon={TrendingUp}
              label="7 ngày qua"
              value={stats.recent}
              color="purple"
            />
          </div>

          {/* Tabs */}
          <div className="bg-[#131A2C] border border-slate-800 rounded-xl p-1 flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex-1 py-2 px-3 rounded-lg text-xs font-medium 
                    transition-all duration-200 flex items-center justify-center gap-1.5
                    ${
                      isActive
                        ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                    }
                  `}
                >
                  <Icon size={14} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`
                        ml-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold
                        ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-slate-800 text-slate-400"
                        }
                      `}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= CONTENT AREA (SCROLLABLE) ================= */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full px-4 md:px-6 lg:px-8 pb-4">
          {/* TAB: LIST */}
          {activeTab === "list" && (
            <div className="h-full bg-[#131A2C] border border-slate-800 rounded-xl flex flex-col overflow-hidden">
              {/* Toolbar */}
              <div className="shrink-0 p-3 border-b border-slate-800 flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm email..."
                    className="w-full bg-[#0B0F19] border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:outline-none transition"
                  />
                </div>

                <div className="flex gap-1 bg-[#0B0F19] border border-slate-800 rounded-lg p-0.5 shrink-0">
                  {[
                    { id: "all", label: "Tất cả" },
                    { id: "active", label: "Active" },
                    { id: "inactive", label: "Inactive" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFilterStatus(f.id as any)}
                      className={`
                        px-2.5 py-1.5 rounded-md text-[11px] font-medium transition
                        ${
                          filterStatus === f.id
                            ? "bg-indigo-500 text-white"
                            : "text-slate-400 hover:text-white"
                        }
                      `}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable Table */}
              <div className="flex-1 overflow-auto">
                {loading ? (
                  <div className="p-12 text-center">
                    <Loader2
                      size={28}
                      className="mx-auto text-indigo-400 animate-spin mb-3"
                    />
                    <p className="text-slate-500 text-xs">Đang tải...</p>
                  </div>
                ) : filteredSubscribers.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title={
                      searchQuery || filterStatus !== "all"
                        ? "Không tìm thấy kết quả"
                        : "Chưa có subscriber nào"
                    }
                    description={
                      searchQuery || filterStatus !== "all"
                        ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                        : "Khi có người đăng ký từ footer, họ sẽ xuất hiện ở đây"
                    }
                  />
                ) : (
                  <>
                    {/* Desktop Table */}
                    <div className="hidden md:block">
                      <table className="w-full">
                        <thead className="sticky top-0 bg-[#0B0F19]/95 backdrop-blur-sm border-b border-slate-800 z-10">
                          <tr>
                            <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                              Ngày đăng ký
                            </th>
                            <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                              Trạng thái
                            </th>
                            <th className="text-right px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                              Thao tác
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                          {filteredSubscribers.map((sub) => (
                            <tr
                              key={sub._id}
                              className="hover:bg-slate-800/30 transition-colors group"
                            >
                              <td className="px-4 py-2.5">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center shrink-0">
                                    <span className="text-[11px] font-bold text-indigo-300">
                                      {sub.email.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-200 font-medium truncate max-w-[240px]">
                                    {sub.email}
                                  </p>
                                  <button
                                    onClick={() => handleCopyEmail(sub.email)}
                                    className="opacity-0 group-hover:opacity-100 transition p-1 rounded text-slate-500 hover:text-indigo-400"
                                    title="Copy email"
                                  >
                                    {copiedEmail === sub.email ? (
                                      <Check
                                        size={12}
                                        className="text-green-400"
                                      />
                                    ) : (
                                      <Copy size={12} />
                                    )}
                                  </button>
                                </div>
                              </td>
                              <td className="px-4 py-2.5">
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                  <Calendar size={11} />
                                  {new Date(sub.createdAt).toLocaleDateString(
                                    "vi-VN",
                                    {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    },
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-2.5 text-center">
                                <button
                                  onClick={() => handleToggle(sub._id)}
                                  className={`
                                    inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition
                                    ${
                                      sub.isActive
                                        ? "bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20"
                                        : "bg-slate-700/30 text-slate-400 border border-slate-700 hover:bg-slate-700/50"
                                    }
                                  `}
                                >
                                  {sub.isActive ? (
                                    <>
                                      <Eye size={11} /> Active
                                    </>
                                  ) : (
                                    <>
                                      <EyeOff size={11} /> Inactive
                                    </>
                                  )}
                                </button>
                              </td>
                              <td className="px-4 py-2.5 text-right">
                                <button
                                  onClick={() => handleDelete(sub._id)}
                                  className="p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                                  title="Xóa"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden divide-y divide-slate-800/50">
                      {filteredSubscribers.map((sub) => (
                        <div key={sub._id} className="p-3 space-y-2.5">
                          <div className="flex items-start gap-2.5">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center shrink-0">
                              <span className="text-xs font-bold text-indigo-300">
                                {sub.email.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-slate-200 font-medium break-all">
                                {sub.email}
                              </p>
                              <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                                <Clock size={9} />
                                {new Date(sub.createdAt).toLocaleDateString(
                                  "vi-VN",
                                )}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDelete(sub._id)}
                              className="p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleToggle(sub._id)}
                              className={`
                                flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition
                                ${
                                  sub.isActive
                                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                    : "bg-slate-700/30 text-slate-400 border border-slate-700"
                                }
                              `}
                            >
                              {sub.isActive ? (
                                <>
                                  <Eye size={11} /> Active
                                </>
                              ) : (
                                <>
                                  <EyeOff size={11} /> Inactive
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleCopyEmail(sub.email)}
                              className="px-2.5 py-1.5 rounded-md text-[11px] font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                            >
                              <Copy size={11} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Footer count */}
              {!loading && filteredSubscribers.length > 0 && (
                <div className="shrink-0 px-4 py-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    Hiển thị {filteredSubscribers.length} / {subscribers.length}{" "}
                    subscriber
                  </span>
                </div>
              )}
            </div>
          )}

          {/* TAB: BROADCAST */}
          {activeTab === "broadcast" && (
            <div className="h-full overflow-auto scroll">
              <div className="grid grid-cols-1 gap-4 pb-4">
                {/* Form */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-[#131A2C] border border-slate-800 rounded-xl p-4 md:p-5 space-y-4">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <Megaphone size={14} className="text-white" />
                      </div>
                      <div>
                        <h2 className="font-semibold text-white text-xs">
                          Soạn thông báo
                        </h2>
                        <p className="text-[10px] text-slate-500">
                          Gửi tới {stats.active} subscriber đang hoạt động
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Tiêu đề <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="VD: Dịch vụ mới sắp ra mắt..."
                        maxLength={150}
                        className="w-full bg-[#0B0F19] border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                      />
                      <p className="text-[10px] text-slate-600 mt-0.5 text-right">
                        {subject.length}/150
                      </p>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Nội dung <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={6}
                        placeholder="Nhập nội dung tin nhắn..."
                        className="w-full bg-[#0B0F19] border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition resize-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Ảnh đính kèm{" "}
                        <span className="text-slate-600 font-normal">
                          (tùy chọn)
                        </span>
                      </label>

                      {imageUrl ? (
                        <div className="relative inline-block group">
                          <img
                            src={imageUrl}
                            alt="preview"
                            className="max-h-44 rounded-lg border border-slate-800"
                          />
                          <button
                            onClick={() => setImageUrl("")}
                            className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition shadow-lg shadow-red-500/30"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-lg py-8 cursor-pointer hover:bg-indigo-500/5 transition group">
                          {uploading ? (
                            <Loader2
                              size={24}
                              className="text-indigo-400 animate-spin mb-1.5"
                            />
                          ) : (
                            <Upload
                              size={24}
                              className="text-slate-500 group-hover:text-indigo-400 mb-1.5 transition"
                            />
                          )}
                          <span className="text-xs text-slate-400 group-hover:text-slate-200 transition">
                            {uploading ? "Đang upload..." : "Click để chọn ảnh"}
                          </span>
                          <span className="text-[10px] text-slate-600 mt-0.5">
                            PNG, JPG, WEBP (tối đa 5MB)
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={uploading}
                          />
                        </label>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                      <button
                        onClick={() => setPreviewOpen(true)}
                        disabled={!subject || !content}
                        className="px-3.5 py-2.5 rounded-lg border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                      >
                        <Eye size={14} />
                        Xem trước
                      </button>
                      <button
                        onClick={handleSendBroadcast}
                        disabled={
                          sending || !subject || !content || stats.active === 0
                        }
                        className="flex-1 bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg py-2.5 text-xs font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-500/20"
                      >
                        {sending ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            Đang gửi...
                          </>
                        ) : (
                          <>
                            <Send size={14} />
                            Gửi tới {stats.active} người
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: HISTORY */}
          {activeTab === "history" && (
            <div className="h-full overflow-auto scroll">
              <div className="space-y-2.5 pb-4">
                {broadcasts.length === 0 ? (
                  <div className="bg-[#131A2C] border border-slate-800 rounded-xl">
                    <EmptyState
                      icon={History}
                      title="Chưa có broadcast nào"
                      description="Các thông báo bạn gửi sẽ xuất hiện ở đây"
                    />
                  </div>
                ) : (
                  broadcasts.map((b) => (
                    <BroadcastCard
                      key={b._id}
                      broadcast={b}
                      onDelete={() => handleDeleteBroadcast(b._id)}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= PREVIEW MODAL ================= */}
      {previewOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in"
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="bg-[#0F1626] border border-slate-800 rounded-xl w-full max-w-xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 shrink-0">
              <h3 className="font-semibold text-white text-xs flex items-center gap-1.5">
                <Eye size={14} className="text-indigo-400" />
                Preview Email Template
              </h3>
              <button
                onClick={() => setPreviewOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 bg-[#0B0F19] overflow-auto">
              <div className="max-w-md mx-auto bg-white rounded-lg overflow-hidden shadow-2xl">
                <div className="bg-gradient-to-br from-[#111] to-[#1f1f1f] p-5">
                  <div className="text-white font-extrabold text-base tracking-wider">
                    HAB CREATIVE
                  </div>
                  <div className="text-[#888] text-[9px] tracking-[2px] uppercase mt-0.5">
                    hab-creative.com
                  </div>
                </div>

                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt="banner"
                    className="w-full max-h-[200px] object-cover"
                  />
                )}

                <div className="p-5 pb-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {subject}
                  </h2>
                  <div className="h-0.5 w-10 bg-gray-900 rounded" />
                </div>

                <div className="px-5 pb-6">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-xs">
                    {content}
                  </p>
                  <div className="mt-5">
                    <span className="inline-block bg-gray-900 text-white text-[11px] font-semibold px-5 py-2.5 rounded-full">
                      Khám phá ngay
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 border-t border-gray-100 p-4">
                  <p className="text-[10px] text-gray-500 leading-relaxed">
                    Email này được gửi tới subscriber của{" "}
                    <strong>hab-creative.com</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-in {
          animation: fadeIn 0.2s ease-out;
        }
        /* Custom scrollbar */
        .scroll::-webkit-scrollbar {
          width: 6px;
        }
        .scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .scroll::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 3px;
        }
        .scroll::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
}

// ==================== STAT CARD ====================
function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: number;
  color: "blue" | "green" | "red" | "purple";
}) {
  const colors = {
    blue: {
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      icon: "text-blue-400",
      glow: "shadow-blue-500/5",
    },
    green: {
      bg: "bg-green-500/10",
      border: "border-green-500/20",
      icon: "text-green-400",
      glow: "shadow-green-500/5",
    },
    red: {
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      icon: "text-red-400",
      glow: "shadow-red-500/5",
    },
    purple: {
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      icon: "text-purple-400",
      glow: "shadow-purple-500/5",
    },
  };

  const c = colors[color];

  return (
    <div
      className={`bg-[#131A2C] border border-slate-800 rounded-xl p-3 hover:border-slate-700 transition-all duration-300 hover:shadow-lg ${c.glow} group`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div
          className={`w-7 h-7 rounded-md ${c.bg} border ${c.border} flex items-center justify-center`}
        >
          <Icon size={13} className={c.icon} />
        </div>
        <TrendingUp
          size={12}
          className="text-slate-600 group-hover:text-slate-400 transition"
        />
      </div>
      <p className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold mb-0.5">
        {label}
      </p>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  );
}

// ==================== EMPTY STATE ====================
function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) {
  return (
    <div className="p-10 md:p-14 text-center">
      <div className="w-14 h-14 mx-auto rounded-xl bg-slate-800/50 border border-slate-800 flex items-center justify-center mb-3">
        <Icon size={24} className="text-slate-600" />
      </div>
      <h3 className="text-xs font-semibold text-slate-300 mb-0.5">{title}</h3>
      <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
        {description}
      </p>
    </div>
  );
}

// ==================== BROADCAST CARD ====================
function BroadcastCard({
  broadcast,
  onDelete,
}: {
  broadcast: Broadcast;
  onDelete: () => void;
}) {
  const statusMap = {
    success: {
      bg: "bg-green-500/10",
      text: "text-green-400",
      border: "border-green-500/20",
      label: "Thành công",
      icon: CheckCircle2,
    },
    partial: {
      bg: "bg-yellow-500/10",
      text: "text-yellow-400",
      border: "border-yellow-500/20",
      label: "Một phần",
      icon: AlertTriangle,
    },
    failed: {
      bg: "bg-red-500/10",
      text: "text-red-400",
      border: "border-red-500/20",
      label: "Thất bại",
      icon: XCircle,
    },
  };

  const s =
    statusMap[broadcast.status as keyof typeof statusMap] || statusMap.failed;
  const StatusIcon = s.icon;

  return (
    <div className="bg-[#131A2C] border border-slate-800 rounded-xl p-3.5 md:p-4 flex flex-col md:flex-row gap-3 hover:border-slate-700 transition-all duration-300 group">
      {broadcast.imageUrl && (
        <img
          src={broadcast.imageUrl}
          alt=""
          className="w-full md:w-20 h-24 md:h-20 rounded-lg object-cover shrink-0 border border-slate-800"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-white text-xs truncate">
              {broadcast.subject}
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
              <Clock size={9} />
              {new Date(broadcast.createdAt).toLocaleString("vi-VN")}
            </p>
          </div>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition shrink-0"
            title="Xóa"
          >
            <Trash2 size={13} />
          </button>
        </div>

        <p className="text-[11px] text-slate-400 line-clamp-2 mb-2.5">
          {broadcast.content}
        </p>

        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${s.bg} ${s.text} border ${s.border}`}
          >
            <StatusIcon size={10} />
            {s.label}
          </span>

          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-green-500/10 text-green-400 border border-green-500/20">
            <CheckCircle2 size={10} />
            {broadcast.successCount} gửi
          </span>

          {broadcast.failedCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
              <XCircle size={10} />
              {broadcast.failedCount} lỗi
            </span>
          )}

          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
            <BarChart3 size={10} />
            {broadcast.recipientsCount} người nhận
          </span>
        </div>
      </div>
    </div>
  );
}
