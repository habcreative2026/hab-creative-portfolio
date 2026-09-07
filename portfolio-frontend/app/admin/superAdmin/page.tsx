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
            setIsAuthorized(true); // Cho phép truy cập
            await Promise.all([
              fetchDashboardStats(),
              fetchUsers(),
              fetchActivities(),
              fetchSettings(),
              fetchSystemInfo(),
            ]);
          } else if (data.user.role === "admin") {
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
      if (data.success) {
        setStats(data.data);
      }
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
      if (data.success) {
        setUsers(data.data);
      }
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
      if (data.success) {
        setSystemInfo(data.data);
      }
    } catch (error) {
      console.error("Lỗi fetch system info:", error);
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

        // Log activity
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-sm text-gray-500">
        Đang tải...
      </div>
    );
  }

  if (!isAuthorized || !user || user.role !== "super_admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Truy cập bị từ chối
          </h2>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "super_admin") {
    return null;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case TABS.DASHBOARD:
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Projects</p>
                  <FileText size={18} className="text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {stats?.total?.projects || 0}
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Users</p>
                  <Users size={18} className="text-purple-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {stats?.total?.users || 0}
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Activities</p>
                  <Activity size={18} className="text-orange-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {stats?.total?.activityLogs || 0}
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Contacts</p>
                  <Mail size={18} className="text-green-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {stats?.total?.contacts || 0}
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">System Status</p>
                  <Server size={18} className="text-emerald-500" />
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs text-gray-600">Online</span>
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">
                  Hoạt động gần đây
                </h3>
                <button
                  onClick={() => setActiveTab(TABS.ACTIVITIES)}
                  className="text-xs text-indigo-600 hover:text-indigo-700"
                >
                  Xem tất cả
                </button>
              </div>
              <div className="space-y-3">
                {stats?.recentActivities?.slice(0, 5).map((log: any) => (
                  <div
                    key={log._id}
                    className="flex items-center justify-between py-2 border-b border-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-1.5 rounded-lg ${
                          log.action.includes("delete")
                            ? "bg-red-50"
                            : log.action.includes("create")
                              ? "bg-green-50"
                              : log.action.includes("update")
                                ? "bg-blue-50"
                                : "bg-gray-50"
                        }`}
                      >
                        {log.action.includes("delete") ? (
                          <Trash2 size={14} className="text-red-500" />
                        ) : log.action.includes("create") ? (
                          <Plus size={14} className="text-green-500" />
                        ) : log.action.includes("update") ? (
                          <RefreshCw size={14} className="text-blue-500" />
                        ) : (
                          <Activity size={14} className="text-gray-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-900">{log.action}</p>
                        <p className="text-xs text-gray-500">
                          {log.user?.name || "Unknown"} •{" "}
                          {formatDate(log.createdAt)}
                        </p>
                      </div>
                    </div>
                    {log.details && (
                      <span className="text-xs text-gray-400 max-w-xs truncate">
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
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-sm font-semibold text-gray-900">
                Quản lý tài khoản Admin
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {users.length} tài khoản
                </span>
                <button
                  onClick={() => setShowUserManagement(!showUserManagement)}
                  className="text-xs text-indigo-600 hover:text-indigo-700"
                >
                  {showUserManagement ? "Thu gọn" : "Mở rộng"}
                </button>
              </div>
            </div>
            {showUserManagement && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left">
                    <tr>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                        Tên
                      </th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                        Email
                      </th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                        Role
                      </th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                        2FA
                      </th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                        Ngày tạo
                      </th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((u) => (
                      <tr
                        key={u._id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-3 font-medium text-gray-900 flex items-center gap-2">
                          {u.avatar && (
                            <img
                              src={u.avatar}
                              alt={u.name}
                              className="w-6 h-6 rounded-full"
                            />
                          )}
                          {u.name}
                        </td>
                        <td className="px-6 py-3 text-gray-600">{u.email}</td>
                        <td className="px-6 py-3">
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                              u.role === "super_admin"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                              u.twoFactorSecret
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {u.twoFactorSecret ? "Bật" : "Tắt"}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-gray-500 text-xs">
                          {formatDate(u.createdAt)}
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex gap-2">
                            {u.email !== OWNER_EMAIL && (
                              <button
                                onClick={() =>
                                  handleChangeRole(u._id, u.role, u.email)
                                }
                                className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                              >
                                Đổi role
                              </button>
                            )}
                            {u.email === OWNER_EMAIL && (
                              <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-bold">
                                OWNER
                              </span>
                            )}

                            {u.email !== OWNER_EMAIL &&
                              u.email !== user?.email &&
                              u.role !== "super_admin" && (
                                <button
                                  onClick={() =>
                                    handleDeleteUser(u._id, u.name, u.email)
                                  }
                                  className="text-xs px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
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
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-sm text-gray-500">Tổng hoạt động</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activityStats?.total || 0}
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-sm text-gray-500">Hôm nay</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activityStats?.daily?.filter(
                    (d: any) =>
                      d._id === new Date().toISOString().split("T")[0],
                  )[0]?.count || 0}
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-sm text-gray-500">7 ngày qua</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activityStats?.daily?.reduce(
                    (sum: number, d: any) => sum + d.count,
                    0,
                  ) || 0}
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-sm text-gray-500">Action nhiều nhất</p>
                <p className="text-lg font-bold text-gray-900 truncate">
                  {activityStats?.byAction?.[0]?._id || "N/A"}
                </p>
                <p className="text-xs text-gray-500">
                  {activityStats?.byAction?.[0]?.count || 0} lần
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">
                  Lịch sử hoạt động chi tiết
                </h2>
                <button
                  onClick={() => setShowActivityFilters(!showActivityFilters)}
                  className="text-xs text-indigo-600 hover:text-indigo-700"
                >
                  {showActivityFilters ? "Ẩn filter" : "Hiện filter"}
                </button>
              </div>
              {showActivityFilters && (
                <div className="px-6 py-3 border-b border-gray-100 bg-gray-50/50 flex flex-wrap gap-2">
                  {["all", "login", "create", "update", "delete"].map(
                    (filter) => (
                      <button
                        key={filter}
                        onClick={() => setActivityFilter(filter)}
                        className={`text-xs px-3 py-1 rounded-full transition-colors ${
                          activityFilter === filter
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
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
              <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
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
                      className="px-6 py-3 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                log.action.includes("delete")
                                  ? "bg-red-100 text-red-700"
                                  : log.action.includes("create")
                                    ? "bg-green-100 text-green-700"
                                    : log.action.includes("update")
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {log.action}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatDate(log.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mt-1">
                            {log.user?.name || "Unknown"} •{" "}
                            {log.user?.email || "N/A"}
                          </p>
                          {log.details && (
                            <p className="text-xs text-gray-500 mt-1">
                              {log.details}
                            </p>
                          )}
                          {log.ip && (
                            <p className="text-xs text-gray-400 mt-0.5">
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
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Settings size={16} className="text-gray-500" />
                Cài đặt hệ thống
              </h3>
              <div className="space-y-6">
                {/* Maintenance Mode */}
                <div className="border-b border-gray-100 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Chế độ bảo trì
                      </p>
                      <p className="text-xs text-gray-500">
                        {maintenanceEnabled ? "Đang bật" : "Đang tắt"}
                      </p>
                    </div>
                    <button
                      onClick={handleToggleMaintenance}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
                        maintenanceEnabled
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {maintenanceEnabled ? (
                        <Lock size={16} />
                      ) : (
                        <Unlock size={16} />
                      )}
                      {maintenanceEnabled ? "Tắt bảo trì" : "Bật bảo trì"}
                    </button>
                  </div>
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Thông báo bảo trì
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={maintenanceMessage}
                        onChange={(e) => setMaintenanceMessage(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                        placeholder="Nhập thông báo bảo trì..."
                      />
                      <button
                        onClick={handleUpdateMaintenanceMessage}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
                      >
                        Cập nhật
                      </button>
                    </div>
                    {maintenanceEnabled && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-xs text-yellow-700 flex items-center gap-2">
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
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Thông tin hệ thống
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500">Node.js</p>
                      <p className="text-sm font-medium text-gray-900">
                        {systemInfo?.nodeVersion || "N/A"}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500">Database</p>
                      <p className="text-sm font-medium text-gray-900">
                        {systemInfo?.database || "MongoDB"}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500">Environment</p>
                      <p className="text-sm font-medium text-gray-900">
                        {systemInfo?.environment || "Development"}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500">Uptime</p>
                      <p className="text-sm font-medium text-gray-900">
                        {systemInfo?.uptime || "N/A"}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500">Memory Usage</p>
                      <p className="text-sm font-medium text-gray-900">
                        {systemInfo?.memory?.usage ||
                          systemInfo?.memoryUsage ||
                          "N/A"}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500">CPU</p>
                      <p className="text-sm font-medium text-gray-900">
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
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ShieldCheck size={16} className="text-purple-500" />
              Quản lý Whitelist
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Chỉ những email trong danh sách này mới được phép đăng nhập.
            </p>

            <div className="flex gap-2 mb-4">
              <input
                type="email"
                placeholder="Nhập email..."
                value={newWhitelistEmail}
                onChange={(e) => setNewWhitelistEmail(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleAddWhitelistEmail}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-1"
              >
                <Plus size={16} /> Thêm
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {settings?.whitelist?.emails?.map((email: string) => (
                <div
                  key={email}
                  className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-700">{email}</span>
                    {email === "buihaitrong.dev@gmail.com" && (
                      <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                        Owner
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveWhitelistEmail(email)}
                    className={`text-xs px-3 py-1 rounded-lg transition-colors ${
                      email === "buihaitrong.dev@gmail.com"
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-red-500 hover:bg-red-50"
                    }`}
                    disabled={email === "buihaitrong.dev@gmail.com"}
                  >
                    {email === "buihaitrong.dev@gmail.com"
                      ? "Không thể xóa"
                      : "Xóa"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case TABS.BACKUP:
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Database size={16} className="text-emerald-500" />
                Backup & Restore
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                <button
                  onClick={() => handleBackup("full")}
                  disabled={backupLoading}
                  className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  Full Backup
                </button>
                <button
                  onClick={() => handleBackup("users")}
                  disabled={backupLoading}
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Users size={16} />
                  Users Backup
                </button>
                <button
                  onClick={() => handleBackup("content")}
                  disabled={backupLoading}
                  className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <FileText size={16} />
                  Content Backup
                </button>
              </div>

              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-indigo-300 transition-colors">
                <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">
                  Kéo thả file backup vào đây hoặc
                </p>
                <label className="inline-block mt-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl cursor-pointer transition-colors">
                  Chọn file
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleRestore}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-400 mt-2">
                  Chỉ hỗ trợ file .json
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock size={16} className="text-gray-500" />
                Lịch sử backup
              </h3>
              {backupHistory.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  Chưa có backup nào được tạo
                </p>
              ) : (
                <div className="space-y-2">
                  {backupHistory.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <Download size={16} className="text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            {item.type === "full"
                              ? "Full Backup"
                              : item.type === "users"
                                ? "Users Backup"
                                : "Content Backup"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(item.timestamp)}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">{item.size}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case TABS.SYSTEM:
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Server size={16} className="text-blue-500" />
                Tình trạng hệ thống
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-700">Database</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-xs text-emerald-600">Online</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Kết nối MongoDB thành công
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-700">API Server</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-xs text-emerald-600">Online</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Port {systemInfo?.port || "5000"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-700">Memory Usage</p>
                    <span className="text-xs text-gray-600">
                      {systemInfo?.memory?.usage ||
                        systemInfo?.memoryUsage ||
                        "N/A"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {systemInfo?.memory?.total || systemInfo?.memory || "N/A"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-700">Last Backup</p>
                    <span className="text-xs text-gray-600">
                      {backupHistory[0]
                        ? formatDate(backupHistory[0].timestamp)
                        : "Chưa có"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {backupHistory[0]
                      ? `${backupHistory[0].type} - ${backupHistory[0].size}`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Zap size={16} className="text-yellow-500" />
                Hành động nhanh
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    if (confirm("Xóa toàn bộ cache?")) {
                      toast.success("Đã xóa cache!");
                    }
                  }}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw size={16} /> Xóa Cache
                </button>
                <button
                  onClick={() => {
                    if (confirm("Xuất báo cáo hệ thống?")) {
                      toast.success("Đã xuất báo cáo!");
                    }
                  }}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <FileText size={16} /> Xuất báo cáo
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="scroll-none bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  Super Admin
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push("/")}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Trang chủ
              </button>
              {/* <TwoFactorAuthModal
                has2FA={user?.has2FA || false}
                onActivationSuccess={() => {
                  toast.success("Kích hoạt 2FA thành công!");
                  setUser({ ...user, has2FA: true });
                }}
              /> */}
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 max-h-[100vh] overflow-auto">
          {Object.entries(TABS).map(([key, value]) => (
            <button
              key={key}
              onClick={() => setActiveTab(value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === value
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {key === "DASHBOARD" && <BarChart size={16} />}
              {key === "USERS" && <Users size={16} />}
              {key === "ACTIVITIES" && <Activity size={16} />}
              {key === "WHITELIST" && <ShieldCheck size={16} />}
              {key === "BACKUP" && <Database size={16} />}
              {key === "SETTINGS" && <Settings size={16} />}
              {key === "SYSTEM" && <Server size={16} />}
              {key.charAt(0) + key.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
}
