"use client";

import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  X,
  Save,
  RotateCcw,
  Eye,
  Palette,
  Type,
  Check,
  Search,
  ChevronDown,
  Sparkle,
} from "lucide-react";
import { broadcastTextStyleUpdate } from "@/app/context/TextStyleContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const GOOGLE_FONTS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_FONTS_API_KEY || "";

// ===================== FALLBACK FONTS =====================
const FALLBACK_FONTS = [
  "Inter",
  "Roboto",
  "Playfair Display",
  "Montserrat",
  "Oswald",
  "Lora",
  "Poppins",
  "Open Sans",
  "Raleway",
  "Nunito",
  "Work Sans",
  "DM Sans",
  "Outfit",
  "Space Grotesk",
  "Bebas Neue",
  "Pacifico",
  "Dancing Script",
  "Josefin Sans",
  "Merriweather",
  "Lato",
  "Rubik",
  "Sora",
];

const FONT_WEIGHTS = [
  { value: 0, label: "Mặc định" },
  { value: 100, label: "100 - Thin" },
  { value: 200, label: "200 - Extra Light" },
  { value: 300, label: "300 - Light" },
  { value: 400, label: "400 - Regular" },
  { value: 500, label: "500 - Medium" },
  { value: 600, label: "600 - Semi Bold" },
  { value: 700, label: "700 - Bold" },
  { value: 800, label: "800 - Extra Bold" },
  { value: 900, label: "900 - Black" },
];

// ===================== STYLE STATE =====================
export interface StyleData {
  fontFamily?: string;
  fontWeight?: number;
  fontSize?: number;
  letterSpacing?: number;
  color?: string;
}

type InternalStyle = Required<StyleData>;

const DEFAULT_STYLE: InternalStyle = {
  fontFamily: "",
  fontWeight: 0,
  fontSize: 0,
  letterSpacing: 0,
  color: "",
};

interface TextStyleModalProps {
  isOpen: boolean;
  onClose: () => void;
  translationKey: string;
  translationData: {
    vi: string;
    en: string;
    de: string;
    style?: StyleData;
  };
  onSaveSuccess: () => void;
}

export default function TextStyleModal({
  isOpen,
  onClose,
  translationKey,
  translationData,
  onSaveSuccess,
}: TextStyleModalProps) {
  const [style, setStyle] = useState<InternalStyle>(DEFAULT_STYLE);
  const [originalStyle, setOriginalStyle] =
    useState<InternalStyle>(DEFAULT_STYLE);
  const [saving, setSaving] = useState(false);
  const [previewLang, setPreviewLang] = useState<"vi" | "en" | "de">("vi");

  // Load style khi mở modal
  useEffect(() => {
    if (isOpen && translationData.style) {
      const loaded: InternalStyle = {
        fontFamily: translationData.style.fontFamily ?? "",
        fontWeight: translationData.style.fontWeight ?? 0,
        fontSize: translationData.style.fontSize ?? 0,
        letterSpacing: translationData.style.letterSpacing ?? 0,
        color: translationData.style.color ?? "",
      };
      setStyle(loaded);
      setOriginalStyle(loaded);
    } else {
      setStyle(DEFAULT_STYLE);
      setOriginalStyle(DEFAULT_STYLE);
    }
  }, [isOpen, translationData]);

  const hasChanges = JSON.stringify(style) !== JSON.stringify(originalStyle);

  const updateField = <K extends keyof InternalStyle>(
    field: K,
    value: InternalStyle[K],
  ) => {
    setStyle((prev) => ({ ...prev, [field]: value }));
  };

  // ===================== SAVE =====================
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(
        `${API_URL}/api/translations/style/${encodeURIComponent(translationKey)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(style),
        },
      );

      const data = await res.json();

      if (data.success) {
        toast.success(`Đã lưu style cho "${translationKey}"`);
        onSaveSuccess();
        broadcastTextStyleUpdate();
        onClose();
      } else {
        toast.error(data.message || "Lỗi khi lưu");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Lỗi kết nối server");
    } finally {
      setSaving(false);
    }
  };

  // ===================== RESET =====================
  const handleReset = async () => {
    if (!confirm("Reset style về mặc định?")) return;

    try {
      const res = await fetch(
        `${API_URL}/api/translations/style/reset/${encodeURIComponent(translationKey)}`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      const data = await res.json();

      if (data.success) {
        setStyle(DEFAULT_STYLE);
        setOriginalStyle(DEFAULT_STYLE);
        toast.success("Đã reset");
        onSaveSuccess();
        broadcastTextStyleUpdate();
        onClose();
      } else {
        toast.error(data.message || "Lỗi reset");
      }
    } catch (error) {
      toast.error("Lỗi kết nối server");
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col z-10">
        {/* ===================== HEADER (STICKY) ===================== */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Palette size={18} className="text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                Chỉnh sửa Style
                {hasChanges && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-normal text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Chưa lưu
                  </span>
                )}
              </h3>
              <p className="text-[10px] font-mono text-gray-500">
                Key:{" "}
                <span className="text-indigo-600 font-semibold">
                  {translationKey}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/80 rounded-lg transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* ===================== BODY (SCROLLABLE) ===================== */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {/* ===================== LEFT: FORM ===================== */}
            <div className="space-y-6">
              {/* SECTION: LANGUAGE */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <Type size={14} className="text-gray-600" />
                  <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Ngôn ngữ preview
                  </span>
                </div>
                <div className="flex gap-2">
                  {(["vi", "en", "de"] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setPreviewLang(lang)}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                        previewLang === lang
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION: FONT */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Type size={14} className="text-gray-600" />
                  <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Typography
                  </span>
                </div>

                <FontPicker
                  value={style.fontFamily}
                  onChange={(font) => updateField("fontFamily", font)}
                />

                {/* Font Weight */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-medium text-gray-600">
                      Font Weight
                    </label>
                    <span className="text-[10px] font-mono text-gray-400">
                      {style.fontWeight === 0 ? "mặc định" : style.fontWeight}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {FONT_WEIGHTS.map((w) => (
                      <button
                        key={w.value}
                        onClick={() => updateField("fontWeight", w.value)}
                        className={`py-1.5 rounded-md text-[10px] font-medium transition ${
                          style.fontWeight === w.value
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                        title={w.label}
                      >
                        {w.value === 0 ? "Auto" : w.value}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-medium text-gray-600">
                      Font Size
                    </label>
                    <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {style.fontSize === 0
                        ? "mặc định"
                        : `${style.fontSize}px`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="240"
                      step="1"
                      value={style.fontSize}
                      onChange={(e) =>
                        updateField("fontSize", Number(e.target.value))
                      }
                      className="flex-1 accent-indigo-600"
                    />
                    <input
                      type="number"
                      min="0"
                      max="240"
                      value={style.fontSize}
                      onChange={(e) =>
                        updateField("fontSize", Number(e.target.value))
                      }
                      className="w-16 px-2 py-1.5 border border-gray-200 rounded-md text-xs text-center focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Letter Spacing */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-medium text-gray-600">
                      Letter Spacing
                    </label>
                    <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {style.letterSpacing === 0
                        ? "mặc định"
                        : `${style.letterSpacing.toFixed(2)}em`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-0.1"
                    max="0.5"
                    step="0.01"
                    value={style.letterSpacing}
                    onChange={(e) =>
                      updateField("letterSpacing", Number(e.target.value))
                    }
                    className="w-full accent-indigo-600"
                  />
                  <div className="flex justify-between text-[9px] text-gray-400 mt-1">
                    <span>-0.1em</span>
                    <span>0em</span>
                    <span>0.5em</span>
                  </div>
                </div>
              </div>

              {/* SECTION: COLOR */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Palette size={14} className="text-gray-600" />
                  <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Màu chữ
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="color"
                    value={style.color || "#000000"}
                    onChange={(e) => updateField("color", e.target.value)}
                    className="w-14 h-10 rounded-lg border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={style.color}
                    onChange={(e) => updateField("color", e.target.value)}
                    placeholder="Mặc định (để trống)"
                    className="flex-1 bg-white border border-gray-300 px-3 rounded-lg text-sm font-mono focus:border-indigo-500 focus:outline-none"
                  />
                  {style.color && (
                    <button
                      onClick={() => updateField("color", "")}
                      className="px-3 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 text-xs transition"
                      title="Xóa màu"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Preset colors */}
                <div className="flex gap-1.5 flex-wrap">
                  {[
                    "#000000",
                    "#FFFFFF",
                    "#FF0000",
                    "#00FF00",
                    "#0000FF",
                    "#FFD700",
                    "#8B5CF6",
                    "#06B6D4",
                    "#F59E0B",
                    "#EF4444",
                  ].map((c) => (
                    <button
                      key={c}
                      onClick={() => updateField("color", c)}
                      className={`w-7 h-7 rounded-md border-2 transition ${
                        style.color === c
                          ? "border-indigo-500 scale-110"
                          : "border-gray-200 hover:scale-105"
                      }`}
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* ===================== RIGHT: PREVIEW ===================== */}
            <div className="space-y-4 lg:sticky lg:top-0 self-start">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Eye size={14} className="text-indigo-600" />
                  Xem trước
                </h4>
              </div>

              {/* Preview Canvas */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-h-[120px] flex items-center justify-center">
                  <div
                    className="text-center break-words w-full"
                    style={{
                      fontFamily: style.fontFamily
                        ? `"${style.fontFamily}", sans-serif`
                        : "inherit",
                      fontWeight: style.fontWeight || "inherit",
                      fontSize: style.fontSize
                        ? `${style.fontSize}px`
                        : "inherit",
                      letterSpacing: style.letterSpacing
                        ? `${style.letterSpacing}em`
                        : "inherit",
                      color: style.color || "inherit",
                    }}
                  >
                    {translationData[previewLang] || "(Chưa có nội dung)"}
                  </div>
                </div>

                {/* Text sample paragraph */}
                <div className="mt-3 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <p
                    className="text-xs leading-relaxed"
                    style={{
                      fontFamily: style.fontFamily
                        ? `"${style.fontFamily}", sans-serif`
                        : "inherit",
                      fontWeight: style.fontWeight || "inherit",
                      fontSize: style.fontSize ? `${style.fontSize}px` : "12px",
                      letterSpacing: style.letterSpacing
                        ? `${style.letterSpacing}em`
                        : "inherit",
                      color: style.color || "inherit",
                    }}
                  >
                    Ăâđêôơư ABC abc 123 — Đây là đoạn văn mẫu để kiểm tra hiển
                    thị font chữ.
                  </p>
                </div>
              </div>

              {/* Info Panel */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                <h5 className="text-[10px] font-semibold text-indigo-900 mb-3 uppercase tracking-wide">
                  Thông số hiện tại
                </h5>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <InfoRow label="Font" value={style.fontFamily || "inherit"} />
                  <InfoRow
                    label="Weight"
                    value={String(style.fontWeight || "inherit")}
                  />
                  <InfoRow
                    label="Size"
                    value={style.fontSize ? `${style.fontSize}px` : "inherit"}
                  />
                  <InfoRow
                    label="Spacing"
                    value={
                      style.letterSpacing
                        ? `${style.letterSpacing.toFixed(2)}em`
                        : "inherit"
                    }
                  />
                  <div className="col-span-2">
                    <span className="text-indigo-700">Color:</span>
                    <span className="ml-2 font-mono text-indigo-900 inline-flex items-center gap-2">
                      {style.color || "inherit"}
                      {style.color && (
                        <span
                          className="inline-block w-4 h-4 rounded border border-indigo-200"
                          style={{ backgroundColor: style.color }}
                        />
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===================== FOOTER (STICKY) ===================== */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-white transition"
          >
            <RotateCcw size={14} />
            Reset
          </button>
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-white transition"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition ${
              hasChanges && !saving
                ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Save size={14} />
            {saving ? "Đang lưu..." : "Lưu style"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ===================== INFO ROW =====================
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] text-indigo-700">{label}</span>
      <span className="font-mono text-indigo-900 truncate" title={value}>
        {value}
      </span>
    </div>
  );
}

// ===================== FONT PICKER =====================
function FontPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (font: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [fonts, setFonts] = useState<string[]>(FALLBACK_FONTS);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!GOOGLE_FONTS_API_KEY) {
      setFonts(FALLBACK_FONTS);
      return;
    }

    const fetchFonts = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://www.googleapis.com/webfonts/v1/webfonts?key=${GOOGLE_FONTS_API_KEY}&sort=popularity`,
        );
        const data = await res.json();
        if (data.items) {
          setFonts(data.items.map((item: any) => item.family));
        } else {
          setFonts(FALLBACK_FONTS);
        }
      } catch (error) {
        setFonts(FALLBACK_FONTS);
      } finally {
        setLoading(false);
      }
    };

    fetchFonts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadFontPreview = (fontName: string) => {
    const id = `preview-font-${fontName.replace(/\s/g, "-")}`;
    if (document.getElementById(id)) return;

    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s/g, "+")}&display=swap`;
    document.head.appendChild(link);
  };

  const filteredFonts = fonts.filter((f) =>
    f.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div ref={dropdownRef}>
      <div className="flex items-center justify-between mb-2">
        <label className="text-[11px] font-medium text-gray-600">
          Font Family
        </label>
        <span className="text-[10px] text-gray-400">
          {loading ? "Đang tải..." : `${fonts.length} fonts`}
        </span>
      </div>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-white border border-gray-300 p-2.5 rounded-lg text-sm text-left flex justify-between items-center hover:border-gray-400 focus:border-indigo-500 focus:outline-none transition"
        >
          <span
            className="truncate"
            style={{
              fontFamily: value ? `"${value}", sans-serif` : "inherit",
            }}
          >
            {value || "Mặc định (kế thừa từ layout)"}
          </span>
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-2xl z-50 overflow-hidden">
            {/* Search */}
            <div className="p-2 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Tìm font..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 pl-8 pr-2 py-2 rounded-md text-sm focus:border-indigo-500 focus:outline-none"
                  autoFocus
                />
              </div>
            </div>

            {/* Clear */}
            {value && (
              <button
                onClick={() => {
                  onChange("");
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-xs text-red-500 hover:bg-red-50 border-b border-gray-100 flex items-center gap-2"
              >
                <X size={12} />
                Xóa font (dùng mặc định)
              </button>
            )}

            {/* List */}
            <div className="overflow-y-auto max-h-64">
              {loading ? (
                <div className="text-center text-gray-400 text-xs p-4">
                  Đang tải fonts...
                </div>
              ) : filteredFonts.length === 0 ? (
                <div className="text-center text-gray-400 text-xs p-4">
                  Không tìm thấy font
                </div>
              ) : (
                filteredFonts.slice(0, 200).map((font) => {
                  loadFontPreview(font);
                  const isSelected = value === font;
                  return (
                    <button
                      key={font}
                      onClick={() => {
                        onChange(font);
                        setIsOpen(false);
                        setSearchTerm("");
                      }}
                      className={`w-full px-3 py-2 text-left text-sm transition flex items-center justify-between gap-2 ${
                        isSelected
                          ? "bg-indigo-50 text-indigo-600 font-medium"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <span
                        className="truncate"
                        style={{ fontFamily: `"${font}", sans-serif` }}
                      >
                        {font}
                      </span>
                      {isSelected && (
                        <Check size={14} className="text-indigo-600 shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
