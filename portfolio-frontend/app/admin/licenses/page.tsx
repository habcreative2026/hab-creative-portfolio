"use client";

import { useState, useEffect } from "react";
import { Copy, Download, RefreshCw, Trash2, Calendar, Clock } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface License {
  _id: string;
  key: string;
  status: "active" | "used" | "expired" | "revoked";
  usedBy: {
    deviceId?: string;
    userId?: {
      _id: string;
      email: string;
      name: string;
    };
    usedAt?: Date;
  };
  expiresAt: Date;
  licenseExpiresAt: Date;
  maxUses: number;
  usedCount: number;
  notes?: string;
  createdAt: Date;
  deviceInfo?: {
    name: string;
    os: string;
    version: string;
  };
}

interface LicenseStats {
  total: number;
  active: number;
  used: number;
  expired: number;
  revoked: number;
}

const DURATION_OPTIONS = [
  { label: "3 ngày", value: "3" },
  { label: "5 ngày", value: "5" },
  { label: "7 ngày", value: "7" },
  { label: "30 ngày", value: "30" },
  { label: "Vĩnh viễn", value: "forever" },
];

export default function LicenseManagement() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [stats, setStats] = useState<LicenseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [count, setCount] = useState(10);
  const [selectedDuration, setSelectedDuration] = useState("30");

  useEffect(() => {
    fetchLicenses();
    fetchStats();
  }, []);

  const fetchLicenses = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/license/list`, {
        withCredentials: true,
      });
      if (res.data.success) {
        setLicenses(res.data.data);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error("Please login first");
      } else {
        toast.error("Failed to fetch licenses");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/license/stats`, {
        withCredentials: true,
      });
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const generateLicenses = async () => {
    try {
      setGenerating(true);
      const res = await axios.post(
        `${API_URL}/api/license/generate`,
        { 
          count, 
          expiresIn: 30, 
          maxUses: 1,
          licenseDuration: selectedDuration,
          notes: `Duration: ${selectedDuration}`,
        },
        { withCredentials: true },
      );

      if (res.data.success) {
        toast.success(`Generated ${res.data.licenses.length} licenses`);
        fetchLicenses();
        fetchStats();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to generate licenses");
    } finally {
      setGenerating(false);
    }
  };

  const copyLicense = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("Copied to clipboard!");
  };

  const downloadLicenses = () => {
    const keys = licenses.map((l: License) => l.key).join("\n");
    const blob = new Blob([keys], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "licenses.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Licenses downloaded!");
  };

  const revokeLicense = async (id: string) => {
    if (!confirm("Revoke this license?")) return;
    try {
      await axios.delete(`${API_URL}/api/license/${id}`, {
        withCredentials: true,
      });
      toast.success("License revoked");
      fetchLicenses();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to revoke");
    }
  };

  const getStatusBadge = (status: License["status"]) => {
    const styles: Record<License["status"], string> = {
      active: "bg-green-500/20 text-green-400 border-green-500/30",
      used: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      expired: "bg-red-500/20 text-red-400 border-red-500/30",
      revoked: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    };

    const labels: Record<License["status"], string> = {
      active: "ACTIVE",
      used: "USED",
      expired: "EXPIRED",
      revoked: "REVOKED",
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysLeft = (expiresAt: Date) => {
    const now = new Date();
    const diff = new Date(expiresAt).getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return "Expired";
    if (days === 0) return "Today";
    return `${days} days left`;
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] p-6 scroll-none">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">License Management</h1>
            <p className="text-sm text-slate-400 mt-1">
              Quản lý license key và thời hạn sử dụng thiết bị
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(e.target.value)}
              className="bg-[#1a2332] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            >
              {DURATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="100"
                value={count}
                onChange={(e) =>
                  setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))
                }
                className="w-16 bg-[#1a2332] border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={generateLicenses}
                disabled={generating}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${generating ? "animate-spin" : ""}`} />
                Generate
              </button>
            </div>
            <button
              onClick={downloadLicenses}
              disabled={licenses.length === 0}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-[#1a2332] p-4 rounded-lg border border-slate-800">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Total</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
            </div>
            <div className="bg-[#1a2332] p-4 rounded-lg border border-green-800/30">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Active</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{stats.active}</p>
            </div>
            <div className="bg-[#1a2332] p-4 rounded-lg border border-blue-800/30">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Used</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{stats.used}</p>
            </div>
            <div className="bg-[#1a2332] p-4 rounded-lg border border-red-800/30">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Expired</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{stats.expired}</p>
            </div>
            <div className="bg-[#1a2332] p-4 rounded-lg border border-gray-800/30">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Revoked</p>
              <p className="text-2xl font-bold text-gray-400 mt-1">{stats.revoked}</p>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-[#131A2C] rounded-xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto max-h-[64vh]">
            <table className="w-full">
              <thead className="bg-black/30 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Key</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Used By</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Expires</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Device</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Uses</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      <RefreshCw className="w-4 h-4 animate-spin inline mr-2" />
                      Loading...
                    </td>
                  </tr>
                ) : licenses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      No licenses found.
                    </td>
                  </tr>
                ) : (
                  licenses.map((license: License) => (
                    <tr key={license._id} className="border-b border-slate-800 hover:bg-slate-800/30 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono text-blue-400 bg-blue-400/10 px-2 py-1 rounded">
                            {license.key}
                          </code>
                          <button onClick={() => copyLicense(license.key)} className="text-slate-500 hover:text-white">
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(license.status)}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">
                        {license.usedBy?.userId ? (
                          <div>
                            <div className="font-medium">{license.usedBy.userId.name}</div>
                            <div className="text-xs text-slate-500">{license.usedBy.userId.email}</div>
                          </div>
                        ) : license.usedBy?.deviceId ? (
                          <div className="text-xs font-mono text-slate-400">
                            {license.usedBy.deviceId.slice(0, 12)}...
                          </div>
                        ) : (
                          <span className="text-slate-500 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-sm text-slate-300">{formatDate(license.licenseExpiresAt)}</span>
                          <span className={`text-xs ${
                            new Date(license.licenseExpiresAt) < new Date() 
                              ? 'text-red-400' 
                              : 'text-green-400'
                          }`}>
                            {getDaysLeft(license.licenseExpiresAt)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {license.deviceInfo?.name || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">
                        {license.usedCount}/{license.maxUses}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => revokeLicense(license._id)}
                          disabled={license.status === "revoked" || license.status === "expired"}
                          className="text-red-400 hover:text-red-300 transition disabled:opacity-30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 text-xs text-slate-500 text-center">
          <p>License keys expire after 30 days. Device license duration can be configured per key.</p>
        </div>
      </div>
    </div>
  );
}
