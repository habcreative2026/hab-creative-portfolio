const mongoose = require("mongoose");

const MultiLangSchema = new mongoose.Schema(
  {
    vi: { type: String, default: "" },
    en: { type: String, default: "" },
    de: { type: String, default: "" },
  },
  { _id: false },
);

const ContactInfoSchema = new mongoose.Schema(
  {
    email: {
      label: {
        type: MultiLangSchema,
        default: () => ({ vi: "Email", en: "Email", de: "Email" }),
      },
      value: { type: String, default: "hello@habcreative.com" },
    },
    phone: {
      label: {
        type: MultiLangSchema,
        default: () => ({ vi: "Điện thoại", en: "Phone", de: "Telefon" }),
      },
      value: { type: String, default: "+84 92 5555 958" },
    },
    address: {
      label: {
        type: MultiLangSchema,
        default: () => ({ vi: "Địa chỉ", en: "Based", de: "Basiert" }),
      },
      value: { type: String, default: "Ho Chi Minh City, Vietnam" },
    },
    header_text: {
      type: MultiLangSchema,
      default: () => ({
        vi: "Hãy liên hệ với tôi!",
        en: "Get in touch with me!",
        de: "Nehmen Sie Kontakt mit mir auf!",
      }),
    },
    services: {
      type: [MultiLangSchema],
      default: () => [
        { vi: "Thiết kế Website", en: "Website Design", de: "Webdesign" },
        { vi: "Thiết kế UI/UX", en: "UI/UX Design", de: "UI/UX Design" },
        {
          vi: "Phát triển Fullstack",
          en: "Fullstack Development",
          de: "Fullstack-Entwicklung",
        },
        {
          vi: "Tư vấn chiến lược",
          en: "Strategy Consulting",
          de: "Strategieberatung",
        },
      ],
    },
    button_get_in_touch: {
      type: MultiLangSchema,
      default: () => ({
        vi: "Liên hệ",
        en: "Contact",
        de: "Kontakt",
      }),
    },
    button_thank_you: {
      type: MultiLangSchema,
      default: () => ({
        vi: "Cảm ơn bạn!",
        en: "Thank You!",
        de: "Danke!",
      }),
    },
    placeholder_fullname: {
      type: MultiLangSchema,
      default: () => ({
        vi: "Họ và tên*",
        en: "Full Name*",
        de: "Vollständiger Name*",
      }),
    },
    placeholder_email: {
      type: MultiLangSchema,
      default: () => ({
        vi: "Email*",
        en: "Email*",
        de: "E-Mail*",
      }),
    },
    placeholder_phone: {
      type: MultiLangSchema,
      default: () => ({
        vi: "Số điện thoại",
        en: "Phone Number",
        de: "Telefonnummer",
      }),
    },
    placeholder_company: {
      type: MultiLangSchema,
      default: () => ({
        vi: "Công ty",
        en: "Company",
        de: "Firma",
      }),
    },
    placeholder_service: {
      type: MultiLangSchema,
      default: () => ({
        vi: "Bạn cần tư vấn về dịch vụ nào?",
        en: "What service are you interested in?",
        de: "An welchem Service sind Sie interessiert?",
      }),
    },
    placeholder_project_detail: {
      type: MultiLangSchema,
      default: () => ({
        vi: "Chi tiết dự án",
        en: "Project Details",
        de: "Projektdetails",
      }),
    },
    placeholder_message: {
      type: MultiLangSchema,
      default: () => ({
        vi: "Tin nhắn",
        en: "Message",
        de: "Nachricht",
      }),
    },

    avatar_url: {
      type: String,
      default: "/avt_bhq.png",
    },
    style_header: {
      font: { type: String, default: "Inter" },
      size: { type: Number, default: 32 },
      weight: { type: String, default: "700" },
      color: { type: String, default: "#111111" },
      align: {
        type: String,
        enum: ["left", "center", "right"],
        default: "left",
      },
    },
    maps_url: {
      type: String,
      default:
        "https://www.google.com/maps/search/?api=1&query=Ho+Chi+Minh+City",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Contact", ContactInfoSchema);
