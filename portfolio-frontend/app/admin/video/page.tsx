"use client";

import React, { useState, useEffect } from "react";
import {
  Video,
  Upload,
  RefreshCw,
  CheckCircle,
  Film,
  Trash2,
  AlertTriangle,
} from "lucide-react";

type VideoItem = {
  _id: string;
  url: string;
  title: string;
  createdAt: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function VideoAdminDashboard() {
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
  const [library, setLibrary] = useState<VideoItem[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [deleteTarget, setDeleteTarget] = useState<VideoItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [resConfig, resLib] = await Promise.all([
        fetch(`${API_URL}/api/video/public`),
        fetch(`${API_URL}/api/video/library`, { credentials: "include" }),
      ]);

      if (resConfig.ok) {
        const json = await resConfig.json();
        if (json.success) {
          setCurrentVideoUrl(json.data?.url || null);
        }
      }
      if (resLib.ok) {
        const json = await resLib.json();
        if (json.success) setLibrary(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const showMsg = (text: string, type: "success" | "error") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), 4000);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setProcessing(true);
    const formData = new FormData();
    formData.append("video", file);

    try {
      const res = await fetch(`${API_URL}/api/video/upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        showMsg(json.message || "Xử lý thành công!", "success");
        setCurrentVideoUrl(json.data.url || null);
        setFile(null);
        loadDashboardData();
      } else {
        showMsg(json.message || "Upload thất bại", "error");
      }
    } catch (err) {
      showMsg("Lỗi kết nối máy chủ", "error");
    } finally {
      setProcessing(false);
    }
  };

  const handleSelectOldVideo = async (id: string) => {
    setProcessing(true);
    try {
      const res = await fetch(`${API_URL}/api/video/select`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ resourceId: id }),
      });
      const json = await res.json();
      if (json.success) {
        showMsg("Đã kích hoạt lại video từ lịch sử thư viện!", "success");
        setCurrentVideoUrl(json.data.url || null);
      } else {
        showMsg(json.message || "Lỗi kích hoạt video", "error");
      }
    } catch (err) {
      showMsg("Lỗi hệ thống", "error");
    } finally {
      setProcessing(false);
    }
  };

  // ============ XÓA VIDEO ============
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/api/video/${deleteTarget._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();

      if (json.success) {
        showMsg(
          json.wasActive
            ? "Đã xóa video và chuyển intro về mặc định."
            : "Đã xóa video khỏi thư viện.",
          "success",
        );
        setDeleteTarget(null);
        await loadDashboardData();
      } else {
        showMsg(json.message || "Không xóa được video", "error");
      }
    } catch (err) {
      showMsg("Lỗi kết nối máy chủ", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="w-full bg-gray-50 p-2 text-gray-800">
      <div className="max-w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CỘT TRÁI */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h1 className="text-lg font-bold flex items-center gap-2 text-gray-900 mb-4">
              <Video className="text-indigo-600 w-5 h-5" /> Video Intro Hiện Tại
            </h1>
            <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-800">
              {currentVideoUrl ? (
                <video
                  key={currentVideoUrl}
                  src={currentVideoUrl}
                  controls
                  className="w-full h-auto aspect-video object-cover"
                />
              ) : (
                <div className="w-full aspect-video flex items-center justify-center bg-slate-900 text-gray-400">
                  Chưa có video
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-gray-500" /> Tải Lên Video Mới
            </h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <input
                type="file"
                accept="video/*"
                onChange={(e) => e.target.files && setFile(e.target.files[0])}
                className="w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
              />
              <button
                type="submit"
                disabled={!file || processing || loading}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg text-xs font-medium hover:bg-indigo-700 disabled:opacity-40 transition-all flex items-center justify-center gap-1"
              >
                {processing ? "Đang xử lý..." : "Lưu Vào Thư Viện Video"}
              </button>
            </form>
          </div>
        </div>

        {/* CỘT PHẢI */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <div>
              <h2 className="font-bold text-gray-900">
                Thư Viện Lịch Sử Video Intro
              </h2>
              <p className="text-xs text-gray-400">
                Chọn dùng lại các đoạn phim cũ, hoặc xóa video không cần thiết.
              </p>
            </div>
            <button
              onClick={loadDashboardData}
              className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {msg.text && (
            <div
              className={`p-2.5 text-xs font-medium rounded-md mb-3 ${
                msg.type === "success"
                  ? "bg-emerald-50 text-emerald-800"
                  : "bg-rose-50 text-rose-800"
              }`}
            >
              {msg.text}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12 text-xs text-gray-400 animate-pulse">
              Đang nạp thư viện phim...
            </div>
          ) : library.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-400">
              Thư viện trống. Hãy nạp video intro đầu tiên!
            </div>
          ) : (
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
              {library.map((item) => {
                const isActive = currentVideoUrl === item.url;
                return (
                  <div
                    key={item._id}
                    className={`flex items-center justify-between p-3 rounded-lg border text-xs transition-all ${
                      isActive
                        ? "border-indigo-200 bg-indigo-50/40"
                        : "border-gray-100 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
                      <Film className="w-4 h-4 text-gray-400 shrink-0" />
                      <div className="min-w-0">
                        <p
                          className="font-medium text-gray-800 truncate"
                          title={item.title}
                        >
                          {item.title}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Tải lên:{" "}
                          {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isActive ? (
                        <span className="flex items-center gap-1 text-indigo-600 font-semibold px-2 py-1 bg-indigo-100/60 rounded">
                          <CheckCircle className="w-3.5 h-3.5" /> Hoạt động
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={processing}
                          onClick={() => handleSelectOldVideo(item._id)}
                          className="px-3 py-1 bg-white border border-gray-200 text-gray-600 rounded hover:border-indigo-500 hover:text-indigo-600 font-medium transition-colors disabled:opacity-50"
                        >
                          Dùng lại
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setDeleteTarget(item)}
                        title="Xóa video này"
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ============ MODAL XÁC NHẬN XÓA ============ */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => !deleting && setDeleteTarget(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-base font-bold text-gray-900 text-center mb-1">
              Xóa video intro?
            </h3>
            <p className="text-xs text-gray-500 text-center mb-2">
              File sẽ bị xóa vĩnh viễn khỏi Cloudinary và thư viện.
            </p>
            <p className="text-xs text-gray-700 text-center font-medium px-3 py-2 bg-gray-50 rounded-lg mb-4 truncate">
              {deleteTarget.title}
            </p>

            {currentVideoUrl === deleteTarget.url && (
              <div className="mb-4 p-2.5 bg-amber-50 border border-amber-100 rounded-lg text-[11px] text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>
                  Đây là video <strong>đang hoạt động</strong>. Sau khi xóa,
                  intro sẽ quay về mặc định (<code>/video.mp4</code>).
                </span>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-xs disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-xs disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {deleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    Xóa video
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
