"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Activity,
  Settings,
  Database,
  BarChart,
  RefreshCw,
  Download,
  Upload,
  Clock,
  FileText,
  Server,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Mail,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Ban,
  ShieldAlert,
  UserCheck,
  UserX,
  Crown,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Tabs
const TABS = {
  DASHBOARD: "dashboard",
  USERS: "users",
  ACTIVITIES: "activities",
  SETTINGS: "settings",
  BACKUP: "backup",
  WHITELIST: "whitelist",
  SYSTEM: "system",
};

const OWNER_EMAIL = "buihaitrong.dev@gmail.com";

export default function SuperAdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(TABS.DASHBOARD);

  // Dashboard stats
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Users
  const [users, setUsers] = useState<any[]>([]);

  // Activities
  const [activities, setActivities] = useState<any[]>([]);
  const [activityStats, setActivityStats] = useState<any>(null);

  // Settings
  const [settings, setSettings] = useState<any>(null);
  const [newWhitelistEmail, setNewWhitelistEmail] = useState("");
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);

  // ⭐ Blocked emails
  const [blockedEmails, setBlockedEmails] = useState<string[]>([]);
  const [blockEmail, setBlockEmail] = useState("");

  // Backup
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupHistory, setBackupHistory] = useState<any[]>([]);

  // System Info
  const [systemInfo, setSystemInfo] = useState<any>(null);

  // Toggle states
  const [showUserManagement, setShowUserManagement] = useState(true);
  const [showActivityFilters, setShowActivityFilters] = useState(false);
  const [activityFilter, setActivityFilter] = useState("all");
  const [isAuthorized, setIsAuthorized] = useState(false);

  const isOwner = user?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/me`, {
          credentials: "include",
        });
        const data = await res.json();

        if (data.success) {
          setUser(data.user);

          if (data.user.role === "super_admin") {
            setIsAuthorized(true);
            await Promise.all([
              fetchDashboardStats(),
              fetchUsers(),
              fetchActivities(),
              fetchSettings(),
              fetchSystemInfo(),
              fetchBlockedEmails(),
            ]);
          }
        }
      } catch (error) {
        console.error("Lỗi fetch user:", error);
        toast.error("Lỗi xác thực, vui lòng đăng nhập lại!");
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  const fetchDashboardStats = async () => {
    setStatsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/dashboard/stats`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (error) {
      console.error("Lỗi fetch stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/users`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch (error) {
      console.error("Lỗi fetch users:", error);
    }
  };

  const fetchActivities = async () => {
    try {
      const [logsRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/activities?limit=100`, {
          credentials: "include",
        }),
        fetch(`${API_URL}/api/admin/activities/stats`, {
          credentials: "include",
        }),
      ]);
      const logsData = await logsRes.json();
      const statsData = await statsRes.json();
      if (logsData.success) setActivities(logsData.data);
      if (statsData.success) setActivityStats(statsData.data);
    } catch (error) {
      console.error("Lỗi fetch activities:", error);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/settings`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
        setMaintenanceMessage(data.data?.maintenanceMode?.message || "");
        setMaintenanceEnabled(data.data?.maintenanceMode?.enabled || false);
      }
    } catch (error) {
      console.error("Lỗi fetch settings:", error);
    }
  };

  const fetchSystemInfo = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/system-info`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setSystemInfo(data.data);
    } catch (error) {
      console.error("Lỗi fetch system info:", error);
    }
  };

  // ⭐ Fetch blocked emails
  const fetchBlockedEmails = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/blocked-emails`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setBlockedEmails(data.data || []);
    } catch (error) {
      console.error("Lỗi fetch blocked emails:", error);
    }
  };

  const handleDeleteUser = async (id: string, name: string, email: string) => {
    if (email === OWNER_EMAIL) {
      toast.error("Không thể xóa tài khoản Owner!");
      return;
    }

    if (id === user?._id) {
      toast.error("Bạn không thể tự xóa chính mình!");
      return;
    }

    if (!confirm(`Bạn có chắc muốn xóa user "${name}"?`)) return;

    try {
      const res = await fetch(`${API_URL}/api/admin/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Xóa user thành công!");
        await Promise.all([fetchUsers(), fetchDashboardStats()]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Lỗi xóa user:", error);
      toast.error("Đã xảy ra lỗi khi xóa user!");
    }
  };

  const handleChangeRole = async (
    id: string,
    currentRole: string,
    email: string,
  ) => {
    if (email === OWNER_EMAIL) {
      toast.error("Không thể thay đổi role của Owner!");
      return;
    }

    if (id === user?._id) {
      toast.error("Bạn không thể tự hạ cấp chính mình!");
      return;
    }

    const newRole = currentRole === "admin" ? "super_admin" : "admin";

    if (currentRole === "super_admin" && newRole === "admin") {
      if (
        !confirm(`BẠN ĐANG HẠ CẤP SUPER ADMIN!

    Tài khoản: ${email}
    Hành động này sẽ khiến người này mất toàn bộ quyền Super Admin.
    Bạn có chắc chắn?`)
      ) {
        return;
      }
    }

    try {
      const res = await fetch(`${API_URL}/api/admin/users/${id}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Cập nhật role thành công!");
        fetchUsers();
        await logActivity("change_role", `${email} -> ${newRole}`);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Lỗi cập nhật role:", error);
      toast.error("Đã xảy ra lỗi khi cập nhật role!");
    }
  };

  const handleAddWhitelistEmail = async () => {
    if (!newWhitelistEmail.trim()) {
      toast.error("Vui lòng nhập email!");
      return;
    }
    try {
      const newEmails = [
        ...(settings?.whitelist?.emails || []),
        newWhitelistEmail.trim(),
      ];
      const res = await fetch(`${API_URL}/api/admin/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whitelist: { emails: newEmails },
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
        setNewWhitelistEmail("");
        toast.success("Thêm email vào whitelist thành công!");
        await logActivity(
          "update_whitelist",
          `Added ${newWhitelistEmail} to whitelist`,
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Lỗi thêm whitelist:", error);
      toast.error("Đã xảy ra lỗi khi thêm email!");
    }
  };

  const handleRemoveWhitelistEmail = async (email: string) => {
    if (!confirm(`Xóa email "${email}" khỏi whitelist?`)) return;
    try {
      const newEmails = (settings?.whitelist?.emails || []).filter(
        (e: string) => e !== email,
      );
      const res = await fetch(`${API_URL}/api/admin/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whitelist: { emails: newEmails },
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
        toast.success(`Xóa email "${email}" khỏi whitelist thành công!`);
        await logActivity(
          "update_whitelist",
          `Removed ${email} from whitelist`,
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Lỗi xóa whitelist:", error);
      toast.error("Đã xảy ra lỗi khi xóa email!");
    }
  };

  // ⭐ BLOCK EMAIL
  const handleBlockEmail = async (emailToBlock?: string) => {
    const targetEmail = (emailToBlock || blockEmail).trim().toLowerCase();

    if (!targetEmail) {
      toast.error("Vui lòng nhập email cần khóa!");
      return;
    }

    if (targetEmail === OWNER_EMAIL.toLowerCase()) {
      toast.error("🚫 Không thể khóa tài khoản Owner!");
      return;
    }

    if (
      !confirm(
        `Khóa email "${targetEmail}"?\n\nNgười này sẽ KHÔNG THỂ đăng nhập vào hệ thống!`,
      )
    )
      return;

    try {
      const res = await fetch(`${API_URL}/api/admin/block-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail }),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setBlockEmail("");
        await fetchBlockedEmails();
        await logActivity("block_email", `Blocked: ${targetEmail}`);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Block error:", error);
      toast.error("Lỗi khóa email!");
    }
  };

  // ⭐ UNBLOCK EMAIL
  const handleUnblockEmail = async (emailToUnblock: string) => {
    if (!confirm(`Mở khóa email "${emailToUnblock}"?`)) return;

    try {
      const res = await fetch(
        `${API_URL}/api/admin/unblock-email/${encodeURIComponent(emailToUnblock)}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        await fetchBlockedEmails();
        await logActivity("unblock_email", `Unblocked: ${emailToUnblock}`);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Unblock error:", error);
      toast.error("Lỗi mở khóa email!");
    }
  };

  const handleToggleMaintenance = async () => {
    try {
      const newStatus = !maintenanceEnabled;
      const res = await fetch(`${API_URL}/api/admin/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maintenanceMode: {
            enabled: newStatus,
            message:
              maintenanceMessage ||
              "Hệ thống đang được bảo trì. Vui lòng quay lại sau.",
          },
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
        setMaintenanceEnabled(newStatus);
        toast.success(`Chế độ bảo trì: ${newStatus ? "ĐÃ BẬT" : "ĐÃ TẮT"}`);
        await logActivity(
          "toggle_maintenance",
          `Maintenance mode: ${newStatus ? "ON" : "OFF"}`,
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Lỗi toggle maintenance:", error);
      toast.error("Đã xảy ra lỗi khi chuyển chế độ bảo trì!");
    }
  };

  const handleUpdateMaintenanceMessage = async () => {
    if (!maintenanceMessage.trim()) {
      toast.error("Vui lòng nhập thông báo bảo trì!");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/admin/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maintenanceMode: {
            enabled: maintenanceEnabled,
            message: maintenanceMessage,
          },
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
        toast.success("Cập nhật thông báo bảo trì thành công!");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Lỗi cập nhật maintenance message:", error);
      toast.error("Đã xảy ra lỗi khi cập nhật thông báo!");
    }
  };

  const handleBackup = async (type: "full" | "users" | "content") => {
    setBackupLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/backup?type=${type}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        const blob = new Blob([JSON.stringify(data.data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `backup_${type}_${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        const size = (blob.size / 1024).toFixed(2);
        setBackupHistory((prev) => [
          {
            id: Date.now(),
            type,
            timestamp: new Date().toISOString(),
            size: size + " KB",
          },
          ...prev,
        ]);

        toast.success(`Backup ${type} tạo thành công! (${size} KB)`);
        await logActivity(
          "backup_database",
          `Created ${type} backup (${size} KB)`,
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Lỗi backup:", error);
      toast.error("Lỗi khi tạo backup!");
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm("Restore sẽ ghi đè dữ liệu hiện tại. Bạn có chắc?")) return;

    try {
      const text = await file.text();
      const backup = JSON.parse(text);

      const res = await fetch(`${API_URL}/api/admin/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ backup }),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Restore database thành công!");
        await Promise.all([
          fetchUsers(),
          fetchSettings(),
          fetchDashboardStats(),
        ]);
        await logActivity(
          "restore_database",
          `Restored from backup (${file.name})`,
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Lỗi restore:", error);
      toast.error("Lỗi khi restore!");
    }
  };

  const logActivity = async (action: string, details: string) => {
    try {
      await fetch(`${API_URL}/api/admin/activities/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, details }),
        credentials: "include",
      });
    } catch (error) {
      console.error("Error logging activity:", error);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw size={32} className="text-indigo-400 animate-spin" />
          <p className="text-slate-400 text-sm">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized || !user || user.role !== "super_admin") {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center p-6">
        <div className="bg-[#131A2C] border border-red-500/30 p-8 max-w-md w-full text-center rounded-2xl">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={32} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Truy cập bị từ chối
          </h2>
          <p className="text-sm text-slate-400">
            Bạn không có quyền truy cập trang này.
          </p>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case TABS.DASHBOARD:
        return (
          <div className="space-y-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              <div className="bg-[#131A2C] rounded-2xl border border-slate-800 p-4 hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                    Projects
                  </p>
                  <FileText size={16} className="text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-white mt-2">
                  {stats?.total?.projects || 0}
                </p>
              </div>
              <div className="bg-[#131A2C] rounded-2xl border border-slate-800 p-4 hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                    Users
                  </p>
                  <Users size={16} className="text-purple-400" />
                </div>
                <p className="text-2xl font-bold text-white mt-2">
                  {stats?.total?.users || 0}
                </p>
              </div>
              <div className="bg-[#131A2C] rounded-2xl border border-slate-800 p-4 hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                    Activities
                  </p>
                  <Activity size={16} className="text-orange-400" />
                </div>
                <p className="text-2xl font-bold text-white mt-2">
                  {stats?.total?.activityLogs || 0}
                </p>
              </div>
              <div className="bg-[#131A2C] rounded-2xl border border-slate-800 p-4 hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                    Contacts
                  </p>
                  <Mail size={16} className="text-green-400" />
                </div>
                <p className="text-2xl font-bold text-white mt-2">
                  {stats?.total?.contacts || 0}
                </p>
              </div>
              <div className="bg-[#131A2C] rounded-2xl border border-slate-800 p-4 hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                    System
                  </p>
                  <Server size={16} className="text-emerald-400" />
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs text-slate-400">Online</span>
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-[#131A2C] rounded-2xl border border-slate-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">
                  Hoạt động gần đây
                </h3>
                <button
                  onClick={() => setActiveTab(TABS.ACTIVITIES)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition"
                >
                  Xem tất cả
                </button>
              </div>
              <div className="space-y-2">
                {stats?.recentActivities?.slice(0, 5).map((log: any) => (
                  <div
                    key={log._id}
                    className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-slate-800/50 transition border-b border-slate-800/50 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          log.action.includes("delete")
                            ? "bg-red-500/10"
                            : log.action.includes("create")
                              ? "bg-green-500/10"
                              : log.action.includes("update")
                                ? "bg-blue-500/10"
                                : "bg-slate-700/30"
                        }`}
                      >
                        {log.action.includes("delete") ? (
                          <Trash2 size={14} className="text-red-400" />
                        ) : log.action.includes("create") ? (
                          <Plus size={14} className="text-green-400" />
                        ) : log.action.includes("update") ? (
                          <RefreshCw size={14} className="text-blue-400" />
                        ) : (
                          <Activity size={14} className="text-slate-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">
                          {log.action}
                        </p>
                        <p className="text-xs text-slate-500">
                          {log.user?.name || "Unknown"} •{" "}
                          {formatDate(log.createdAt)}
                        </p>
                      </div>
                    </div>
                    {log.details && (
                      <span className="text-xs text-slate-500 max-w-xs truncate">
                        {log.details}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case TABS.USERS:
        return (
          <div className="bg-[#131A2C] rounded-2xl border border-slate-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-white">
                Quản lý tài khoản Admin
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
                  {users.length} tài khoản
                </span>
                <button
                  onClick={() => setShowUserManagement(!showUserManagement)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1"
                >
                  {showUserManagement ? (
                    <>
                      <ChevronDown size={12} /> Thu gọn
                    </>
                  ) : (
                    <>
                      <ChevronRight size={12} /> Mở rộng
                    </>
                  )}
                </button>
              </div>
            </div>
            {showUserManagement && (
              <div className="overflow-x-auto max-h-[65vh] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#0B0F19]/50 text-left border-b border-slate-800">
                    <tr>
                      <th className="px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        Tên
                      </th>
                      <th className="px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        Ngày tạo
                      </th>
                      <th className="px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {users.map((u) => (
                      <tr
                        key={u._id}
                        className="hover:bg-slate-800/30 transition"
                      >
                        <td className="px-5 py-3 font-medium text-white flex items-center gap-2">
                          {u.avatar && (
                            <img
                              src={u.avatar}
                              alt={u.name}
                              className="w-7 h-7 rounded-full border border-slate-700"
                            />
                          )}
                          {u.name}
                        </td>
                        <td className="px-5 py-3 text-slate-400 text-xs">
                          {u.email}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${
                              u.role === "super_admin"
                                ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-500 text-xs">
                          {formatDate(u.createdAt)}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex gap-2">
                            {u.email !== OWNER_EMAIL && (
                              <button
                                onClick={() =>
                                  handleChangeRole(u._id, u.role, u.email)
                                }
                                className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                              >
                                Đổi role
                              </button>
                            )}
                            {u.email === OWNER_EMAIL && (
                              <span className="text-[10px] px-2.5 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full font-bold flex items-center gap-1">
                                <Crown size={10} /> OWNER
                              </span>
                            )}

                            {u.email !== OWNER_EMAIL &&
                              u.email !== user?.email &&
                              u.role !== "super_admin" && (
                                <button
                                  onClick={() =>
                                    handleDeleteUser(u._id, u.name, u.email)
                                  }
                                  className="text-xs px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition"
                                >
                                  Xóa
                                </button>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case TABS.ACTIVITIES:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-[#131A2C] rounded-2xl border border-slate-800 p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                  Tổng hoạt động
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  {activityStats?.total || 0}
                </p>
              </div>
              <div className="bg-[#131A2C] rounded-2xl border border-slate-800 p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                  Hôm nay
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  {activityStats?.daily?.filter(
                    (d: any) =>
                      d._id === new Date().toISOString().split("T")[0],
                  )[0]?.count || 0}
                </p>
              </div>
              <div className="bg-[#131A2C] rounded-2xl border border-slate-800 p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                  7 ngày qua
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  {activityStats?.daily?.reduce(
                    (sum: number, d: any) => sum + d.count,
                    0,
                  ) || 0}
                </p>
              </div>
              <div className="bg-[#131A2C] rounded-2xl border border-slate-800 p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                  Action nhiều nhất
                </p>
                <p className="text-sm font-bold text-white mt-1 truncate">
                  {activityStats?.byAction?.[0]?._id || "N/A"}
                </p>
                <p className="text-xs text-slate-500">
                  {activityStats?.byAction?.[0]?.count || 0} lần
                </p>
              </div>
            </div>

            <div className="bg-[#131A2C] rounded-2xl border border-slate-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">
                  Lịch sử hoạt động chi tiết
                </h2>
                <button
                  onClick={() => setShowActivityFilters(!showActivityFilters)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition"
                >
                  {showActivityFilters ? "Ẩn filter" : "Hiện filter"}
                </button>
              </div>
              {showActivityFilters && (
                <div className="px-5 py-3 border-b border-slate-800 bg-[#0B0F19]/50 flex flex-wrap gap-2">
                  {["all", "login", "create", "update", "delete"].map(
                    (filter) => (
                      <button
                        key={filter}
                        onClick={() => setActivityFilter(filter)}
                        className={`text-xs px-3 py-1.5 rounded-full transition ${
                          activityFilter === filter
                            ? "bg-indigo-500 text-white"
                            : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                        }`}
                      >
                        {filter === "all"
                          ? "Tất cả"
                          : filter === "login"
                            ? "Đăng nhập"
                            : filter === "create"
                              ? "Tạo mới"
                              : filter === "update"
                                ? "Cập nhật"
                                : "Xóa"}
                      </button>
                    ),
                  )}
                </div>
              )}
              <div className="divide-y divide-slate-800/50 max-h-[500px] overflow-y-auto">
                {activities
                  .filter((log) => {
                    if (activityFilter === "all") return true;
                    if (activityFilter === "login")
                      return log.action === "login";
                    if (activityFilter === "create")
                      return log.action.includes("create");
                    if (activityFilter === "update")
                      return log.action.includes("update");
                    if (activityFilter === "delete")
                      return log.action.includes("delete");
                    return true;
                  })
                  .map((log) => (
                    <div
                      key={log._id}
                      className="px-5 py-3 hover:bg-slate-800/30 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] px-2.5 py-1 rounded-full font-semibold border ${
                                log.action.includes("delete")
                                  ? "bg-red-500/10 text-red-400 border-red-500/20"
                                  : log.action.includes("create")
                                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                                    : log.action.includes("update")
                                      ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                      : "bg-slate-800 text-slate-400 border-slate-700"
                              }`}
                            >
                              {log.action}
                            </span>
                            <span className="text-xs text-slate-500">
                              {formatDate(log.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-white mt-1.5">
                            {log.user?.name || "Unknown"} •{" "}
                            <span className="text-slate-500">
                              {log.user?.email || "N/A"}
                            </span>
                          </p>
                          {log.details && (
                            <p className="text-xs text-slate-500 mt-1">
                              {log.details}
                            </p>
                          )}
                          {log.ip && (
                            <p className="text-xs text-slate-600 mt-0.5">
                              IP: {log.ip}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        );

      case TABS.SETTINGS:
        return (
          <div className="space-y-4">
            <div className="bg-[#131A2C] rounded-2xl border border-slate-800 p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Settings size={16} className="text-slate-400" />
                Cài đặt hệ thống
              </h3>
              <div className="space-y-5">
                {/* Maintenance Mode */}
                <div className="border-b border-slate-800 pb-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">
                        Chế độ bảo trì
                      </p>
                      <p className="text-xs text-slate-500">
                        {maintenanceEnabled ? "Đang bật" : "Đang tắt"}
                      </p>
                    </div>
                    <button
                      onClick={handleToggleMaintenance}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                        maintenanceEnabled
                          ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                          : "bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20"
                      }`}
                    >
                      {maintenanceEnabled ? (
                        <Lock size={14} />
                      ) : (
                        <Unlock size={14} />
                      )}
                      {maintenanceEnabled ? "Tắt bảo trì" : "Bật bảo trì"}
                    </button>
                  </div>
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                      Thông báo bảo trì
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={maintenanceMessage}
                        onChange={(e) => setMaintenanceMessage(e.target.value)}
                        className="flex-1 px-4 py-2.5 bg-[#0B0F19] border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                        placeholder="Nhập thông báo bảo trì..."
                      />
                      <button
                        onClick={handleUpdateMaintenanceMessage}
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-xl transition"
                      >
                        Cập nhật
                      </button>
                    </div>
                    {maintenanceEnabled && (
                      <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                        <p className="text-xs text-yellow-400 flex items-center gap-2">
                          <AlertTriangle size={14} />
                          Người dùng sẽ thấy thông báo bảo trì khi truy cập hệ
                          thống.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* System Info */}
                <div>
                  <p className="text-sm font-medium text-white mb-3">
                    Thông tin hệ thống
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-[#0B0F19] border border-slate-800 rounded-xl p-3">
                      <p className="text-xs text-slate-500">Node.js</p>
                      <p className="text-sm font-medium text-white mt-0.5">
                        {systemInfo?.nodeVersion || "N/A"}
                      </p>
                    </div>
                    <div className="bg-[#0B0F19] border border-slate-800 rounded-xl p-3">
                      <p className="text-xs text-slate-500">Database</p>
                      <p className="text-sm font-medium text-white mt-0.5">
                        {systemInfo?.database || "MongoDB"}
                      </p>
                    </div>
                    <div className="bg-[#0B0F19] border border-slate-800 rounded-xl p-3">
                      <p className="text-xs text-slate-500">Environment</p>
                      <p className="text-sm font-medium text-white mt-0.5">
                        {systemInfo?.environment || "Development"}
                      </p>
                    </div>
                    <div className="bg-[#0B0F19] border border-slate-800 rounded-xl p-3">
                      <p className="text-xs text-slate-500">Uptime</p>
                      <p className="text-sm font-medium text-white mt-0.5">
                        {systemInfo?.uptime || "N/A"}
                      </p>
                    </div>
                    <div className="bg-[#0B0F19] border border-slate-800 rounded-xl p-3">
                      <p className="text-xs text-slate-500">Memory</p>
                      <p className="text-sm font-medium text-white mt-0.5">
                        {systemInfo?.memory?.usage ||
                          systemInfo?.memoryUsage ||
                          "N/A"}
                      </p>
                    </div>
                    <div className="bg-[#0B0F19] border border-slate-800 rounded-xl p-3">
                      <p className="text-xs text-slate-500">CPU</p>
                      <p className="text-sm font-medium text-white mt-0.5">
                        {systemInfo?.cpu || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case TABS.WHITELIST:
        return (
          <div className="space-y-4">
            {/* ⭐ BLOCKED EMAILS — Chỉ Owner */}
            {isOwner && (
              <div className="bg-[#131A2C] rounded-2xl border border-red-500/20 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <Ban size={14} className="text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-white">
                      Danh sách Email bị khóa
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Chỉ Owner · {blockedEmails.length} email bị khóa
                    </p>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full font-semibold flex items-center gap-1">
                    <Crown size={10} /> OWNER
                  </span>
                </div>

                <p className="text-xs text-slate-400 mb-4">
                  Những email trong danh sách này sẽ{" "}
                  <strong className="text-red-400">KHÔNG THỂ ĐĂNG NHẬP</strong>{" "}
                  vào hệ thống, kể cả khi có trong whitelist.
                </p>

                <div className="flex gap-2 mb-4">
                  <input
                    type="email"
                    placeholder="Nhập email cần khóa..."
                    value={blockEmail}
                    onChange={(e) => setBlockEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleBlockEmail();
                    }}
                    className="flex-1 px-4 py-2.5 bg-[#0B0F19] border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-red-500 transition"
                  />
                  <button
                    onClick={() => handleBlockEmail()}
                    className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-xl transition flex items-center gap-2"
                  >
                    <Ban size={14} /> Khóa
                  </button>
                </div>

                <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                  {blockedEmails.length === 0 ? (
                    <div className="text-center py-8 bg-[#0B0F19] rounded-xl border border-slate-800">
                      <Unlock
                        size={24}
                        className="mx-auto text-slate-600 mb-2"
                      />
                      <p className="text-xs text-slate-500">
                        Chưa có email nào bị khóa
                      </p>
                    </div>
                  ) : (
                    blockedEmails.map((email: string) => (
                      <div
                        key={email}
                        className="flex items-center justify-between py-3 px-4 bg-red-500/5 rounded-xl border border-red-500/20 hover:bg-red-500/10 transition"
                      >
                        <div className="flex items-center gap-3">
                          <Ban size={14} className="text-red-400" />
                          <span className="text-sm text-slate-200">
                            {email}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full font-semibold">
                            Blocked
                          </span>
                        </div>
                        <button
                          onClick={() => handleUnblockEmail(email)}
                          className="text-xs px-3 py-1.5 rounded-lg text-green-400 hover:bg-green-500/10 transition font-medium"
                        >
                          Mở khóa
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* WHITELIST */}
            <div className="bg-[#131A2C] rounded-2xl border border-slate-800 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <ShieldCheck size={14} className="text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-white">
                    Quản lý Whitelist
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {settings?.whitelist?.emails?.length || 0} email được phép
                    login
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Chỉ những email trong danh sách này mới được phép đăng nhập.
              </p>

              <div className="flex gap-2 mb-4">
                <input
                  type="email"
                  placeholder="Nhập email..."
                  value={newWhitelistEmail}
                  onChange={(e) => setNewWhitelistEmail(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-[#0B0F19] border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                />
                <button
                  onClick={handleAddWhitelistEmail}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition flex items-center gap-2"
                >
                  <Plus size={14} /> Thêm
                </button>
              </div>

              {/* ⭐ SCROLL ĐƯỢC */}
              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {settings?.whitelist?.emails?.map((email: string) => {
                  const isBlocked = blockedEmails.includes(email.toLowerCase());
                  const isOwnerEmail =
                    email.toLowerCase() === OWNER_EMAIL.toLowerCase();

                  return (
                    <div
                      key={email}
                      className={`flex items-center justify-between py-3 px-4 rounded-xl transition border gap-3 ${
                        isBlocked
                          ? "bg-red-500/5 border-red-500/20"
                          : "bg-[#0B0F19] border-slate-800 hover:bg-slate-800/50"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Mail
                          size={14}
                          className={`shrink-0 ${isBlocked ? "text-red-400" : "text-slate-500"}`}
                        />
                        <span className="text-sm text-slate-200 truncate min-w-0 flex-1">
                          {email}
                        </span>
                        {isOwnerEmail && (
                          <span className="text-[10px] px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full font-semibold flex items-center gap-1 shrink-0">
                            <Crown size={9} /> Owner
                          </span>
                        )}
                        {isBlocked && !isOwnerEmail && (
                          <span className="text-[10px] px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full font-semibold shrink-0">
                            Đã khóa
                          </span>
                        )}
                      </div>

                      <div className="flex gap-1 shrink-0">
                        {!isOwnerEmail && isOwner && (
                          <>
                            {isBlocked ? (
                              <button
                                onClick={() => handleUnblockEmail(email)}
                                className="text-xs px-3 py-1.5 rounded-lg text-green-400 hover:bg-green-500/10 transition font-medium"
                              >
                                Mở khóa
                              </button>
                            ) : (
                              <button
                                onClick={() => handleBlockEmail(email)}
                                className="text-xs px-3 py-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition font-medium flex items-center gap-1"
                              >
                                <Ban size={12} /> Khóa
                              </button>
                            )}
                          </>
                        )}

                        <button
                          onClick={() => handleRemoveWhitelistEmail(email)}
                          className={`text-xs px-3 py-1.5 rounded-lg transition font-medium ${
                            isOwnerEmail
                              ? "text-slate-600 cursor-not-allowed"
                              : "text-red-400 hover:bg-red-500/10"
                          }`}
                          disabled={isOwnerEmail}
                        >
                          {isOwnerEmail ? "Không thể xóa" : "Xóa"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case TABS.BACKUP:
        return (
          <div className="space-y-4">
            <div className="bg-[#131A2C] rounded-2xl border border-slate-800 p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Database size={16} className="text-emerald-400" />
                Backup & Restore
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                <button
                  onClick={() => handleBackup("full")}
                  disabled={backupLoading}
                  className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Download size={14} />
                  Full Backup
                </button>
                <button
                  onClick={() => handleBackup("users")}
                  disabled={backupLoading}
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Users size={14} />
                  Users Backup
                </button>
                <button
                  onClick={() => handleBackup("content")}
                  disabled={backupLoading}
                  className="px-4 py-3 bg-green-600 hover:bg-green-500 text-white text-xs font-semibold rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <FileText size={14} />
                  Content Backup
                </button>
              </div>

              <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center hover:border-indigo-500/50 transition bg-[#0B0F19]">
                <Upload size={24} className="mx-auto text-slate-500 mb-2" />
                <p className="text-sm text-slate-400">
                  Kéo thả file backup vào đây hoặc
                </p>
                <label className="inline-block mt-3 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-xl cursor-pointer transition">
                  Chọn file
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleRestore}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-slate-600 mt-2">
                  Chỉ hỗ trợ file .json
                </p>
              </div>
            </div>

            <div className="bg-[#131A2C] rounded-2xl border border-slate-800 p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Clock size={16} className="text-slate-400" />
                Lịch sử backup
              </h3>
              {backupHistory.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">
                  Chưa có backup nào được tạo
                </p>
              ) : (
                <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                  {backupHistory.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-3 px-4 bg-[#0B0F19] border border-slate-800 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <Download size={14} className="text-slate-500" />
                        <div>
                          <p className="text-sm font-medium text-white">
                            {item.type === "full"
                              ? "Full Backup"
                              : item.type === "users"
                                ? "Users Backup"
                                : "Content Backup"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatDate(item.timestamp)}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-slate-500">
                        {item.size}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case TABS.SYSTEM:
        return (
          <div className="space-y-4">
            <div className="bg-[#131A2C] rounded-2xl border border-slate-800 p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Server size={16} className="text-blue-400" />
                Tình trạng hệ thống
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-[#0B0F19] border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-300">Database</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-xs text-emerald-400 font-medium">
                        Online
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5">
                    Kết nối MongoDB thành công
                  </p>
                </div>
                <div className="bg-[#0B0F19] border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-300">API Server</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-xs text-emerald-400 font-medium">
                        Online
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5">
                    Port {systemInfo?.port || "5000"}
                  </p>
                </div>
                <div className="bg-[#0B0F19] border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-300">Memory Usage</p>
                    <span className="text-xs text-slate-400">
                      {systemInfo?.memory?.usage ||
                        systemInfo?.memoryUsage ||
                        "N/A"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5">
                    {systemInfo?.memory?.total || systemInfo?.memory || "N/A"}
                  </p>
                </div>
                <div className="bg-[#0B0F19] border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-300">Last Backup</p>
                    <span className="text-xs text-slate-400">
                      {backupHistory[0]
                        ? formatDate(backupHistory[0].timestamp)
                        : "Chưa có"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5">
                    {backupHistory[0]
                      ? `${backupHistory[0].type} - ${backupHistory[0].size}`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#131A2C] rounded-2xl border border-slate-800 p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Zap size={16} className="text-yellow-400" />
                Hành động nhanh
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    if (confirm("Xóa toàn bộ cache?")) {
                      toast.success("Đã xóa cache!");
                    }
                  }}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition flex items-center justify-center gap-2"
                >
                  <RefreshCw size={14} /> Xóa Cache
                </button>
                <button
                  onClick={() => {
                    if (confirm("Xuất báo cáo hệ thống?")) {
                      toast.success("Đã xuất báo cáo!");
                    }
                  }}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition flex items-center justify-center gap-2"
                >
                  <FileText size={14} /> Xuất báo cáo
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const tabIcons: Record<string, any> = {
    DASHBOARD: BarChart,
    USERS: Users,
    ACTIVITIES: Activity,
    WHITELIST: ShieldCheck,
    BACKUP: Database,
    SETTINGS: Settings,
    SYSTEM: Server,
  };

  const tabLabels: Record<string, string> = {
    DASHBOARD: "Dashboard",
    USERS: "Users",
    ACTIVITIES: "Activities",
    WHITELIST: "Access Control",
    BACKUP: "Backup",
    SETTINGS: "Settings",
    SYSTEM: "System",
  };

  return (
    <div className="h-screen bg-[#0B0F19] text-slate-200 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-4 pb-24">
        {/* ================= HEADER ================= */}
        <div className="bg-[#131A2C] border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <ShieldCheck size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  Super Admin
                  {isOwner && (
                    <span className="text-[10px] px-2 py-0.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border border-yellow-500/30 rounded-full font-semibold flex items-center gap-1">
                      <Crown size={9} /> OWNER
                    </span>
                  )}
                </h1>
                <p className="text-xs text-slate-500">
                  Quản trị hệ thống & người dùng
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push("/")}
                className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-xl transition"
              >
                <Users size={14} />
                Trang chủ
              </button>
            </div>
          </div>
        </div>

        {/* ================= TABS NAVIGATION ================= */}
        <div className="bg-[#131A2C] border border-slate-800 rounded-2xl p-1.5 flex flex-wrap gap-1.5 sticky top-0 z-30 backdrop-blur-sm bg-[#131A2C]/95">
          {Object.entries(TABS).map(([key, value]) => {
            const Icon = tabIcons[key];
            const isActive = activeTab === value;

            return (
              <button
                key={key}
                onClick={() => setActiveTab(value)}
                className={`
                  px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 flex items-center gap-2
                  ${
                    isActive
                      ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  }
                `}
              >
                {Icon && <Icon size={14} />}
                <span className="hidden sm:inline">
                  {tabLabels[key] || key}
                </span>
              </button>
            );
          })}
        </div>

        {/* ================= TAB CONTENT ================= */}
        <div>{renderTabContent()}</div>
      </div>
    </div>
  );
}
