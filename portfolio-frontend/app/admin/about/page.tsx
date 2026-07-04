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

export default function AboutCMSAdmin() {
  const { lang } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [aboutData, setAboutData] = useState<any>(null);
  const [selectedLang, setSelectedLang] = useState<"vi" | "en" | "de">("vi");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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
          c.label_position || {
            vi: "Vị trí",
            en: "Position",
            de: "Position",
          },
        );
        setLabelType(
          c.label_type || {
            vi: "Loại hình",
            en: "Type",
            de: "Art",
          },
        );
        setLabelCompany(
          c.label_company || {
            vi: "Công ty",
            en: "Company",
            de: "Firma",
          },
        );
        setLabelYear(
          c.label_year || {
            vi: "Thời gian",
            en: "Year",
            de: "Jahr",
          },
        );
        setLabelTitle(
          c.label_title || {
            vi: "Tiêu đề",
            en: "Title",
            de: "Titel",
          },
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

  // Upload header image
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("headerImage", file);

    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/upload-image`,
        {
          method: "POST",
          body: formData,
        },
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

  // Save tất cả dữ liệu
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

  // Helper lấy text theo ngôn ngữ
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

  if (loading && !aboutData) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="text-slate-400 font-mono text-xs">LOADING ABOUT...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#0B0F19] text-[#E2E8F0] scroll-none max-h-[100vh] overflow-auto">
      {/* Header Image */}
      <div className="bg-[#131A2C] border border-slate-800 rounded-xl p-4 mb-4 sticky top-0">
        <h3 className="font-semibold text-purple-400 text-xs uppercase tracking-wider mb-3">
          Header Image
        </h3>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <img
            src={headerImage || "/bhq.jpg"}
            alt="Header"
            className="w-32 h-24 object-cover rounded border border-slate-700"
          />

          <div className="flex flex-col">
            <label className="cursor-pointer bg-purple-600 hover:bg-purple-500 text-white text-xs px-4 py-1.5 rounded transition inline-block">
              Upload ảnh mới
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
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
            {/* Header Info */}
            <div className="bg-[#131A2C] border border-slate-800 rounded-xl p-4 space-y-4">
              <h3 className="font-semibold text-blue-400 text-xs uppercase tracking-wider">
                Header
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

            {/* Experiences */}
            <div className="bg-[#131A2C] border border-slate-800 rounded-xl p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-amber-400 text-xs uppercase tracking-wider">
                  Kinh nghiệm
                </h3>
                {/* <span className="text-[10px] text-slate-500">
                  Mỗi mục có 3 ngôn ngữ
                </span> */}
              </div>

              <div className="overflow-auto max-h-[70vh] p-4">
                {/* Labels cho Experiences */}
                <div className="bg-[#1F2937]/20 p-3 rounded-lg border border-slate-700/50 mb-3">
                  <p className="text-[10px] text-slate-400 font-medium mb-2">
                    Labels cho bảng Kinh nghiệm
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {renderMultiLangInput(
                      "Vị trí (Position)",
                      labelPosition,
                      setLabelPosition,
                    )}
                    {renderMultiLangInput(
                      "Loại hình (Type)",
                      labelType,
                      setLabelType,
                    )}
                    {renderMultiLangInput(
                      "Công ty (Company)",
                      labelCompany,
                      setLabelCompany,
                    )}
                    {renderMultiLangInput(
                      "Thời gian (Year)",
                      labelYear,
                      setLabelYear,
                    )}
                  </div>
                </div>

                {renderMultiLangInput(
                  "Tiêu đề",
                  experienceTitle,
                  setExperienceTitle,
                )}

                {experiences.map((exp, index) => (
                  <div
                    key={index}
                    className="bg-[#1F2937]/30 p-3 rounded-lg border border-slate-800 mt-3"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] text-slate-400">
                        Kinh nghiệm {index + 1}
                      </span>
                      <button
                        onClick={() =>
                          setExperiences(
                            experiences.filter((_, i) => i !== index),
                          )
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
                  className="w-full bg-[#1F2937] hover:bg-[#374151] text-slate-400 hover:text-white text-xs font-medium py-2 rounded-lg transition mt-3"
                >
                  + Thêm kinh nghiệm
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Achievements */}
            <div className="bg-[#131A2C] border border-slate-800 rounded-xl p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-green-400 text-xs uppercase tracking-wider">
                  Thành tựu
                </h3>
                {/* <span className="text-[10px] text-slate-500">
                  Mỗi mục có 3 ngôn ngữ
                </span> */}
              </div>

              <div className="overflow-auto max-h-[60vh] p-4">
                {/* Labels cho Achievements */}
                <div className="bg-[#1F2937]/20 p-3 rounded-lg border border-slate-700/50 mb-3">
                  <p className="text-[10px] text-slate-400 font-medium mb-2">
                    Labels cho bảng Thành tựu
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {renderMultiLangInput(
                      "Tiêu đề (Title)",
                      labelTitle,
                      setLabelTitle,
                    )}
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

                {renderMultiLangInput(
                  "Tiêu đề",
                  achievementTitle,
                  setAchievementTitle,
                )}

                {achievements.map((ach, index) => (
                  <div
                    key={index}
                    className="bg-[#1F2937]/30 p-3 rounded-lg border border-slate-800 mt-3"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] text-slate-400">
                        Thành tựu {index + 1}
                      </span>
                      <button
                        onClick={() =>
                          setAchievements(
                            achievements.filter((_, i) => i !== index),
                          )
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
                  className="w-full bg-[#1F2937] hover:bg-[#374151] text-slate-400 hover:text-white text-xs font-medium py-2 rounded-lg transition mt-3"
                >
                  + Thêm thành tựu
                </button>
              </div>
            </div>

            {/* Styles */}
            <div className="bg-[#131A2C] border border-slate-800 rounded-xl p-4 space-y-3 overflow-auto max-h-[80vh]">
              <h3 className="font-semibold text-pink-400 text-xs uppercase tracking-wider">
                Header Styles
              </h3>

              {/* Header Name Style */}
              <div className="border-b border-slate-800 pb-3">
                <p className="text-[10px] text-slate-500 mb-2">Tên (Name)</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">
                      Font
                    </label>
                    <FontPickerComponent
                      value={styleHeaderName.font}
                      onChange={(font) =>
                        setStyleHeaderName({ ...styleHeaderName, font })
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
                      value={styleHeaderName.size}
                      onChange={(e) =>
                        setStyleHeaderName({
                          ...styleHeaderName,
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
                      value={styleHeaderName.weight}
                      onChange={(e) =>
                        setStyleHeaderName({
                          ...styleHeaderName,
                          weight: e.target.value,
                        })
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
                        value={styleHeaderName.color}
                        onChange={(e) =>
                          setStyleHeaderName({
                            ...styleHeaderName,
                            color: e.target.value,
                          })
                        }
                        className="w-7 h-7 bg-transparent border-0 cursor-pointer p-0"
                      />
                      <input
                        type="text"
                        value={styleHeaderName.color}
                        onChange={(e) =>
                          setStyleHeaderName({
                            ...styleHeaderName,
                            color: e.target.value,
                          })
                        }
                        className="flex-1 bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Header Description Style */}
              <div className="border-b border-slate-800 pb-3">
                <p className="text-[10px] text-slate-500 mb-2">
                  Mô tả ngắn (Description)
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">
                      Font
                    </label>
                    <FontPickerComponent
                      value={styleHeaderDescription.font}
                      onChange={(font) =>
                        setStyleHeaderDescription({
                          ...styleHeaderDescription,
                          font,
                        })
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
                      value={styleHeaderDescription.size}
                      onChange={(e) =>
                        setStyleHeaderDescription({
                          ...styleHeaderDescription,
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
                      value={styleHeaderDescription.weight}
                      onChange={(e) =>
                        setStyleHeaderDescription({
                          ...styleHeaderDescription,
                          weight: e.target.value,
                        })
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
                        value={styleHeaderDescription.color}
                        onChange={(e) =>
                          setStyleHeaderDescription({
                            ...styleHeaderDescription,
                            color: e.target.value,
                          })
                        }
                        className="w-7 h-7 bg-transparent border-0 cursor-pointer p-0"
                      />
                      <input
                        type="text"
                        value={styleHeaderDescription.color}
                        onChange={(e) =>
                          setStyleHeaderDescription({
                            ...styleHeaderDescription,
                            color: e.target.value,
                          })
                        }
                        className="flex-1 bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Header Sub Description Style */}
              <div>
                <p className="text-[10px] text-slate-500 mb-2">
                  Mô tả chi tiết (Sub Description)
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">
                      Font
                    </label>
                    <FontPickerComponent
                      value={styleHeaderSubDescription.font}
                      onChange={(font) =>
                        setStyleHeaderSubDescription({
                          ...styleHeaderSubDescription,
                          font,
                        })
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
                      value={styleHeaderSubDescription.size}
                      onChange={(e) =>
                        setStyleHeaderSubDescription({
                          ...styleHeaderSubDescription,
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
                      value={styleHeaderSubDescription.weight}
                      onChange={(e) =>
                        setStyleHeaderSubDescription({
                          ...styleHeaderSubDescription,
                          weight: e.target.value,
                        })
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
                        value={styleHeaderSubDescription.color}
                        onChange={(e) =>
                          setStyleHeaderSubDescription({
                            ...styleHeaderSubDescription,
                            color: e.target.value,
                          })
                        }
                        className="w-7 h-7 bg-transparent border-0 cursor-pointer p-0"
                      />
                      <input
                        type="text"
                        value={styleHeaderSubDescription.color}
                        onChange={(e) =>
                          setStyleHeaderSubDescription({
                            ...styleHeaderSubDescription,
                            color: e.target.value,
                          })
                        }
                        className="flex-1 bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
