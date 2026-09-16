"use client";

import { useEffect, useState } from "react";
import {
  Save,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Languages,
  Pencil,
} from "lucide-react";

import TextStyleModal, { type StyleData } from "./components/TextStyleModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface TranslationItem {
  _id?: string;
  key: string;
  vi: string;
  en: string;
  de: string;
  category: string;
  style?: StyleData;
}

export default function LanguageCMSPage() {
  const [translations, setTranslations] = useState<TranslationItem[]>([]);
  const [originalTranslations, setOriginalTranslations] = useState<
    TranslationItem[]
  >([]);
  const [filteredItems, setFilteredItems] = useState<TranslationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // 🆕 Edit modal state
  const [editingItem, setEditingItem] = useState<TranslationItem | null>(null);

  // ===================== FETCH =====================
  const fetchTranslations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/translations/admin-list`, {
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        setTranslations(json.data);
        setOriginalTranslations(json.data);
        setFilteredItems(json.data);
      } else {
        showAlert("error", json.message || "Không thể tải danh sách ngôn ngữ.");
      }
    } catch (err) {
      showAlert("error", "Lỗi kết nối đến máy chủ Backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTranslations();
  }, []);

  // ===================== FILTER =====================
  useEffect(() => {
    let result = [...originalTranslations];

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();

      result = result.filter(
        (item) =>
          item.key.toLowerCase().includes(q) ||
          item.vi.toLowerCase().includes(q) ||
          item.en.toLowerCase().includes(q) ||
          item.de.toLowerCase().includes(q),
      );
    }

    if (selectedCategory !== "all") {
      result = result.filter((item) => item.category === selectedCategory);
    }

    const merged = result.map((item) => {
      return translations.find((t) => t.key === item.key) || item;
    });

    setFilteredItems(merged);
  }, [searchQuery, selectedCategory, translations, originalTranslations]);

  // ===================== EDIT =====================
  const handleInputChange = (
    key: string,
    lang: "vi" | "en" | "de",
    value: string,
  ) => {
    setTranslations((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, [lang]: value } : item,
      ),
    );
  };

  // ===================== SAVE ALL =====================
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/translations/bulk-update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates: translations }),
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        showAlert(
          "success",
          "Đã lưu toàn bộ các chỉnh sửa ngôn ngữ thành công!",
        );
      } else {
        showAlert("error", json.message || "Cập nhật thất bại.");
      }
    } catch (err) {
      showAlert("error", "Lỗi hệ thống không thể lưu.");
    } finally {
      setSaving(false);
    }
  };

  // ===================== ALERT =====================
  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  // ===================== LOADING =====================
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // ===================== RENDER =====================
  return (
    <div className="p-6 w-full space-y-6 scroll-none">
      {/* ===================== HEADER ===================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Languages size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Quản lý Ngôn ngữ
            </h1>
            <p className="text-xs text-gray-500">
              Chỉnh sửa nội dung dịch và style động hiển thị trên hệ thống
              Portfolio.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTranslations}
            className="p-2 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
            title="Làm mới"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? "Đang lưu..." : "Lưu tất cả thay đổi"}
          </button>
        </div>
      </div>

      {/* ===================== ALERT ===================== */}
      {alert && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 border ${
            alert.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {alert.type === "success" ? (
            <CheckCircle2 size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          <span className="text-sm font-medium">{alert.message}</span>
        </div>
      )}

      {/* ===================== SEARCH ===================== */}
      <div className="gap-3 bg-white p-4 border border-gray-200 rounded-2xl shadow-sm">
        <div className="relative col-span-2">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã key hoặc nội dung bản dịch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* ===================== TABLE ===================== */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="max-h-[64vh] overflow-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="sticky top-0 z-10 bg-gray-50">
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold">
                <th className="px-4 py-3 w-[22%]">Từ khóa (Key ID)</th>
                <th className="px-4 py-3 w-[24%] border-l border-gray-200">
                  Tiếng Việt (VI)
                </th>
                <th className="px-4 py-3 w-[24%] border-l border-gray-200">
                  Tiếng Anh (EN)
                </th>
                <th className="px-4 py-3 w-[24%] border-l border-gray-200">
                  Tiếng Đức (DE)
                </th>
                <th className="px-4 py-3 w-[6%] border-l border-gray-200 text-center">
                  Style
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr
                    key={item.key}
                    className="hover:bg-gray-50/60 transition-colors group"
                  >
                    {/* KEY CELL */}
                    <td className="px-4 py-3 font-mono text-xs text-indigo-600 font-semibold align-top break-all select-all">
                      {item.key}
                      <span className="block text-[10px] text-gray-400 font-normal capitalize mt-1">
                        Tag:{" "}
                        <a target="_blank" href="https://zalo.me/84973112480">
                          Bùi Hải Trọng
                        </a>
                      </span>
                    </td>

                    {/* INPUT VI */}
                    <td className="p-2 border-l border-gray-200">
                      <textarea
                        rows={4}
                        value={item.vi}
                        onChange={(e) =>
                          handleInputChange(item.key, "vi", e.target.value)
                        }
                        className="w-full p-2 text-xs border border-transparent hover:border-gray-300 focus:border-indigo-500 rounded-lg focus:outline-none focus:bg-white resize-y transition-all"
                      />
                    </td>

                    {/* INPUT EN */}
                    <td className="p-2 border-l border-gray-200">
                      <textarea
                        rows={4}
                        value={item.en}
                        onChange={(e) =>
                          handleInputChange(item.key, "en", e.target.value)
                        }
                        className="w-full p-2 text-xs border border-transparent hover:border-gray-300 focus:border-indigo-500 rounded-lg focus:outline-none focus:bg-white resize-y transition-all"
                      />
                    </td>

                    {/* INPUT DE */}
                    <td className="p-2 border-l border-gray-200">
                      <textarea
                        rows={4}
                        value={item.de}
                        onChange={(e) =>
                          handleInputChange(item.key, "de", e.target.value)
                        }
                        className="w-full p-2 text-xs border border-transparent hover:border-gray-300 focus:border-indigo-500 rounded-lg focus:outline-none focus:bg-white resize-y transition-all"
                      />
                    </td>

                    {/* 🆕 STYLE BUTTON */}
                    <td className="p-2 border-l border-gray-200 text-center align-middle">
                      <button
                        onClick={() => setEditingItem(item)}
                        className={`p-2 rounded-lg transition-colors ${
                          item.style?.fontFamily ||
                          item.style?.fontWeight ||
                          item.style?.fontSize ||
                          item.style?.letterSpacing ||
                          item.style?.color
                            ? "text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                            : "text-gray-400 hover:bg-indigo-50 hover:text-indigo-600"
                        }`}
                        title="Chỉnh sửa style"
                      >
                        <Pencil size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-400">
                    Không tìm thấy từ khóa ngôn ngữ nào khớp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================== 🆕 TEXT STYLE MODAL ===================== */}
      {editingItem && (
        <TextStyleModal
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          translationKey={editingItem.key}
          translationData={{
            vi: editingItem.vi,
            en: editingItem.en,
            de: editingItem.de,
            style: editingItem.style,
          }}
          onSaveSuccess={fetchTranslations}
        />
      )}
    </div>
  );
}
