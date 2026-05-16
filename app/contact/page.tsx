"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

export default function ContactPage() {
  const { t } = useLanguage()
  const initialFormData = {
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  };

  const [formData, setFormData] = useState(initialFormData);

  const [clicked, setClicked] = useState(false);

  const isFormValid =
    formData.name.trim() &&
    formData.email.trim() &&
    formData.phone.trim() &&
    formData.company.trim();

  const dropdownRef = useRef<HTMLDivElement | null>(null);

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
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const services = [
    t.service1,
    t.service2,
    t.service3,
    t.service4
  ];

  const [selected, setSelected] = useState("");
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen px-4 pt-28 md:pt-40">
      <div className="max-w-3xl mb-10 px-2">
        <p className="max-w-auto leading-snug font-bold text-[22px] sm:text-[26px] md:text-[32px] px-2">
          {t.contact1}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-14 md:gap-20 mt-10">
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-2">
            <div>
              <input
                type="text"
                placeholder={t.fullname}
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
                placeholder="Email*"
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
                placeholder={t.phone}
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
                placeholder={t.company}
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
              className="w-full border border-gray-300 focus:border-gray-900 rounded-md px-2 py-2 text-left text-[14px] md:text-[18px] text-gray-600 bg-white"
            >
              {selected || t.queston}

              <ChevronDown
                size={20}
                className={`absolute right-3 top-1/2 -translate-y-1/2 transition-transform duration-300
                ${open ? "rotate-180" : "rotate-0"}
                `}
              />
            </button>
            {open && (
              <div className="absolute left-0 mt-1 w-full rounded bg-[#ebebeb] overflow-hidden z-50 py-2">

                {services.map((service, index) => (
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
            <label className="text-sm text-gray-500">{t.contact2}</label>

            <textarea
              placeholder={t.message}
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
                new CustomEvent("cursor-change", { detail: "userdefault" })
              )
            }
            onMouseLeave={() =>
              window.dispatchEvent(
                new CustomEvent("cursor-change", { detail: "default" })
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
            {clicked ? t.thankyou : t.getintouch}
          </button>

        </div>
        <div className="flex flex-col items-start md:items-end gap-1 mt-0 md:-mt-43 md:-pt-43">

          <img 
            src="/avt_bhq.png"
            className="w-full sm:w-[440px] h-[400px] sm:h-[540px] object-cover"
          />

          <div className="w-full sm:w-[440px] text-sm flex flex-col">
            <a
              href="mailto:buihaitrong.dev@gmail.com"
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
              ></span>

              <span className="relative z-10 block">
                <span className="block group-hover:hidden text-black">
                  Email
                </span>
                <span className="hidden group-hover:block text-white break-all">
                  hello@habcreative.com
                </span>
              </span>
            </a>
            <a
              href="tel:+84973112480"
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
              ></span>

              <span className="relative z-10 block">
                <span className="block group-hover:hidden text-black">
                  {t.phone}
                </span>
                <span className="hidden group-hover:block text-white">
                  +84 92 5555 958
                </span>
              </span>
            </a>

            <a
              href="https://www.google.com/maps/search/?api=1&query=Ho+Chi+Minh+City"
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
              ></span>

              <span className="relative z-10 block">
                <span className="block group-hover:hidden text-black">
                  {t.based}
                </span>
                <span className="hidden group-hover:block text-white">
                  Ho Chi Minh City, Vietnam
                </span>
              </span>
            </a>
          </div>
        </div>
      </div>

      <h1
        className="text-4xl sm:text-5xl md:text-7xl font-light leading-tight
tracking-[-0.03em] bg-gradient-to-r from-[#8b6b2f]
via-[#f3deb0] to-[#8b6b2f] bg-[length:200%_100%] bg-clip-text
text-transparent animate-shimmer mt-14"
      >
        {/* BÙI HẢI TRỌNG <br />
BACKEND DEVELOPER <br />
TRƯỜNG ĐẠI HỌC NGUYỄN TẤT THÀNH  */}
      </h1>

    </div>
  );
}