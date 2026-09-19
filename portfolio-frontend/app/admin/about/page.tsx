"use client";
import React, { useEffect, useState } from "react";
import { useLanguage } from "@/app/i18n/LanguageContext";
import FontPickerComponent from "@/app/admin/components/FontPicker";
import toast from "react-hot-toast";

const WEIGHT_OPTIONS = [
  { label: "Light (300)", value: "300" },
  { label: "Regular (400)", value: "400" },
  { label: "Medium (500)", value: "500" },
  { label: "Bold (700)", value: "700" },
  { label: "Black (900)", value: "900" },
];

// ============ MODAL WRAPPER ============
const Modal = ({
  isOpen,
  onClose,
  title,
  color = "blue",
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  color?: "blue" | "amber" | "green" | "pink";
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;

  const colorMap: Record<string, string> = {
    blue: "text-blue-400 border-blue-500/30",
    amber: "text-amber-400 border-amber-500/30",
    green: "text-green-400 border-green-500/30",
    pink: "text-pink-400 border-pink-500/30",
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#0F1626] border border-slate-800 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2
            className={`font-semibold text-sm uppercase tracking-wider ${colorMap[color].split(" ")[0]}`}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl leading-none w-8 h-8 flex items-center justify-center rounded hover:bg-slate-800 transition"
          >
            ×
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-auto p-5 space-y-4 flex-1">{children}</div>
      </div>
    </div>
  );
};

// ============ STYLE CARD ============
const StyleCard = ({ title, value, onChange }: any) => (
  <div className="border-b border-slate-800 pb-3 mb-3 last:border-b-0 last:mb-0">
    <p className="text-[10px] text-slate-500 mb-2 uppercase tracking-wide">
      {title}
    </p>
    <div className="grid grid-cols-2 gap-2">
      <div>
        <label className="text-[10px] text-slate-400 block mb-0.5">Font</label>
        <FontPickerComponent
          value={value.font}
          onChange={(font: string) => onChange({ ...value, font })}
          placeholder="Chọn font..."
        />
      </div>
      <div>
        <label className="text-[10px] text-slate-400 block mb-0.5">Size</label>
        <input
          type="number"
          value={value.size}
          onChange={(e) => onChange({ ...value, size: Number(e.target.value) })}
          className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
        />
      </div>
      <div>
        <label className="text-[10px] text-slate-400 block mb-0.5">
          Weight
        </label>
        <select
          value={value.weight}
          onChange={(e) => onChange({ ...value, weight: e.target.value })}
          className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
        >
          {WEIGHT_OPTIONS.map((w) => (
            <option key={w.value} value={w.value}>
              {w.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-[10px] text-slate-400 block mb-0.5">Color</label>
        <div className="flex gap-1">
          <input
            type="color"
            value={value.color}
            onChange={(e) => onChange({ ...value, color: e.target.value })}
            className="w-7 h-7 bg-transparent border-0 cursor-pointer p-0"
          />
          <input
            type="text"
            value={value.color}
            onChange={(e) => onChange({ ...value, color: e.target.value })}
            className="flex-1 bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
          />
        </div>
      </div>
    </div>
  </div>
);

// ============ MAIN ============
export default function AboutCMSAdmin() {
  const { lang } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [aboutData, setAboutData] = useState<any>(null);
  const [selectedLang, setSelectedLang] = useState<"vi" | "en" | "de">("vi");

  // Modal control
  const [openModal, setOpenModal] = useState<
    "header" | "experience" | "achievement" | null
  >(null);

  // ==== STATE ====
  const [headerName, setHeaderName] = useState({ vi: "", en: "", de: "" });
  const [headerDescription, setHeaderDescription] = useState({
    vi: "",
    en: "",
    de: "",
  });
  const [headerSubDescription, setHeaderSubDescription] = useState({
    vi: "",
    en: "",
    de: "",
  });
  const [headerYearText, setHeaderYearText] = useState({
    vi: "",
    en: "",
    de: "",
  });
  const [headerImage, setHeaderImage] = useState("");

  const [styleHeaderName, setStyleHeaderName] = useState({
    font: "Inter",
    size: 160,
    weight: "700",
    color: "#111111",
  });
  const [styleHeaderDescription, setStyleHeaderDescription] = useState({
    font: "Inter",
    size: 24,
    weight: "400",
    color: "#9ca3af",
  });
  const [styleHeaderSubDescription, setStyleHeaderSubDescription] = useState({
    font: "Inter",
    size: 24,
    weight: "600",
    color: "#111111",
  });

  const [styleExperienceTitle, setStyleExperienceTitle] = useState({
    font: "Inter",
    size: 48,
    weight: "600",
    color: "#111111",
  });
  const [styleAchievementTitle, setStyleAchievementTitle] = useState({
    font: "Inter",
    size: 48,
    weight: "600",
    color: "#111111",
  });
  const [styleLabel, setStyleLabel] = useState({
    font: "Inter",
    size: 12,
    weight: "600",
    color: "#9ca3af",
  });
  const [styleExperiencePosition, setStyleExperiencePosition] = useState({
    font: "Inter",
    size: 24,
    weight: "600",
    color: "#111111",
  });
  const [styleExperienceType, setStyleExperienceType] = useState({
    font: "Inter",
    size: 24,
    weight: "600",
    color: "#111111",
  });
  const [styleExperienceCompany, setStyleExperienceCompany] = useState({
    font: "Inter",
    size: 24,
    weight: "600",
    color: "#111111",
  });
  const [styleExperienceYear, setStyleExperienceYear] = useState({
    font: "Inter",
    size: 24,
    weight: "600",
    color: "#111111",
  });
  const [styleAchievementItemTitle, setStyleAchievementItemTitle] = useState({
    font: "Inter",
    size: 24,
    weight: "600",
    color: "#111111",
  });
  const [styleAchievementDescription, setStyleAchievementDescription] =
    useState({
      font: "Inter",
      size: 24,
      weight: "600",
      color: "#111111",
    });
  const [styleAchievementYear, setStyleAchievementYear] = useState({
    font: "Inter",
    size: 24,
    weight: "600",
    color: "#111111",
  });

  const [experienceTitle, setExperienceTitle] = useState({
    vi: "",
    en: "",
    de: "",
  });
  const [experiences, setExperiences] = useState<any[]>([]);

  const [achievementTitle, setAchievementTitle] = useState({
    vi: "",
    en: "",
    de: "",
  });

  const [labelPosition, setLabelPosition] = useState({
    vi: "Vị trí",
    en: "Position",
    de: "Position",
  });
  const [labelType, setLabelType] = useState({
    vi: "Loại hình",
    en: "Type",
    de: "Art",
  });
  const [labelCompany, setLabelCompany] = useState({
    vi: "Công ty",
    en: "Company",
    de: "Firma",
  });
  const [labelYear, setLabelYear] = useState({
    vi: "Thời gian",
    en: "Year",
    de: "Jahr",
  });

  const [labelTitle, setLabelTitle] = useState({
    vi: "Tiêu đề",
    en: "Title",
    de: "Titel",
  });
  const [labelDescription, setLabelDescription] = useState({
    vi: "Mô tả",
    en: "Description",
    de: "Beschreibung",
  });
  const [labelAchievementYear, setLabelAchievementYear] = useState({
    vi: "Thời gian",
    en: "Year",
    de: "Jahr",
  });

  const [achievements, setAchievements] = useState<any[]>([]);

  // ==== FETCH ====
  const fetchAboutData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/about`);
      const data = await res.json();
      if (data.success && data.data) {
        const c = data.data;
        setAboutData(c);

        setHeaderName(
          c.header_name || { vi: "QUI BUI", en: "QUI BUI", de: "QUI BUI" },
        );
        setHeaderDescription(
          c.header_description || {
            vi: "Về tôi",
            en: "About",
            de: "Über mich",
          },
        );
        setHeaderSubDescription(
          c.header_sub_description || {
            vi: "Tôi là một nhà thiết kế và phát triển web sáng tạo, đam mê tạo ra những trải nghiệm kỹ thuật số độc đáo.",
            en: "I am a creative web designer and developer, passionate about creating unique digital experiences.",
            de: "Ich bin ein kreativer Webdesigner und -entwickler, leidenschaftlich daran interessiert, einzigartige digitale Erlebnisse zu schaffen.",
          },
        );
        setHeaderYearText(
          c.header_year_text || { vi: "hiện tại", en: "present", de: "heute" },
        );
        setHeaderImage(c.header_image || "/bhq.jpg");
        setStyleHeaderName(c.style_header_name || styleHeaderName);
        setStyleHeaderDescription(
          c.style_header_description || styleHeaderDescription,
        );
        setStyleHeaderSubDescription(
          c.style_header_sub_description || styleHeaderSubDescription,
        );

        setStyleExperienceTitle(
          c.style_experience_title || styleExperienceTitle,
        );
        setStyleAchievementTitle(
          c.style_achievement_title || styleAchievementTitle,
        );
        setStyleLabel(c.style_label || styleLabel);
        setStyleExperiencePosition(
          c.style_experience_position || styleExperiencePosition,
        );
        setStyleExperienceType(c.style_experience_type || styleExperienceType);
        setStyleExperienceCompany(
          c.style_experience_company || styleExperienceCompany,
        );
        setStyleExperienceYear(c.style_experience_year || styleExperienceYear);
        setStyleAchievementItemTitle(
          c.style_achievement_item_title || styleAchievementItemTitle,
        );
        setStyleAchievementDescription(
          c.style_achievement_description || styleAchievementDescription,
        );
        setStyleAchievementYear(
          c.style_achievement_year || styleAchievementYear,
        );

        setExperienceTitle(
          c.experience_title || {
            vi: "Kinh nghiệm làm việc",
            en: "Work Experience",
            de: "Berufserfahrung",
          },
        );
        setExperiences(c.experiences || []);
        setAchievementTitle(
          c.achievement_title || {
            vi: "Thành tựu",
            en: "Achievements",
            de: "Errungenschaften",
          },
        );
        setLabelPosition(
          c.label_position || { vi: "Vị trí", en: "Position", de: "Position" },
        );
        setLabelType(
          c.label_type || { vi: "Loại hình", en: "Type", de: "Art" },
        );
        setLabelCompany(
          c.label_company || { vi: "Công ty", en: "Company", de: "Firma" },
        );
        setLabelYear(
          c.label_year || { vi: "Thời gian", en: "Year", de: "Jahr" },
        );
        setLabelTitle(
          c.label_title || { vi: "Tiêu đề", en: "Title", de: "Titel" },
        );
        setLabelDescription(
          c.label_description || {
            vi: "Mô tả",
            en: "Description",
            de: "Beschreibung",
          },
        );
        setLabelAchievementYear(
          c.label_achievement_year || {
            vi: "Thời gian",
            en: "Year",
            de: "Jahr",
          },
        );
        setAchievements(c.achievements || []);
      }
    } catch (error) {
      console.error("Error fetching about data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAboutData();
  }, []);

  // ==== UPLOAD IMAGE ====
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("headerImage", file);

    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/upload/image`,
        { method: "POST", body: formData },
      );
      const data = await res.json();

      if (data.success && data.data) {
        const newImageUrl = data.data.header_image;
        if (newImageUrl) {
          setHeaderImage(newImageUrl);
          toast.success("Cập nhật ảnh thành công!");
        } else {
          toast.error("Upload thành công nhưng không nhận được URL ảnh!");
        }
      } else {
        toast.error("Upload thất bại: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Đã xảy ra lỗi khi upload ảnh!");
    } finally {
      setLoading(false);
    }
  };

  // ==== SAVE ====
  const handleSave = async () => {
    try {
      setLoading(true);
      const payload = {
        header_name: headerName,
        header_description: headerDescription,
        header_sub_description: headerSubDescription,
        header_year_text: headerYearText,
        header_image: headerImage,
        style_header_name: styleHeaderName,
        style_header_description: styleHeaderDescription,
        style_header_sub_description: styleHeaderSubDescription,
        style_experience_title: styleExperienceTitle,
        style_achievement_title: styleAchievementTitle,
        style_label: styleLabel,
        style_experience_position: styleExperiencePosition,
        style_experience_type: styleExperienceType,
        style_experience_company: styleExperienceCompany,
        style_experience_year: styleExperienceYear,
        style_achievement_item_title: styleAchievementItemTitle,
        style_achievement_description: styleAchievementDescription,
        style_achievement_year: styleAchievementYear,

        experience_title: experienceTitle,
        experiences,
        achievement_title: achievementTitle,
        achievements,
        label_position: labelPosition,
        label_type: labelType,
        label_company: labelCompany,
        label_year: labelYear,
        label_title: labelTitle,
        label_description: labelDescription,
        label_achievement_year: labelAchievementYear,
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/about`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Lưu thay đổi thành công!");
        fetchAboutData();
      } else {
        toast.error("Lỗi lưu dữ liệu: " + data.message);
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Đã xảy ra lỗi khi lưu dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  const getText = (obj: any) => {
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    return obj[selectedLang] || obj.vi || obj.en || "";
  };

  const renderMultiLangInput = (
    label: string,
    value: any,
    onChange: (val: any) => void,
    type: "text" | "textarea" = "text",
    placeholder = "",
  ) => {
    return (
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-400">{label}</label>
        <div className="grid grid-cols-3 gap-2">
          {["vi", "en", "de"].map((langKey) => (
            <div key={langKey}>
              <span className="text-[10px] text-slate-500 block mb-0.5">
                {langKey === "vi" ? "VI" : langKey === "en" ? "EN" : "DE"}
              </span>
              {type === "textarea" ? (
                <textarea
                  value={value?.[langKey] || ""}
                  onChange={(e) =>
                    onChange({ ...value, [langKey]: e.target.value })
                  }
                  className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs resize-none h-12 focus:border-blue-500 focus:outline-none transition"
                  placeholder={placeholder}
                />
              ) : (
                <input
                  type="text"
                  value={value?.[langKey] || ""}
                  onChange={(e) =>
                    onChange({ ...value, [langKey]: e.target.value })
                  }
                  className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:border-blue-500 focus:outline-none transition"
                  placeholder={placeholder}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading && !aboutData) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="text-slate-400 font-mono text-xs">LOADING ABOUT...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#0B0F19] text-[#E2E8F0] min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ============ TOP TOOLBAR ============ */}
        <div className="bg-[#131A2C] border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={headerImage || "/bhq.jpg"}
              alt="Header"
              className="w-20 h-16 object-cover rounded border border-slate-700"
            />
            <div>
              <h2 className="text-sm font-semibold text-white">About CMS</h2>
              <p className="text-[11px] text-slate-500">
                Quản lý nội dung trang About
              </p>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium px-5 py-2 rounded-lg transition active:scale-95 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Lưu tất cả"}
          </button>
        </div>

        {/* ============ 3 EDIT CARDS ============ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Header Card */}
          <button
            onClick={() => setOpenModal("header")}
            className="group bg-[#131A2C] border border-slate-800 hover:border-blue-500/50 rounded-xl p-5 text-left transition-all hover:shadow-lg hover:shadow-blue-500/10"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h7"
                  />
                </svg>
              </div>
              <svg
                className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-white text-sm mb-1">Header</h3>
            <p className="text-[11px] text-slate-500">
              Tên, mô tả, năm, ảnh & styles
            </p>
          </button>

          {/* Experience Card */}
          <button
            onClick={() => setOpenModal("experience")}
            className="group bg-[#131A2C] border border-slate-800 hover:border-amber-500/50 rounded-xl p-5 text-left transition-all hover:shadow-lg hover:shadow-amber-500/10"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-amber-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <svg
                className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-white text-sm mb-1">
              Kinh nghiệm
            </h3>
            <p className="text-[11px] text-slate-500">
              {experiences.length} mục • Content & styles
            </p>
          </button>

          {/* Achievement Card */}
          <button
            onClick={() => setOpenModal("achievement")}
            className="group bg-[#131A2C] border border-slate-800 hover:border-green-500/50 rounded-xl p-5 text-left transition-all hover:shadow-lg hover:shadow-green-500/10"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <svg
                className="w-4 h-4 text-slate-600 group-hover:text-green-400 transition"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-white text-sm mb-1">Thành tựu</h3>
            <p className="text-[11px] text-slate-500">
              {achievements.length} mục • Content & styles
            </p>
          </button>
        </div>

        {/* ============ PREVIEW NHANH ============ */}
        <div className="bg-[#131A2C] border border-slate-800 rounded-xl p-5">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">
            Preview nhanh
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <p className="text-slate-500 mb-1">Tên header</p>
              <p className="text-white font-semibold">
                {getText(headerName) || "—"}
              </p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Tiêu đề Kinh nghiệm</p>
              <p className="text-white font-semibold">
                {getText(experienceTitle) || "—"}
              </p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Tiêu đề Thành tựu</p>
              <p className="text-white font-semibold">
                {getText(achievementTitle) || "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================= */}
      {/* ==================== MODAL: HEADER ========================== */}
      {/* ============================================================= */}
      <Modal
        isOpen={openModal === "header"}
        onClose={() => setOpenModal(null)}
        title="Chỉnh sửa Header"
        color="blue"
      >
        {/* --- IMAGE --- */}
        <div className="bg-[#131A2C] border border-slate-800 rounded-xl p-4">
          <h3 className="font-semibold text-purple-400 text-xs uppercase tracking-wider mb-3">
            Header Image
          </h3>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <img
              src={headerImage || "/bhq.jpg"}
              alt="Header"
              className="w-32 h-24 object-cover rounded border border-slate-700"
            />
            <label className="cursor-pointer bg-purple-600 hover:bg-purple-500 text-white text-xs px-4 py-1.5 rounded transition inline-block w-fit">
              Upload ảnh mới
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* --- CONTENT --- */}
        <div className="bg-[#131A2C] border border-slate-800 rounded-xl p-4 space-y-4">
          <h3 className="font-semibold text-blue-400 text-xs uppercase tracking-wider">
            Nội dung
          </h3>
          {renderMultiLangInput("Tên", headerName, setHeaderName)}
          {renderMultiLangInput(
            "Mô tả ngắn",
            headerDescription,
            setHeaderDescription,
          )}
          {renderMultiLangInput(
            "Mô tả chi tiết",
            headerSubDescription,
            setHeaderSubDescription,
            "textarea",
          )}
          {renderMultiLangInput(
            "Năm (text)",
            headerYearText,
            setHeaderYearText,
          )}
        </div>

        {/* --- STYLE --- */}
        <div className="bg-[#131A2C] border border-slate-800 rounded-xl p-4">
          <h3 className="font-semibold text-pink-400 text-xs uppercase tracking-wider mb-3">
            Styles
          </h3>
          <StyleCard
            title="Tên (Name)"
            value={styleHeaderName}
            onChange={setStyleHeaderName}
          />
          <StyleCard
            title="Mô tả ngắn (Description)"
            value={styleHeaderDescription}
            onChange={setStyleHeaderDescription}
          />
          <StyleCard
            title="Mô tả chi tiết (Sub Description)"
            value={styleHeaderSubDescription}
            onChange={setStyleHeaderSubDescription}
          />
        </div>
      </Modal>

      {/* ============================================================= */}
      {/* ================== MODAL: EXPERIENCE ======================== */}
      {/* ============================================================= */}
      <Modal
        isOpen={openModal === "experience"}
        onClose={() => setOpenModal(null)}
        title="Chỉnh sửa Kinh nghiệm"
        color="amber"
      >
        {/* --- LABELS --- */}
        <div className="bg-[#131A2C] border border-slate-800 rounded-xl p-4">
          <h3 className="font-semibold text-amber-400 text-xs uppercase tracking-wider mb-3">
            Labels bảng
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {renderMultiLangInput(
              "Vị trí (Position)",
              labelPosition,
              setLabelPosition,
            )}
            {renderMultiLangInput("Loại hình (Type)", labelType, setLabelType)}
            {renderMultiLangInput(
              "Công ty (Company)",
              labelCompany,
              setLabelCompany,
            )}
            {renderMultiLangInput("Thời gian (Year)", labelYear, setLabelYear)}
          </div>
        </div>

        {/* --- CONTENT --- */}
        <div className="bg-[#131A2C] border border-slate-800 rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-blue-400 text-xs uppercase tracking-wider">
            Nội dung
          </h3>
          {renderMultiLangInput(
            "Tiêu đề section",
            experienceTitle,
            setExperienceTitle,
          )}

          {experiences.map((exp, index) => (
            <div
              key={index}
              className="bg-[#1F2937]/30 p-3 rounded-lg border border-slate-800"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] text-slate-400">
                  Kinh nghiệm {index + 1}
                </span>
                <button
                  onClick={() =>
                    setExperiences(experiences.filter((_, i) => i !== index))
                  }
                  className="text-red-400 hover:text-red-500 text-xs font-medium"
                >
                  Xóa
                </button>
              </div>
              {renderMultiLangInput("Vị trí", exp.position, (val) => {
                const newExp = [...experiences];
                newExp[index].position = val;
                setExperiences(newExp);
              })}
              {renderMultiLangInput("Loại hình", exp.type, (val) => {
                const newExp = [...experiences];
                newExp[index].type = val;
                setExperiences(newExp);
              })}
              {renderMultiLangInput("Công ty", exp.company, (val) => {
                const newExp = [...experiences];
                newExp[index].company = val;
                setExperiences(newExp);
              })}
              {renderMultiLangInput("Thời gian", exp.year, (val) => {
                const newExp = [...experiences];
                newExp[index].year = val;
                setExperiences(newExp);
              })}
            </div>
          ))}
          <button
            onClick={() =>
              setExperiences([
                ...experiences,
                {
                  position: { vi: "", en: "", de: "" },
                  type: { vi: "", en: "", de: "" },
                  company: { vi: "", en: "", de: "" },
                  year: { vi: "", en: "", de: "" },
                },
              ])
            }
            className="w-full bg-[#1F2937] hover:bg-[#374151] text-slate-400 hover:text-white text-xs font-medium py-2 rounded-lg transition"
          >
            + Thêm kinh nghiệm
          </button>
        </div>

        {/* --- STYLE --- */}
        <div className="bg-[#131A2C] border border-slate-800 rounded-xl p-4">
          <h3 className="font-semibold text-pink-400 text-xs uppercase tracking-wider mb-3">
            Styles
          </h3>
          <StyleCard
            title="Tiêu đề section"
            value={styleExperienceTitle}
            onChange={setStyleExperienceTitle}
          />
          <StyleCard
            title="Vị trí (Position)"
            value={styleExperiencePosition}
            onChange={setStyleExperiencePosition}
          />
          <StyleCard
            title="Loại hình (Type)"
            value={styleExperienceType}
            onChange={setStyleExperienceType}
          />
          <StyleCard
            title="Công ty (Company)"
            value={styleExperienceCompany}
            onChange={setStyleExperienceCompany}
          />
          <StyleCard
            title="Thời gian (Year)"
            value={styleExperienceYear}
            onChange={setStyleExperienceYear}
          />
          <StyleCard
            title="Labels bảng (dùng chung)"
            value={styleLabel}
            onChange={setStyleLabel}
          />
        </div>
      </Modal>

      {/* ============================================================= */}
      {/* ================= MODAL: ACHIEVEMENT ======================== */}
      {/* ============================================================= */}
      <Modal
        isOpen={openModal === "achievement"}
        onClose={() => setOpenModal(null)}
        title="Chỉnh sửa Thành tựu"
        color="green"
      >
        {/* --- LABELS --- */}
        <div className="bg-[#131A2C] border border-slate-800 rounded-xl p-4">
          <h3 className="font-semibold text-green-400 text-xs uppercase tracking-wider mb-3">
            Labels bảng
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {renderMultiLangInput("Tiêu đề (Title)", labelTitle, setLabelTitle)}
            {renderMultiLangInput(
              "Mô tả (Description)",
              labelDescription,
              setLabelDescription,
            )}
            {renderMultiLangInput(
              "Thời gian (Year)",
              labelAchievementYear,
              setLabelAchievementYear,
            )}
          </div>
        </div>

        {/* --- CONTENT --- */}
        <div className="bg-[#131A2C] border border-slate-800 rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-blue-400 text-xs uppercase tracking-wider">
            Nội dung
          </h3>
          {renderMultiLangInput(
            "Tiêu đề section",
            achievementTitle,
            setAchievementTitle,
          )}

          {achievements.map((ach, index) => (
            <div
              key={index}
              className="bg-[#1F2937]/30 p-3 rounded-lg border border-slate-800"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] text-slate-400">
                  Thành tựu {index + 1}
                </span>
                <button
                  onClick={() =>
                    setAchievements(achievements.filter((_, i) => i !== index))
                  }
                  className="text-red-400 hover:text-red-500 text-xs font-medium"
                >
                  Xóa
                </button>
              </div>
              {renderMultiLangInput("Tiêu đề", ach.title, (val) => {
                const newAch = [...achievements];
                newAch[index].title = val;
                setAchievements(newAch);
              })}
              {renderMultiLangInput(
                "Mô tả",
                ach.description,
                (val) => {
                  const newAch = [...achievements];
                  newAch[index].description = val;
                  setAchievements(newAch);
                },
                "textarea",
              )}
              {renderMultiLangInput("Thời gian", ach.year, (val) => {
                const newAch = [...achievements];
                newAch[index].year = val;
                setAchievements(newAch);
              })}
            </div>
          ))}
          <button
            onClick={() =>
              setAchievements([
                ...achievements,
                {
                  title: { vi: "", en: "", de: "" },
                  description: { vi: "", en: "", de: "" },
                  year: { vi: "", en: "", de: "" },
                },
              ])
            }
            className="w-full bg-[#1F2937] hover:bg-[#374151] text-slate-400 hover:text-white text-xs font-medium py-2 rounded-lg transition"
          >
            + Thêm thành tựu
          </button>
        </div>

        {/* --- STYLE --- */}
        <div className="bg-[#131A2C] border border-slate-800 rounded-xl p-4">
          <h3 className="font-semibold text-pink-400 text-xs uppercase tracking-wider mb-3">
            Styles
          </h3>
          <StyleCard
            title="Tiêu đề section"
            value={styleAchievementTitle}
            onChange={setStyleAchievementTitle}
          />
          <StyleCard
            title="Tiêu đề item"
            value={styleAchievementItemTitle}
            onChange={setStyleAchievementItemTitle}
          />
          <StyleCard
            title="Mô tả (Description)"
            value={styleAchievementDescription}
            onChange={setStyleAchievementDescription}
          />
          <StyleCard
            title="Thời gian (Year)"
            value={styleAchievementYear}
            onChange={setStyleAchievementYear}
          />
          <StyleCard
            title="Labels bảng (dùng chung)"
            value={styleLabel}
            onChange={setStyleLabel}
          />
        </div>
      </Modal>
    </div>
  );
}
