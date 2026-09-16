const mongoose = require("mongoose");

const MultiLangSchema = new mongoose.Schema(
  {
    vi: { type: String, default: "" },
    en: { type: String, default: "" },
    de: { type: String, default: "" },
  },
  { _id: false },
);

const CompanySchema = new mongoose.Schema(
  {
    vi: { type: String, default: "" },
    en: { type: String, default: "" },
    de: { type: String, default: "" },
  },
  { _id: false },
);

const YearSchema = new mongoose.Schema(
  {
    vi: { type: String, default: "" },
    en: { type: String, default: "" },
    de: { type: String, default: "" },
  },
  { _id: false },
);

const AboutSchema = new mongoose.Schema(
  {
    label_position: {
      type: MultiLangSchema,
      default: () => ({ vi: "Vị trí", en: "Position", de: "Position" }),
    },
    label_type: {
      type: MultiLangSchema,
      default: () => ({ vi: "Loại hình", en: "Type", de: "Art" }),
    },
    label_company: {
      type: MultiLangSchema,
      default: () => ({ vi: "Công ty", en: "Company", de: "Firma" }),
    },
    label_year: {
      type: MultiLangSchema,
      default: () => ({ vi: "Thời gian", en: "Year", de: "Jahr" }),
    },
    label_title: {
      type: MultiLangSchema,
      default: () => ({ vi: "Tiêu đề", en: "Title", de: "Titel" }),
    },
    label_description: {
      type: MultiLangSchema,
      default: () => ({ vi: "Mô tả", en: "Description", de: "Beschreibung" }),
    },
    label_achievement_year: {
      type: MultiLangSchema,
      default: () => ({ vi: "Thời gian", en: "Year", de: "Jahr" }),
    },
    // Header
    header_name: {
      type: MultiLangSchema,
      default: () => ({
        vi: "QUI BUI",
        en: "QUI BUI",
        de: "QUI BUI",
      }),
    },
    header_description: {
      type: MultiLangSchema,
      default: () => ({
        vi: "Về tôi",
        en: "About",
        de: "Über mich",
      }),
    },
    header_sub_description: {
      type: MultiLangSchema,
      default: () => ({
        vi: "Tôi là một nhà thiết kế và phát triển web sáng tạo, đam mê tạo ra những trải nghiệm kỹ thuật số độc đáo.",
        en: "I am a creative web designer and developer, passionate about creating unique digital experiences.",
        de: "Ich bin ein kreativer Webdesigner und -entwickler, leidenschaftlich daran interessiert, einzigartige digitale Erlebnisse zu schaffen.",
      }),
    },
    header_year_text: {
      type: MultiLangSchema,
      default: () => ({
        vi: "hiện tại",
        en: "present",
        de: "heute",
      }),
    },
    header_image: {
      type: String,
      default: "/bhq.jpg",
    },

    style_header_name: {
      font: { type: String, default: "Inter" },
      size: { type: Number, default: 160 },
      weight: { type: String, default: "700" },
      color: { type: String, default: "#111111" },
    },
    style_header_description: {
      font: { type: String, default: "Inter" },
      size: { type: Number, default: 24 },
      weight: { type: String, default: "400" },
      color: { type: String, default: "#9ca3af" },
    },
    style_header_sub_description: {
      font: { type: String, default: "Inter" },
      size: { type: Number, default: 24 },
      weight: { type: String, default: "600" },
      color: { type: String, default: "#111111" },
    },

    experience_title: {
      type: MultiLangSchema,
      default: () => ({
        vi: "Kinh nghiệm làm việc",
        en: "Work Experience",
        de: "Berufserfahrung",
      }),
    },
    experiences: {
      type: [
        {
          position: {
            type: MultiLangSchema,
            default: () => ({ vi: "", en: "", de: "" }),
          },
          type: {
            type: MultiLangSchema,
            default: () => ({ vi: "", en: "", de: "" }),
          },
          company: {
            type: mongoose.Schema.Types.Mixed,
            default: () => ({ vi: "", en: "", de: "" }),
          },
          year: {
            type: mongoose.Schema.Types.Mixed,
            default: () => ({ vi: "", en: "", de: "" }),
          },
        },
      ],
      default: () => [
        {
          position: {
            vi: "Web Designer",
            en: "Web Designer",
            de: "Webdesigner",
          },
          type: { vi: "Toàn thời gian", en: "Full-time", de: "Vollzeit" },
          company: {
            vi: "HAB Creative",
            en: "HAB Creative",
            de: "HAB Creative",
          },
          year: {
            vi: "2025 — hiện tại",
            en: "2025 — present",
            de: "2025 — heute",
          },
        },
        {
          position: {
            vi: "Web Designer",
            en: "Web Designer",
            de: "Webdesigner",
          },
          type: { vi: "Toàn thời gian", en: "Full-time", de: "Vollzeit" },
          company: {
            vi: "Dong Tay Land",
            en: "Dong Tay Land",
            de: "Dong Tay Land",
          },
          year: { vi: "2021 — 2024", en: "2021 — 2024", de: "2021 — 2024" },
        },
        {
          position: {
            vi: "Web Designer",
            en: "Web Designer",
            de: "Webdesigner",
          },
          type: { vi: "Toàn thời gian", en: "Full-time", de: "Vollzeit" },
          company: {
            vi: "Alpha Creative",
            en: "Alpha Creative",
            de: "Alpha Creative",
          },
          year: { vi: "2019 — 2021", en: "2019 — 2021", de: "2019 — 2021" },
        },
      ],
    },

    achievement_title: {
      type: MultiLangSchema,
      default: () => ({
        vi: "Thành tựu",
        en: "Achievements",
        de: "Errungenschaften",
      }),
    },
    achievements: {
      type: [
        {
          title: {
            type: MultiLangSchema,
            default: () => ({ vi: "", en: "", de: "" }),
          },
          description: {
            type: MultiLangSchema,
            default: () => ({ vi: "", en: "", de: "" }),
          },
          year: {
            type: mongoose.Schema.Types.Mixed,
            default: () => ({ vi: "", en: "", de: "" }),
          },
        },
      ],
      default: () => [
        {
          title: {
            vi: "Giải thưởng Thiết kế xuất sắc",
            en: "Best Design Award",
            de: "Beste Design Auszeichnung",
          },
          description: {
            vi: "Giải thưởng thiết kế xuất sắc nhất",
            en: "Excellence in design",
            de: "Ausgezeichnetes Design",
          },
          year: { vi: "5/2018", en: "5/2018", de: "5/2018" },
        },
        {
          title: {
            vi: "Giải thưởng Đổi mới sáng tạo",
            en: "Innovation Award",
            de: "Innovationspreis",
          },
          description: {
            vi: "Giải thưởng đổi mới sáng tạo",
            en: "Creative innovation",
            de: "Kreative Innovation",
          },
          year: { vi: "3/2018", en: "3/2018", de: "3/2018" },
        },
      ],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("About", AboutSchema);

// const mongoose = require("mongoose");

// const MultiLangSchema = new mongoose.Schema(
//   {
//     vi: { type: String, default: "" },
//     en: { type: String, default: "" },
//     de: { type: String, default: "" },
//   },
//   { _id: false },
// );

// // 🆕 Style schema dùng chung
// const TextStyleSchema = new mongoose.Schema(
//   {
//     font: { type: String, default: "Inter" },
//     size: { type: Number, default: 0 }, // 0 = kế thừa
//     weight: { type: String, default: "400" },
//     letterSpacing: { type: Number, default: 0 }, // em
//     color: { type: String, default: "" }, // empty = kế thừa
//   },
//   { _id: false },
// );

// const AboutSchema = new mongoose.Schema(
//   {
//     label_position: {
//       type: MultiLangSchema,
//       default: () => ({ vi: "Vị trí", en: "Position", de: "Position" }),
//     },
//     label_type: {
//       type: MultiLangSchema,
//       default: () => ({ vi: "Loại hình", en: "Type", de: "Art" }),
//     },
//     label_company: {
//       type: MultiLangSchema,
//       default: () => ({ vi: "Công ty", en: "Company", de: "Firma" }),
//     },
//     label_year: {
//       type: MultiLangSchema,
//       default: () => ({ vi: "Thời gian", en: "Year", de: "Jahr" }),
//     },
//     label_title: {
//       type: MultiLangSchema,
//       default: () => ({ vi: "Tiêu đề", en: "Title", de: "Titel" }),
//     },
//     label_description: {
//       type: MultiLangSchema,
//       default: () => ({ vi: "Mô tả", en: "Description", de: "Beschreibung" }),
//     },
//     label_achievement_year: {
//       type: MultiLangSchema,
//       default: () => ({ vi: "Thời gian", en: "Year", de: "Jahr" }),
//     },

//     // Header
//     header_name: {
//       type: MultiLangSchema,
//       default: () => ({ vi: "QUI BUI", en: "QUI BUI", de: "QUI BUI" }),
//     },
//     header_description: {
//       type: MultiLangSchema,
//       default: () => ({ vi: "Về tôi", en: "About", de: "Über mich" }),
//     },
//     header_sub_description: {
//       type: MultiLangSchema,
//       default: () => ({
//         vi: "Tôi là một nhà thiết kế và phát triển web sáng tạo, đam mê tạo ra những trải nghiệm kỹ thuật số độc đáo.",
//         en: "I am a creative web designer and developer, passionate about creating unique digital experiences.",
//         de: "Ich bin ein kreativer Webdesigner und -entwickler, leidenschaftlich daran interessiert, einzigartige digitale Erlebnisse zu schaffen.",
//       }),
//     },
//     header_year_text: {
//       type: MultiLangSchema,
//       default: () => ({ vi: "hiện tại", en: "present", de: "heute" }),
//     },
//     header_image: {
//       type: String,
//       default: "/bhq.jpg",
//     },

//     // 🆕 STYLES — 3 cái cũ giữ nguyên + thêm mới
//     style_header_name: {
//       type: TextStyleSchema,
//       default: () => ({
//         font: "Inter",
//         size: 160,
//         weight: "700",
//         letterSpacing: 0,
//         color: "#111111",
//       }),
//     },
//     style_header_description: {
//       type: TextStyleSchema,
//       default: () => ({
//         font: "Inter",
//         size: 24,
//         weight: "400",
//         letterSpacing: 0,
//         color: "#9ca3af",
//       }),
//     },
//     style_header_sub_description: {
//       type: TextStyleSchema,
//       default: () => ({
//         font: "Inter",
//         size: 24,
//         weight: "600",
//         letterSpacing: 0,
//         color: "#111111",
//       }),
//     },
//     style_header_year_text: {
//       type: TextStyleSchema,
//       default: () => ({
//         font: "Inter",
//         size: 24,
//         weight: "400",
//         letterSpacing: 0,
//         color: "#FFFFFF",
//       }),
//     },
//     style_experience_title: {
//       type: TextStyleSchema,
//       default: () => ({
//         font: "Inter",
//         size: 48,
//         weight: "600",
//         letterSpacing: 0,
//         color: "#111111",
//       }),
//     },
//     style_achievement_title: {
//       type: TextStyleSchema,
//       default: () => ({
//         font: "Inter",
//         size: 48,
//         weight: "600",
//         letterSpacing: 0,
//         color: "#111111",
//       }),
//     },

//     // Label styles
//     style_label_position: {
//       type: TextStyleSchema,
//       default: () => ({
//         font: "Inter",
//         size: 12,
//         weight: "600",
//         letterSpacing: 0,
//         color: "#9ca3af",
//       }),
//     },
//     style_label_type: {
//       type: TextStyleSchema,
//       default: () => ({
//         font: "Inter",
//         size: 12,
//         weight: "600",
//         letterSpacing: 0,
//         color: "#9ca3af",
//       }),
//     },
//     style_label_company: {
//       type: TextStyleSchema,
//       default: () => ({
//         font: "Inter",
//         size: 12,
//         weight: "600",
//         letterSpacing: 0,
//         color: "#9ca3af",
//       }),
//     },
//     style_label_year: {
//       type: TextStyleSchema,
//       default: () => ({
//         font: "Inter",
//         size: 12,
//         weight: "600",
//         letterSpacing: 0,
//         color: "#9ca3af",
//       }),
//     },
//     style_label_title: {
//       type: TextStyleSchema,
//       default: () => ({
//         font: "Inter",
//         size: 12,
//         weight: "600",
//         letterSpacing: 0,
//         color: "#9ca3af",
//       }),
//     },
//     style_label_description: {
//       type: TextStyleSchema,
//       default: () => ({
//         font: "Inter",
//         size: 12,
//         weight: "600",
//         letterSpacing: 0,
//         color: "#9ca3af",
//       }),
//     },
//     style_label_achievement_year: {
//       type: TextStyleSchema,
//       default: () => ({
//         font: "Inter",
//         size: 12,
//         weight: "600",
//         letterSpacing: 0,
//         color: "#9ca3af",
//       }),
//     },

//     experience_title: {
//       type: MultiLangSchema,
//       default: () => ({
//         vi: "Kinh nghiệm làm việc",
//         en: "Work Experience",
//         de: "Berufserfahrung",
//       }),
//     },
//     experiences: {
//       type: [
//         {
//           position: {
//             type: MultiLangSchema,
//             default: () => ({ vi: "", en: "", de: "" }),
//           },
//           type: {
//             type: MultiLangSchema,
//             default: () => ({ vi: "", en: "", de: "" }),
//           },
//           company: {
//             type: mongoose.Schema.Types.Mixed,
//             default: () => ({ vi: "", en: "", de: "" }),
//           },
//           year: {
//             type: mongoose.Schema.Types.Mixed,
//             default: () => ({ vi: "", en: "", de: "" }),
//           },
//         },
//       ],
//       default: () => [
//         {
//           position: {
//             vi: "Web Designer",
//             en: "Web Designer",
//             de: "Webdesigner",
//           },
//           type: { vi: "Toàn thời gian", en: "Full-time", de: "Vollzeit" },
//           company: {
//             vi: "HAB Creative",
//             en: "HAB Creative",
//             de: "HAB Creative",
//           },
//           year: {
//             vi: "2025 — hiện tại",
//             en: "2025 — present",
//             de: "2025 — heute",
//           },
//         },
//         {
//           position: {
//             vi: "Web Designer",
//             en: "Web Designer",
//             de: "Webdesigner",
//           },
//           type: { vi: "Toàn thời gian", en: "Full-time", de: "Vollzeit" },
//           company: {
//             vi: "Dong Tay Land",
//             en: "Dong Tay Land",
//             de: "Dong Tay Land",
//           },
//           year: { vi: "2021 — 2024", en: "2021 — 2024", de: "2021 — 2024" },
//         },
//         {
//           position: {
//             vi: "Web Designer",
//             en: "Web Designer",
//             de: "Webdesigner",
//           },
//           type: { vi: "Toàn thời gian", en: "Full-time", de: "Vollzeit" },
//           company: {
//             vi: "Alpha Creative",
//             en: "Alpha Creative",
//             de: "Alpha Creative",
//           },
//           year: { vi: "2019 — 2021", en: "2019 — 2021", de: "2019 — 2021" },
//         },
//       ],
//     },

//     achievement_title: {
//       type: MultiLangSchema,
//       default: () => ({
//         vi: "Thành tựu",
//         en: "Achievements",
//         de: "Errungenschaften",
//       }),
//     },
//     achievements: {
//       type: [
//         {
//           title: {
//             type: MultiLangSchema,
//             default: () => ({ vi: "", en: "", de: "" }),
//           },
//           description: {
//             type: MultiLangSchema,
//             default: () => ({ vi: "", en: "", de: "" }),
//           },
//           year: {
//             type: mongoose.Schema.Types.Mixed,
//             default: () => ({ vi: "", en: "", de: "" }),
//           },
//         },
//       ],
//       default: () => [
//         {
//           title: {
//             vi: "Giải thưởng Thiết kế xuất sắc",
//             en: "Best Design Award",
//             de: "Beste Design Auszeichnung",
//           },
//           description: {
//             vi: "Giải thưởng thiết kế xuất sắc nhất",
//             en: "Excellence in design",
//             de: "Ausgezeichnetes Design",
//           },
//           year: { vi: "5/2018", en: "5/2018", de: "5/2018" },
//         },
//         {
//           title: {
//             vi: "Giải thưởng Đổi mới sáng tạo",
//             en: "Innovation Award",
//             de: "Innovationspreis",
//           },
//           description: {
//             vi: "Giải thưởng đổi mới sáng tạo",
//             en: "Creative innovation",
//             de: "Kreative Innovation",
//           },
//           year: { vi: "3/2018", en: "3/2018", de: "3/2018" },
//         },
//       ],
//     },
//   },
//   { timestamps: true },
// );

// module.exports = mongoose.model("About", AboutSchema);
