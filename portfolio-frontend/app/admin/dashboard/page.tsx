// frontend/app/admin/dashboard/page.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  RefreshCw,
  ExternalLink,
  Languages,
  Images,
  Link2,
  AudioWaveform,
  Film,
  User,
  Mail,
  Shield,
  LayoutGrid,
  Newspaper,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import TwoFactorAuthModal from "../TwoFactorAuthModal";
import LanguageDashboard from "../languages/page";
import LinkAdminDashboard from "../links/page";
import AudioAdminDashboard from "../audio/page";
import VideoAdminDashboard from "../video/page";
import MarqueeAdminPage from "../Marquee/page";
import CardProjectAdmin from "../CardProject/page";
import AdminProjectsPage from "../projects/page";
import AboutAdminPage from "../about/page";
import ContactAdminPage from "../contact/page";
import SuperAdminPage from "../superAdmin/page";
import toast from "react-hot-toast";
import LicenseManagement from "../licenses/page";

// ⭐ Import type cho electron
import "../../../types/electron";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const PREVIEW_URL = process.env.NEXT_PUBLIC_FE_API;

interface User {
  email: string;
  role: string;
  id: string;
  name: string;
  avatar: string;
  has2FA: boolean;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
  children?: MenuItem[];
}

type TabType =
  | "dashboard"
  | "language"
  | "link"
  | "audio"
  | "video"
  | "marquee"
  | "project"
  | "cardprojects"
  | "detailprojects"
  | "about"
  | "contact"
  | "superadmin"
  | "license";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeIntroEnabled, setIframeIntroEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("iframeIntroEnabled");
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });

  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.electronAPI) {
      setIsDesktop(true);
      console.log("✅ Running in Electron desktop app");
    }
  }, []);

  const isOwner = user?.email === "buihaitrong.dev@gmail.com";

  const refreshAuthToken = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/refresh-token`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        return data.success;
      }
      return false;
    } catch (error) {
      console.error("Refresh token error:", error);
      return false;
    }
  };

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1);
  };

  const handle2FASuccess = () => {
    if (user) {
      setUser({ ...user, has2FA: true });
    }
  };

  const handleToggleIframeIntro = () => {
    const newStatus = !iframeIntroEnabled;
    setIframeIntroEnabled(newStatus);
    localStorage.setItem("iframeIntroEnabled", JSON.stringify(newStatus));
    toast.success(`Intro video ${newStatus ? "đã bật" : "đã tắt"}`);
    setIframeKey((prev) => prev + 1);
  };

  const getIframeUrl = () => {
    const baseUrl = PREVIEW_URL;
    const params = new URLSearchParams();

    if (!iframeIntroEnabled) {
      params.set("intro", "off");
    }

    return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
  };

  const toggleMenu = (menuId: string) => {
    setExpandedMenus((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(menuId)) {
        newSet.delete(menuId);
      } else {
        newSet.add(menuId);
      }
      return newSet;
    });
  };

  const isItemActive = (item: MenuItem): boolean => {
    if (item.id === activeTab) return true;
    if (item.children) {
      return item.children.some((child) => child.id === activeTab);
    }
    return false;
  };

  useEffect(() => {
    let isMounted = true;
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/me`, {
          credentials: "include",
        });

        if (res.status === 401) {
          console.log("Token expired, attempting refresh...");
          const refreshed = await refreshAuthToken();
          if (refreshed) {
            const retryRes = await fetch(`${API_URL}/api/admin/me`, {
              credentials: "include",
            });
            if (retryRes.ok) {
              const data = await retryRes.json();
              if (isMounted) {
                setUser(data.user);
                setLoading(false);
              }
              return;
            }
          }
          if (isMounted) {
            router.push("/admin/login?status=session_expired");
          }
          return;
        }

        if (!res.ok) {
          if (isMounted) router.push("/admin/login");
          return;
        }

        const data = await res.json();
        if (isMounted) setUser(data.user);
      } catch (error) {
        console.error("Fetch user error:", error);
        if (isMounted) router.push("/admin/login");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUser();

    const refreshInterval = setInterval(
      async () => {
        if (isMounted) {
          await refreshAuthToken();
        }
      },
      5 * 60 * 1000,
    );

    return () => {
      isMounted = false;
      clearInterval(refreshInterval);
    };
  }, [router]);

  // ⭐ LOGOUT
  const handleLogout = async () => {
    try {
      if (isDesktop && window.electronAPI) {
        console.log("🔓 Logout via Electron API");
        await window.electronAPI.logout();
        setUser(null);
        return;
      }

      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setUser(null);
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
      }
      if (!isDesktop) {
        router.push("/admin/login");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const menuItems: MenuItem[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    {
      id: "content",
      label: "Content Management",
      icon: LayoutGrid,
      children: [
        { id: "language", label: "Language", icon: Languages },
        { id: "link", label: "Links", icon: Link2 },
        { id: "audio", label: "Music", icon: AudioWaveform },
        { id: "video", label: "Video", icon: Film },
        { id: "marquee", label: "Marquee", icon: Images },
      ],
    },
    {
      id: "pages",
      label: "Pages",
      icon: Newspaper,
      children: [
        { id: "cardprojects", label: "Card Project", icon: LayoutGrid },
        { id: "detailprojects", label: "Detail Projects", icon: Newspaper },
        { id: "about", label: "About", icon: User },
        { id: "contact", label: "Contact", icon: Mail },
      ],
    },
    {
      id: "superadmin",
      label: "Super Admin",
      icon: Shield,
    },
    ...(isOwner
      ? [
          {
            id: "license",
            label: "License",
            icon: Shield,
          },
        ]
      : []),
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "language":
        return <LanguageDashboard />;
      case "link":
        return <LinkAdminDashboard />;
      case "audio":
        return <AudioAdminDashboard />;
      case "video":
        return <VideoAdminDashboard />;
      case "marquee":
        return <MarqueeAdminPage />;
      case "cardprojects":
        return <CardProjectAdmin />;
      case "detailprojects":
        return <AdminProjectsPage />;
      case "about":
        return <AboutAdminPage />;
      case "contact":
        return <ContactAdminPage />;
      case "superadmin":
        return <SuperAdminPage />;
      case "license":
        return <LicenseManagement />;

      case "dashboard":
      default:
        return (
          <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-0">
            <div className="flex items-center justify-between bg-gray-50 px-4 py-2.5 border-b border-gray-200 shrink-0 select-none">
              <div className="hidden sm:flex items-center gap-1.5 w-24">
                <span className="w-3 h-3 rounded-full bg-red-400"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                <span className="w-3 h-3 rounded-full bg-green-400"></span>
              </div>

              <div className="flex-1 max-w-xl mx-auto bg-white border border-gray-200 rounded-lg px-3 py-1 text-xs text-gray-500 font-mono text-center truncate shadow-sm">
                {PREVIEW_URL}
              </div>

              <div className="flex items-center gap-1 sm:w-24 justify-end">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleToggleIframeIntro}
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
                      ${iframeIntroEnabled ? "bg-indigo-600" : "bg-gray-300"}
                      hover:opacity-80
                    `}
                    title={`${iframeIntroEnabled ? "Tắt" : "Bật"} intro video trong preview`}
                  >
                    <span
                      className={`
                        inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200
                        ${iframeIntroEnabled ? "translate-x-6" : "translate-x-1"}
                      `}
                    />
                  </button>
                </div>
                <button
                  onClick={handleRefresh}
                  title="Làm mới trang"
                  className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
                >
                  <RefreshCw
                    size={16}
                    className="active:rotate-180 transition-transform duration-300"
                  />
                </button>

                <a
                  href={PREVIEW_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Mở trong tab mới"
                  className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors flex items-center"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>

            <div className="flex-1 w-full h-full relative bg-white">
              <iframe
                key={iframeKey}
                ref={iframeRef}
                src={getIframeUrl()}
                title="Localhost Project Preview"
                className="absolute inset-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row text-gray-800 antialiased">
      <header className="flex md:hidden items-center justify-between bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Menu size={24} />
          </button>
          <span className="font-semibold text-sm text-gray-900">
            HAB CREATIVE
          </span>
        </div>
      </header>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 shadow-sm flex flex-col z-50 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:w-1/4 lg:w-1/5 xl:w-64 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="bg-white p-3 border border-gray-200 flex items-center gap-2">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt="avatar"
              className="w-8 h-8 rounded-full border border-gray-100 shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 uppercase">
              {user?.email?.charAt(0)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-900 truncate">
              {user?.name}
            </p>
            <p className="text-[10px] text-gray-400 truncate font-mono">
              {user?.email}
            </p>
          </div>
        </div>

        <nav className="flex-1 max-h-[76vh] overflow-y-auto py-3 px-3 space-y-1 scroll-none">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedMenus.has(item.id);
            const isActive = isItemActive(item);

            return (
              <div key={item.id}>
                <button
                  onClick={() => {
                    if (hasChildren) {
                      toggleMenu(item.id);
                    } else {
                      setActiveTab(item.id as TabType);
                      setIsSidebarOpen(false);
                    }
                  }}
                  className={`
                    flex items-center w-full rounded-xl transition-all duration-200
                    gap-3 px-4 py-2.5 text-sm font-medium
                    ${
                      isActive && !hasChildren
                        ? "bg-indigo-50 text-indigo-600 shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }
                    ${hasChildren && isExpanded ? "bg-gray-50" : ""}
                  `}
                >
                  <Icon
                    size={18}
                    className={isActive ? "text-indigo-600" : "text-gray-400"}
                  />
                  <span className="flex-1 text-left text-ellipsis line-clamp-1">
                    {item.label}
                  </span>

                  {item.badge && (
                    <span
                      className={`
                        px-2 py-0.5 text-xs rounded-full
                        ${item.badgeColor || "bg-indigo-100 text-indigo-600"}
                      `}
                    >
                      {item.badge}
                    </span>
                  )}

                  {hasChildren && (
                    <span className="text-gray-400 transition-transform duration-200">
                      {isExpanded ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </span>
                  )}

                  {isActive && !hasChildren && (
                    <div className="w-1.5 h-8 bg-indigo-600 rounded-full" />
                  )}
                </button>

                {hasChildren && isExpanded && (
                  <div className="mt-1 ml-6 space-y-1 border-l-2 border-gray-200 pl-2">
                    {item.children!.map((child) => {
                      const ChildIcon = child.icon;
                      const isChildActive = activeTab === child.id;

                      return (
                        <button
                          key={child.id}
                          onClick={() => {
                            setActiveTab(child.id as TabType);
                            setIsSidebarOpen(false);
                          }}
                          className={`
                            flex items-center w-full rounded-xl transition-all duration-200
                            gap-3 px-4 py-2 text-sm font-medium
                            ${
                              isChildActive
                                ? "bg-indigo-50 text-indigo-600 shadow-sm"
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                            }
                          `}
                        >
                          <ChildIcon
                            size={16}
                            className={
                              isChildActive
                                ? "text-indigo-600"
                                : "text-gray-400"
                            }
                          />
                          <span className="flex-1 text-left">
                            {child.label}
                          </span>
                          {isChildActive && (
                            <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 bg-gray-50/60 space-y-3 shrink-0">
          <TwoFactorAuthModal
            has2FA={!!user?.has2FA}
            onActivationSuccess={handle2FASuccess}
          />

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full border border-gray-200 bg-white text-gray-600 py-2 rounded-xl text-xs font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all duration-150 shadow-sm"
          >
            <LogOut size={14} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden w-full p-2 bg-gray-100">
        {renderContent()}
      </main>
    </div>
  );
}
