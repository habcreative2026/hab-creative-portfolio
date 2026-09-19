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
  color?: "blue" | "amber" | "green" | "pink" | "purple";
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;

  const colorMap: Record<string, string> = {
    blue: "text-blue-400",
    amber: "text-amber-400",
    green: "text-green-400",
    pink: "text-pink-400",
    purple: "text-purple-400",
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
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2
            className={`font-semibold text-sm uppercase tracking-wider ${colorMap[color]}`}
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
        <div className="overflow-auto p-5 space-y-4 flex-1">{children}</div>
      </div>
    </div>
  );
};

// ============ STYLE CARD ============
const StyleCard = ({
  title,
  value,
  onChange,
  showBg = false,
}: {
  title: string;
  value: any;
  onChange: (v: any) => void;
  showBg?: boolean;
}) => (
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
        <label className="text-[10px] text-slate-400 block mb-0.5">
          Color (không dùng ở STYLE - BUTTON)
        </label>
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
export default function ContactCMSAdmin() {
  const { lang } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [contactData, setContactData] = useState<any>(null);
  const [selectedLang, setSelectedLang] = useState<"vi" | "en" | "de">("vi");

  const [openModal, setOpenModal] = useState<
    "header" | "contact" | "service" | "form" | null
  >(null);

  // ============ STATE ============
  const [headerText, setHeaderText] = useState({ vi: "", en: "", de: "" });
  const [email, setEmail] = useState({
    label: { vi: "", en: "", de: "" },
    value: "",
  });
  const [phone, setPhone] = useState({
    label: { vi: "", en: "", de: "" },
    value: "",
  });
  const [address, setAddress] = useState({
    label: { vi: "", en: "", de: "" },
    value: "",
  });
  const [services, setServices] = useState<any[]>([]);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [mapsUrl, setMapsUrl] = useState("");

  // ============ STYLES ============
  const [styleHeader, setStyleHeader] = useState({
    font: "Inter",
    size: 32,
    weight: "700",
    color: "#111111",
    align: "left",
  });
  const [styleContactInfo, setStyleContactInfo] = useState({
    font: "Inter",
    size: 14,
    weight: "400",
    color: "#111111",
  });
  const [styleButton, setStyleButton] = useState({
    font: "Inter",
    size: 16,
    weight: "500",
  });
  const [stylePlaceholder, setStylePlaceholder] = useState({
    font: "Inter",
    size: 16,
    weight: "400",
    color: "#111111",
  });
  const [styleService, setStyleService] = useState({
    font: "Inter",
    size: 16,
    weight: "400",
    color: "#111111",
    bg_color: "#ebebeb",
  });

  // Button và placeholder
  const [buttonGetInTouch, setButtonGetInTouch] = useState({
    vi: "",
    en: "",
    de: "",
  });
  const [buttonThankYou, setButtonThankYou] = useState({
    vi: "",
    en: "",
    de: "",
  });
  const [placeholderFullname, setPlaceholderFullname] = useState({
    vi: "",
    en: "",
    de: "",
  });
  const [placeholderEmail, setPlaceholderEmail] = useState({
    vi: "",
    en: "",
    de: "",
  });
  const [placeholderPhone, setPlaceholderPhone] = useState({
    vi: "",
    en: "",
    de: "",
  });
  const [placeholderCompany, setPlaceholderCompany] = useState({
    vi: "",
    en: "",
    de: "",
  });
  const [placeholderService, setPlaceholderService] = useState({
    vi: "",
    en: "",
    de: "",
  });
  const [placeholderProjectDetail, setPlaceholderProjectDetail] = useState({
    vi: "",
    en: "",
    de: "",
  });
  const [placeholderMessage, setPlaceholderMessage] = useState({
    vi: "",
    en: "",
    de: "",
  });

  // ============ FETCH ============
  const fetchContactData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact`);
      const data = await res.json();
      if (data.success && data.data) {
        const c = data.data;
        setContactData(c);

        setHeaderText(c.header_text || { vi: "", en: "", de: "" });
        setEmail(
          c.email || {
            label: { vi: "Email", en: "Email", de: "Email" },
            value: "",
          },
        );
        setPhone(
          c.phone || {
            label: { vi: "Điện thoại", en: "Phone", de: "Telefon" },
            value: "",
          },
        );
        setAddress(
          c.address || {
            label: { vi: "Địa chỉ", en: "Based", de: "Basiert" },
            value: "",
          },
        );
        setServices(c.services || []);
        setAvatarUrl(c.avatar_url || "/avt_bhq.png");
        setMapsUrl(c.maps_url || "");

        // Styles
        setStyleHeader(c.style_header || styleHeader);
        setStyleContactInfo(c.style_contact_info || styleContactInfo);
        setStyleButton(c.style_button || styleButton);
        setStylePlaceholder(c.style_placeholder || stylePlaceholder);
        setStyleService(c.style_service || styleService);

        setButtonGetInTouch(
          c.button_get_in_touch || {
            vi: "Liên hệ",
            en: "Contact",
            de: "Kontakt",
          },
        );
        setButtonThankYou(
          c.button_thank_you || {
            vi: "Cảm ơn bạn!",
            en: "Thank You!",
            de: "Danke!",
          },
        );
        setPlaceholderFullname(
          c.placeholder_fullname || {
            vi: "Họ và tên*",
            en: "Full Name*",
            de: "Vollständiger Name*",
          },
        );
        setPlaceholderEmail(
          c.placeholder_email || {
            vi: "Email*",
            en: "Email*",
            de: "E-Mail*",
          },
        );
        setPlaceholderPhone(
          c.placeholder_phone || {
            vi: "Số điện thoại",
            en: "Phone Number",
            de: "Telefonnummer",
          },
        );
        setPlaceholderCompany(
          c.placeholder_company || {
            vi: "Công ty",
            en: "Company",
            de: "Firma",
          },
        );
        setPlaceholderService(
          c.placeholder_service || {
            vi: "Bạn cần tư vấn về dịch vụ nào?",
            en: "What service are you interested in?",
            de: "An welchem Service sind Sie interessiert?",
          },
        );
        setPlaceholderProjectDetail(
          c.placeholder_project_detail || {
            vi: "Chi tiết dự án",
            en: "Project Details",
            de: "Projektdetails",
          },
        );
        setPlaceholderMessage(
          c.placeholder_message || {
            vi: "Tin nhắn",
            en: "Message",
            de: "Nachricht",
          },
        );
      }
    } catch (error) {
      console.error("Error fetching contact data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactData();
  }, []);

  // ============ UPLOAD AVATAR ============
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/contact/upload-avatar`,
        { method: "POST", body: formData },
      );
      const data = await res.json();

      if (data.success && data.data) {
        const newAvatarUrl = data.data.avatar_url || data.data.avatarUrl;
        if (newAvatarUrl) {
          setAvatarUrl(newAvatarUrl);
          toast.success("Cập nhật avatar thành công!");
        } else {
          toast.error("Upload thành công nhưng không nhận được URL ảnh!");
        }
      } else {
        toast.error("Upload thất bại: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Đã xảy ra lỗi khi upload avatar!");
    } finally {
      setLoading(false);
    }
  };

  // ============ SAVE ============
  const handleSave = async () => {
    try {
      setLoading(true);
      const payload = {
        header_text: headerText,
        email,
        phone,
        address,
        services,
        avatar_url: avatarUrl,
        maps_url: mapsUrl,
        style_header: styleHeader,
        style_contact_info: styleContactInfo,
        style_button: styleButton,
        style_placeholder: stylePlaceholder,
        style_service: styleService,
        button_get_in_touch: buttonGetInTouch,
        button_thank_you: buttonThankYou,
        placeholder_fullname: placeholderFullname,
        placeholder_email: placeholderEmail,
        placeholder_phone: placeholderPhone,
        placeholder_company: placeholderCompany,
        placeholder_service: placeholderService,
        placeholder_project_detail: placeholderProjectDetail,
        placeholder_message: placeholderMessage,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/contact`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (data.success) {
        toast.success("Lưu thay đổi thành công!");
        fetchContactData();
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

  if (loading && !contactData) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="text-slate-400 font-mono text-xs">
          LOADING CONTACT CMS...
        </div>
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
              src={avatarUrl || "/avt_bhq.png"}
              alt="Avatar"
              className="w-16 h-16 object-cover rounded-full border-2 border-slate-700"
            />
            <div>
              <h2 className="text-sm font-semibold text-white">Contact CMS</h2>
              <p className="text-[11px] text-slate-500">
                Quản lý trang Liên hệ
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

        {/* ============ 4 EDIT CARDS ============ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Header */}
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
              Tiêu đề + style + avatar
            </p>
          </button>

          {/* Contact Info */}
          <button
            onClick={() => setOpenModal("contact")}
            className="group bg-[#131A2C] border border-slate-800 hover:border-purple-500/50 rounded-xl p-5 text-left transition-all hover:shadow-lg hover:shadow-purple-500/10"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <svg
                className="w-4 h-4 text-slate-600 group-hover:text-purple-400 transition"
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
              Thông tin liên hệ
            </h3>
            <p className="text-[11px] text-slate-500">
              Email, phone, địa chỉ + style
            </p>
          </button>

          {/* Services */}
          <button
            onClick={() => setOpenModal("service")}
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
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
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
            <h3 className="font-semibold text-white text-sm mb-1">Dịch vụ</h3>
            <p className="text-[11px] text-slate-500">
              {services.length} mục • Content & style
            </p>
          </button>

          {/* Form */}
          <button
            onClick={() => setOpenModal("form")}
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
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
            <h3 className="font-semibold text-white text-sm mb-1">
              Form & Placeholder
            </h3>
            <p className="text-[11px] text-slate-500">
              Placeholder, button + style
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
              <p className="text-slate-500 mb-1">Header</p>
              <p className="text-white font-semibold">
                {getText(headerText) || "—"}
              </p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Email</p>
              <p className="text-white font-semibold break-all">
                {email.value || "—"}
              </p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Dịch vụ</p>
              <p className="text-white font-semibold">{services.length} mục</p>
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
        {/* Avatar */}
        <div className="bg-[#131A2C] border border-slate-800 rounded-xl p-4">
          <h3 className="font-semibold text-purple-400 text-xs uppercase tracking-wider mb-3">
            Avatar
          </h3>
          <div className="flex items-center gap-4">
            <img
              src={avatarUrl || "/avt_bhq.png"}
              alt="Avatar"
              className="w-20 h-20 object-cover rounded-full border-2 border-slate-700"
            />
            <label className="cursor-pointer bg-purple-600 hover:bg-purple-500 text-white text-xs px-4 py-1.5 rounded transition inline-block">
              Upload ảnh mới
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Content */}
        <div className="bg-[#131A2C] border border-slate-800 rounded-xl p-4">
          <h3 className="font-semibold text-blue-400 text-xs uppercase tracking-wider mb-3">
            Nội dung
          </h3>
          {renderMultiLangInput(
            "Header text",
            headerText,
            setHeaderText,
            "textarea",
          )}
        </div>

        {/* Style */}
        <div className="bg-[#131A2C] border border-slate-800 rounded-xl p-4">
          <h3 className="font-semibold text-pink-400 text-xs uppercase tracking-wider mb-3">
            Style
          </h3>
          <StyleCard
            title="Header text"
            value={styleHeader}
            onChange={setStyleHeader}
          />
          <div className="mt-2">
            <label className="text-[10px] text-slate-400 block mb-0.5">
              Align
            </label>
            <select
              value={styleHeader.align}
              onChange={(e) =>
                setStyleHeader({ ...styleHeader, align: e.target.value as any })
              }
              className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* ============================================================= */}
      {/* ================ MODAL: CONTACT INFO ======================== */}
      {/* ============================================================= */}
      <Modal
        isOpen={openModal === "contact"}
        onClose={() => setOpenModal(null)}
        title="Chỉnh sửa Thông tin liên hệ"
        color="purple"
      >
        {/* Email */}
        <div className="bg-[#131A2C] border border-slate-800 rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-purple-400 text-xs uppercase tracking-wider">
            Email
          </h3>
          <input
            type="email"
            value={email.value || ""}
            onChange={(e) => setEmail({ ...email, value: e.target.value })}
            className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:border-blue-500 focus:outline-none transition"
            placeholder="hello@example.com"
          />
          {renderMultiLangInput("Label", email.label, (val) =>
            setEmail({ ...email, label: val }),
          )}
        </div>

        {/* Phone */}
        <div className="bg-[#131A2C] border border-slate-800 rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-purple-400 text-xs uppercase tracking-wider">
            Phone
          </h3>
          <input
            type="text"
            value={phone.value || ""}
            onChange={(e) => setPhone({ ...phone, value: e.target.value })}
            className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:border-blue-500 focus:outline-none transition"
            placeholder="+84 92 5555 958"
          />
          {renderMultiLangInput("Label", phone.label, (val) =>
            setPhone({ ...phone, label: val }),
          )}
        </div>

        {/* Address */}
        <div className="bg-[#131A2C] border border-slate-800 rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-purple-400 text-xs uppercase tracking-wider">
            Address
          </h3>
          <input
            type="text"
            value={address.value || ""}
            onChange={(e) => setAddress({ ...address, value: e.target.value })}
            className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:border-blue-500 focus:outline-none transition"
            placeholder="Ho Chi Minh City, Vietnam"
          />
          {renderMultiLangInput("Label", address.label, (val) =>
            setAddress({ ...address, label: val }),
          )}
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1">
              Google Maps URL
            </label>
            <input
              type="text"
              value={mapsUrl || ""}
              onChange={(e) => setMapsUrl(e.target.value)}
              className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:border-blue-500 focus:outline-none transition"
              placeholder="https://www.google.com/maps/..."
            />
          </div>
        </div>

        {/* Style */}
        <div className="bg-[#131A2C] border border-slate-800 rounded-xl p-4">
          <h3 className="font-semibold text-pink-400 text-xs uppercase tracking-wider mb-3">
            Style
          </h3>
          <StyleCard
            title="Thông tin liên hệ (Email/Phone/Address)"
            value={styleContactInfo}
            onChange={setStyleContactInfo}
          />
        </div>
      </Modal>

      {/* ============================================================= */}
      {/* =================== MODAL: SERVICES ========================= */}
      {/* ============================================================= */}
      <Modal
        isOpen={openModal === "service"}
        onClose={() => setOpenModal(null)}
        title="Chỉnh sửa Dịch vụ"
        color="amber"
      >
        {/* Content */}
        <div className="bg-[#131A2C] border border-slate-800 rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-amber-400 text-xs uppercase tracking-wider">
            Danh sách dịch vụ
          </h3>
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-[#1F2937]/30 p-3 rounded-lg border border-slate-800"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] text-slate-400">
                  Dịch vụ {index + 1}
                </span>
                <button
                  onClick={() =>
                    setServices(services.filter((_, i) => i !== index))
                  }
                  className="text-red-400 hover:text-red-500 text-xs font-medium"
                >
                  Xóa
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {["vi", "en", "de"].map((langKey) => (
                  <input
                    key={langKey}
                    type="text"
                    value={service?.[langKey] || ""}
                    onChange={(e) => {
                      const newServices = [...services];
                      newServices[index][langKey] = e.target.value;
                      setServices(newServices);
                    }}
                    className="bg-[#111827] border border-slate-700 p-2 rounded text-white text-xs focus:border-blue-500 focus:outline-none"
                    placeholder={langKey.toUpperCase()}
                  />
                ))}
              </div>
            </div>
          ))}
          <button
            onClick={() =>
              setServices([...services, { vi: "", en: "", de: "" }])
            }
            className="w-full bg-[#1F2937] hover:bg-[#374151] text-slate-400 hover:text-white text-xs font-medium py-2 rounded-lg transition"
          >
            + Thêm dịch vụ
          </button>
        </div>

        {/* Style */}
        <div className="bg-[#131A2C] border border-slate-800 rounded-xl p-4">
          <h3 className="font-semibold text-pink-400 text-xs uppercase tracking-wider mb-3">
            Style
          </h3>
          <StyleCard
            title="Dịch vụ (Dropdown items)"
            value={styleService}
            onChange={setStyleService}
            showBg
          />
        </div>
      </Modal>

      {/* ============================================================= */}
      {/* ============== MODAL: FORM & PLACEHOLDER ==================== */}
      {/* ============================================================= */}
      <Modal
        isOpen={openModal === "form"}
        onClose={() => setOpenModal(null)}
        title="Chỉnh sửa Form & Placeholder"
        color="green"
      >
        {/* Content - Button */}
        <div className="bg-[#131A2C] border border-slate-800 rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-green-400 text-xs uppercase tracking-wider">
            Button
          </h3>
          {renderMultiLangInput(
            "Nút gửi (Get in touch)",
            buttonGetInTouch,
            setButtonGetInTouch,
          )}
          {renderMultiLangInput(
            "Nút cảm ơn (Thank you)",
            buttonThankYou,
            setButtonThankYou,
          )}
        </div>

        {/* Content - Placeholder */}
        <div className="bg-[#131A2C] border border-slate-800 rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-blue-400 text-xs uppercase tracking-wider">
            Placeholder
          </h3>
          {renderMultiLangInput(
            "Họ và tên",
            placeholderFullname,
            setPlaceholderFullname,
          )}
          {renderMultiLangInput("Email", placeholderEmail, setPlaceholderEmail)}
          {renderMultiLangInput(
            "Số điện thoại",
            placeholderPhone,
            setPlaceholderPhone,
          )}
          {renderMultiLangInput(
            "Công ty",
            placeholderCompany,
            setPlaceholderCompany,
          )}
          {renderMultiLangInput(
            "Dịch vụ (dropdown)",
            placeholderService,
            setPlaceholderService,
          )}
          {renderMultiLangInput(
            "Chi tiết dự án",
            placeholderProjectDetail,
            setPlaceholderProjectDetail,
          )}
          {renderMultiLangInput(
            "Tin nhắn",
            placeholderMessage,
            setPlaceholderMessage,
            "textarea",
          )}
        </div>

        {/* Style - Button */}
        <div className="bg-[#131A2C] border border-slate-800 rounded-xl p-4">
          <h3 className="font-semibold text-pink-400 text-xs uppercase tracking-wider mb-3">
            Style - Button
          </h3>
          <StyleCard
            title="Nút gửi"
            value={styleButton}
            onChange={setStyleButton}
            showBg
          />
        </div>

        {/* Style - Placeholder */}
        <div className="bg-[#131A2C] border border-slate-800 rounded-xl p-4">
          <h3 className="font-semibold text-pink-400 text-xs uppercase tracking-wider mb-3">
            Style - Placeholder
          </h3>
          <StyleCard
            title="Text trong input / textarea"
            value={stylePlaceholder}
            onChange={setStylePlaceholder}
          />
        </div>
      </Modal>
    </div>
  );
}
