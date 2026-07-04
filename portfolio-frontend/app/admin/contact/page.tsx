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

export default function ContactCMSAdmin() {
  const { lang } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [contactData, setContactData] = useState<any>(null);
  const [selectedLang, setSelectedLang] = useState<"vi" | "en" | "de">("vi");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // State cho form
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

  // Style states
  const [styleHeader, setStyleHeader] = useState({
    font: "Inter",
    size: 32,
    weight: "700",
    color: "#111111",
    align: "left",
  });

  // Button và placeholder texts
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

  // Fetch dữ liệu
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
        setStyleHeader(c.style_header || styleHeader);
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

  // Upload avatar
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/upload-avatar`,
        {
          method: "POST",
          body: formData,
        },
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

  // Save tất cả dữ liệu
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

  // Helper để lấy text theo ngôn ngữ
  const getText = (obj: any) => {
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    return obj[selectedLang] || obj.vi || obj.en || "";
  };

  // Render form cho multi-language field
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
    <div className="bg-[#0B0F19] text-[#E2E8F0] max-h-[100vh] overflow-auto scroll-none">
      {/* Avatar */}
      <div className="bg-[#131A2C] border border-slate-800 rounded-xl p-4 mb-4 sticky top-0">
        <h3 className="font-semibold text-purple-400 text-xs uppercase tracking-wider mb-3">
          Avatar
        </h3>
        <div className="flex justify-between sm:flex-row items-center gap-4">
          <img
            src={avatarUrl || "/avt_bhq.png"}
            alt="Avatar"
            className="w-20 h-20 object-cover rounded-full border-2 border-slate-700"
          />
          <div className="flex flex-col">
            <label className="cursor-pointer bg-purple-600 hover:bg-purple-500 text-white text-xs px-4 py-1.5 rounded transition inline-block">
              Upload ảnh mới
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </label>
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-emerald-600 mt-4 hover:bg-emerald-500 text-white text-xs px-4 py-1.5 rounded transition active:scale-95 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Lưu"}
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto">
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Header Text */}
            <div className="bg-[#131A2C] border border-slate-800 rounded-xl p-4">
              <h3 className="font-semibold text-blue-400 text-xs uppercase tracking-wider mb-3">
                Header Text
              </h3>
              {renderMultiLangInput("", headerText, setHeaderText, "textarea")}
            </div>

            {/* Contact Info */}
            <div className="bg-[#131A2C] border border-slate-800 rounded-xl p-4 space-y-4">
              <h3 className="font-semibold text-blue-400 text-xs uppercase tracking-wider">
                Thông tin liên hệ
              </h3>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email.value || ""}
                  onChange={(e) =>
                    setEmail({ ...email, value: e.target.value })
                  }
                  className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:border-blue-500 focus:outline-none transition"
                  placeholder="hello@example.com"
                />
                <div className="mt-2">
                  {renderMultiLangInput("Label", email.label, (val) =>
                    setEmail({ ...email, label: val }),
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  value={phone.value || ""}
                  onChange={(e) =>
                    setPhone({ ...phone, value: e.target.value })
                  }
                  className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:border-blue-500 focus:outline-none transition"
                  placeholder="+84 92 5555 958"
                />
                <div className="mt-2">
                  {renderMultiLangInput("Label", phone.label, (val) =>
                    setPhone({ ...phone, label: val }),
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={address.value || ""}
                  onChange={(e) =>
                    setAddress({ ...address, value: e.target.value })
                  }
                  className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:border-blue-500 focus:outline-none transition"
                  placeholder="Ho Chi Minh City, Vietnam"
                />
                <div className="mt-2">
                  {renderMultiLangInput("Label", address.label, (val) =>
                    setAddress({ ...address, label: val }),
                  )}
                </div>
              </div>

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

            {/* Services */}
            <div className="bg-[#131A2C] border border-slate-800 rounded-xl p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-amber-400 text-xs uppercase tracking-wider">
                  Dịch vụ
                </h3>
                <span className="text-[10px] text-slate-500">
                  Mỗi dịch vụ có 3 ngôn ngữ
                </span>
              </div>
              <div className="overflow-auto max-h-[60vh] p-4">
                {services.map((service, index) => (
                  <div
                    key={index}
                    className="bg-[#1F2937]/30 p-3 rounded-lg border border-slate-800 mb-2"
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
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Style */}
            <div className="bg-[#131A2C] border border-slate-800 rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-pink-400 text-xs uppercase tracking-wider">
                Header Style
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">
                    Font
                  </label>
                  <FontPickerComponent
                    value={styleHeader.font}
                    onChange={(font) =>
                      setStyleHeader({ ...styleHeader, font })
                    }
                    placeholder="Chọn font..."
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">
                    Size
                  </label>
                  <input
                    type="number"
                    value={styleHeader.size}
                    onChange={(e) =>
                      setStyleHeader({
                        ...styleHeader,
                        size: Number(e.target.value),
                      })
                    }
                    className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">
                    Weight
                  </label>
                  <select
                    value={styleHeader.weight}
                    onChange={(e) =>
                      setStyleHeader({ ...styleHeader, weight: e.target.value })
                    }
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
                    Color
                  </label>
                  <div className="flex gap-1">
                    <input
                      type="color"
                      value={styleHeader.color}
                      onChange={(e) =>
                        setStyleHeader({
                          ...styleHeader,
                          color: e.target.value,
                        })
                      }
                      className="w-7 h-7 bg-transparent border-0 cursor-pointer p-0"
                    />
                    <input
                      type="text"
                      value={styleHeader.color}
                      onChange={(e) =>
                        setStyleHeader({
                          ...styleHeader,
                          color: e.target.value,
                        })
                      }
                      className="flex-1 bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] text-slate-400 block mb-0.5">
                    Align
                  </label>
                  <select
                    value={styleHeader.align}
                    onChange={(e) =>
                      setStyleHeader({
                        ...styleHeader,
                        align: e.target.value as any,
                      })
                    }
                    className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Buttons & Placeholders */}
            <div className="bg-[#131A2C] border border-slate-800 rounded-xl p-4 space-y-4">
              <h3 className="font-semibold text-green-400 text-xs uppercase tracking-wider">
                Button & Placeholder
              </h3>
              {renderMultiLangInput(
                "Liên hệ",
                buttonGetInTouch,
                setButtonGetInTouch,
              )}
              {renderMultiLangInput(
                "Cảm ơn",
                buttonThankYou,
                setButtonThankYou,
              )}
              {renderMultiLangInput(
                "Họ và tên",
                placeholderFullname,
                setPlaceholderFullname,
              )}
              {renderMultiLangInput(
                "Email",
                placeholderEmail,
                setPlaceholderEmail,
              )}
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
                "Dịch vụ",
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
          </div>
        </div>
      </div>
    </div>
  );
}
