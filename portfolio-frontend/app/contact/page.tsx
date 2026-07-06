"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

interface ContactData {
  header_text?: { vi: string; en: string; de: string };
  email?: { label: { vi: string; en: string; de: string }; value: string };
  phone?: { label: { vi: string; en: string; de: string }; value: string };
  address?: { label: { vi: string; en: string; de: string }; value: string };
  services?: Array<{ vi: string; en: string; de: string }>;
  avatar_url?: string;
  maps_url?: string;
  style_header?: {
    font: string;
    size: number;
    weight: string;
    color: string;
    align: string;
  };
  placeholder_fullname?: { vi: string; en: string; de: string };
  placeholder_email?: { vi: string; en: string; de: string };
  placeholder_phone?: { vi: string; en: string; de: string };
  placeholder_company?: { vi: string; en: string; de: string };
  placeholder_service?: { vi: string; en: string; de: string };
  placeholder_project_detail?: { vi: string; en: string; de: string };
  placeholder_message?: { vi: string; en: string; de: string };
  button_get_in_touch?: { vi: string; en: string; de: string };
  button_thank_you?: { vi: string; en: string; de: string };
}

export default function ContactPage() {
  const { lang } = useLanguage();
  const [contactData, setContactData] = useState<ContactData | null>(null);
  const [loading, setLoading] = useState(true);

  const initialFormData = {
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [clicked, setClicked] = useState(false);
  const [selected, setSelected] = useState("");
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setContactData(data.data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const isFormValid =
    formData.name.trim() &&
    formData.email.trim() &&
    formData.phone.trim() &&
    formData.company.trim();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getText = (obj: any): string => {
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    return obj[lang] || obj.vi || obj.en || "";
  };

  const getServices = (): string[] => {
    if (contactData?.services && contactData.services.length > 0) {
      return contactData.services.map((s) => getText(s));
    }
    return [
      "Thiết kế Website",
      "Thiết kế UI/UX",
      "Phát triển Fullstack",
      "Tư vấn chiến lược",
    ];
  };

  const services = getServices();

  return (
    <div className="min-h-screen px-4 pt-28 md:pt-40">
      <div className="max-w-3xl mb-10 px-2">
        <p
          className="max-w-auto leading-snug font-bold text-[22px] sm:text-[26px] md:text-[32px] px-2"
          style={{
            fontFamily: contactData?.style_header?.font || "Inter",
            fontSize: contactData?.style_header?.size
              ? `${contactData.style_header.size}px`
              : "32px",
            fontWeight: contactData?.style_header?.weight || "700",
            color: contactData?.style_header?.color || "#111111",
            textAlign: (contactData?.style_header?.align as any) || "left",
          }}
        >
          {getText(contactData?.header_text) || "Hãy liên hệ với tôi!"}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-14 md:gap-20 mt-10">
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-2">
            <div>
              <input
                type="text"
                placeholder={
                  getText(contactData?.placeholder_fullname) || "Họ và tên*"
                }
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full border-b border-gray-300 focus:border-gray-500 outline-none py-0.5 text-[16px] px-2"
                required
              />
            </div>
            <div>
              <input
                type="email"
                placeholder={
                  getText(contactData?.placeholder_email) || "Email*"
                }
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full border-b border-gray-300 focus:border-gray-500 outline-none py-0.5 text-[16px] px-2"
                required
              />
            </div>
            <div>
              <input
                type="tel"
                placeholder={
                  getText(contactData?.placeholder_phone) || "Số điện thoại"
                }
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full border-b border-gray-300 focus:border-gray-500 outline-none py-0.5 text-[16px] px-2"
                required
              />
            </div>
            <div>
              <input
                type="text"
                placeholder={
                  getText(contactData?.placeholder_company) || "Công ty"
                }
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                className="w-full border-b border-gray-300 focus:border-gray-500 outline-none py-0.5 text-[16px] px-2"
                required
              />
            </div>
          </div>

          <div ref={dropdownRef} className="relative w-full px-2">
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="w-full border border-gray-300 focus:border-gray-900 rounded-md px-2 py-2 text-left text-[14px] md:text-[18px] text-gray-600 bg-white flex justify-between items-center"
            >
              <span>
                {selected ||
                  getText(contactData?.placeholder_service) ||
                  "Bạn cần tư vấn về dịch vụ nào?"}
              </span>
              <ChevronDown
                size={20}
                className={`transition-transform duration-300 ${open ? "rotate-180" : "rotate-0"}`}
              />
            </button>
            {open && (
              <div className="absolute left-0 mt-1 w-full rounded bg-[#ebebeb] overflow-hidden z-50 py-2">
                {services.map((service: string, index: number) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setSelected(service);
                      setOpen(false);
                    }}
                    className="w-full px-2 py-2 text-left transition-colors duration-300 group"
                  >
                    <span className="relative inline-block text-black">
                      {service}
                      <span
                        className="
                          absolute left-0 bottom-0 h-[2px] w-full bg-gray-500
                          scale-x-0 origin-right
                          transition-transform duration-300
                          group-hover:scale-x-100 group-hover:origin-left
                        "
                      />
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="px-4">
            <label className="text-sm text-gray-500">
              {getText(contactData?.placeholder_project_detail) ||
                "Chi tiết dự án"}
            </label>
            <textarea
              placeholder={
                getText(contactData?.placeholder_message) || "Tin nhắn"
              }
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              className="w-full border-b border-gray-300 focus:border-gray-500 outline-none py-2 text-[16px] h-30"
            />
          </div>

          <button
            onClick={() => {
              if (isFormValid) {
                setClicked(true);
                setFormData(initialFormData);
                setSelected("");
              }
            }}
            onMouseEnter={() =>
              window.dispatchEvent(
                new CustomEvent("cursor-change", { detail: "userdefault" }),
              )
            }
            onMouseLeave={() =>
              window.dispatchEvent(
                new CustomEvent("cursor-change", { detail: "default" }),
              )
            }
            className="
              bg-black text-white
              hover:bg-white hover:text-black
              rounded-full px-10 md:px-20 py-3 w-fit
              border border-black
              transition-all duration-300 cursor-none
              mx-2
            "
          >
            {clicked
              ? getText(contactData?.button_thank_you) || "Cảm ơn bạn!"
              : getText(contactData?.button_get_in_touch) || "Liên hệ"}
          </button>
        </div>

        <div className="flex flex-col items-start md:items-end gap-1 mt-0 md:-mt-43 md:-pt-43">
          <img
            src={contactData?.avatar_url || "/avt_bhq.png"}
            className="w-full sm:w-[440px] h-[400px] sm:h-[540px] object-cover"
            alt="Avatar"
          />

          <div className="w-full sm:w-[440px] text-sm flex flex-col">
            <a
              href={`mailto:${contactData?.email?.value || "hello@habcreative.com"}`}
              className="relative group border-b border-gray-400 pb-1 pt-1 cursor-pointer overflow-hidden block"
            >
              <span
                className="
                  absolute left-0 top-0 h-full w-full bg-black
                  scale-x-0 origin-right
                  transition-transform duration-300
                  group-hover:scale-x-100 group-hover:origin-left
                  z-0
                "
              />
              <span className="relative z-10 block">
                <span className="block group-hover:hidden text-black">
                  {getText(contactData?.email?.label) || "Email"}
                </span>
                <span className="hidden group-hover:block text-white break-all">
                  {contactData?.email?.value || "hello@habcreative.com"}
                </span>
              </span>
            </a>

            <a
              href={`tel:${contactData?.phone?.value || "+84973112480"}`}
              className="relative group border-b border-gray-400 pb-1 pt-1 cursor-pointer overflow-hidden block"
            >
              <span
                className="
                  absolute left-0 top-0 h-full w-full bg-black
                  scale-x-0 origin-right
                  transition-transform duration-300
                  group-hover:scale-x-100 group-hover:origin-left
                  z-0
                "
              />
              <span className="relative z-10 block">
                <span className="block group-hover:hidden text-black">
                  {getText(contactData?.phone?.label) || "Điện thoại"}
                </span>
                <span className="hidden group-hover:block text-white">
                  {contactData?.phone?.value || "+84 92 5555 958"}
                </span>
              </span>
            </a>

            <a
              href={
                contactData?.maps_url ||
                "https://www.google.com/maps/search/?api=1&query=Ho+Chi+Minh+City"
              }
              target="_blank"
              rel="noopener noreferrer"
              className="relative group border-b border-gray-400 pb-1 pt-1 cursor-pointer overflow-hidden block"
            >
              <span
                className="
                  absolute left-0 top-0 h-full w-full bg-black
                  scale-x-0 origin-right
                  transition-transform duration-300
                  group-hover:scale-x-100 group-hover:origin-left
                  z-0
                "
              />
              <span className="relative z-10 block">
                <span className="block group-hover:hidden text-black">
                  {getText(contactData?.address?.label) || "Địa chỉ"}
                </span>
                <span className="hidden group-hover:block text-white">
                  {contactData?.address?.value || "Ho Chi Minh City, Vietnam"}
                </span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
