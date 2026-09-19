"use client";

import { motion, Variants } from "framer-motion";
import { useLanguage } from "../i18n/LanguageContext";
import Link from "next/link";
import { useLinks } from "../context/LinkContext";
import { useTranslationStyle } from "../context/TextStyleContext";
import { useState } from "react";
import toast from "react-hot-toast";

export default function FooterPage() {
  const { t } = useLanguage();
  const { getLink } = useLinks();

  // 🆕 State cho subscribe
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [thankYou, setThankYou] = useState(false);

  const styleV7 = useTranslationStyle("v7");
  const styleSb = useTranslationStyle("sb");
  const styleV8 = useTranslationStyle("v8");
  const styleNavmxh0 = useTranslationStyle("navmxh0");
  const styleNavmxh00 = useTranslationStyle("navmxh00");
  const styleNavmxh01 = useTranslationStyle("navmxh01");
  const styleNavmxh02 = useTranslationStyle("navmxh02");
  const styleV9 = useTranslationStyle("v9");
  const styleV10 = useTranslationStyle("v10");

  const container: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const socialContainer: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.25,
        delayChildren: 0.2,
      },
    },
  };

  const socialItem: Variants = {
    hidden: { opacity: 0, y: 25 },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  // 🆕 Hàm xử lý Subscribe
  const handleSubscribe = async () => {
    // Check rỗng
    if (!email.trim()) {
      toast.error("Vui lòng nhập email!");
      return;
    }

    // Check phải là @gmail.com
    const gmailRegex = /^[^\s@]+@gmail\.com$/i;
    if (!gmailRegex.test(email.trim())) {
      toast.error("Vui lòng nhập đúng địa chỉ Gmail (@gmail.com)!");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/subscribers/subscribe`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim().toLowerCase() }),
        },
      );
      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "Đăng ký thành công!");
        setThankYou(true);
        setEmail("");
        // Reset sau 3s về lại "Subscribe"
        setTimeout(() => setThankYou(false), 3000);
      } else {
        toast.error(data.message || "Đăng ký thất bại!");
      }
    } catch (error) {
      console.error("Subscribe error:", error);
      toast.error("Đã xảy ra lỗi khi đăng ký!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.footer
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      variants={container}
      className="text-black pt-16 pb-4 px-8 md:px-8 lg:px-8"
    >
      <motion.div variants={item} className="border-t border-gray-300 mb-10" />

      <motion.div
        variants={container}
        className="grid grid-cols-1 md:grid-cols-3 items-start gap-10 md:gap-6 lg:gap-0"
      >
        {/* LEFT */}
        <motion.div variants={item} className="text-center md:text-left w-full">
          <p className="text-xs text-gray-600 mb-6" style={styleV7}>
            {t("v7")}
          </p>

          <div className="mb-4 flex justify-center md:justify-start">
            <input
              placeholder="Email *"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubscribe();
              }}
              disabled={submitting}
              className="
                w-full
                max-w-[300px]
                border-b
                border-gray-300
                bg-transparent
                outline-none
                pb-2
                focus:border-gray-500
                disabled:opacity-50
              "
            />
          </div>

          <button
            onClick={handleSubscribe}
            disabled={submitting}
            onMouseEnter={() =>
              window.dispatchEvent(
                new CustomEvent("cursor-change", {
                  detail: "userdefault",
                }),
              )
            }
            onMouseLeave={() =>
              window.dispatchEvent(
                new CustomEvent("cursor-change", {
                  detail: "default",
                }),
              )
            }
            className="
              mt-2
              bg-black
              text-white
              w-full
              max-w-[300px]
              py-4
              rounded-full
              text-sm
              cursor-none
              transition-all
              duration-300
              hover:bg-white
              hover:text-black
              hover:border-black
              border
              border-black
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            <span style={styleSb}>
              {submitting ? "..." : thankYou ? "Thank You!" : t("sb")}
            </span>
          </button>
        </motion.div>

        {/* Phần còn lại giữ nguyên */}
        <motion.div
          variants={item}
          className="flex flex-col items-center md:items-start mt-8 md:mt-0 ml-0 pl-0 md:ml-10 md:pl-10 lg:ml-28 lg:pl-28"
        >
          <p className="text-xs text-gray-600 mb-2" style={styleV8}>
            {t("v8")}
          </p>

          <motion.div
            variants={socialContainer}
            className="
              text-[22px]
              sm:text-[24px]
              md:text-[28px]
              font-bold
              text-center md:text-left
              group
              w-full
              leading-tight
            "
          >
            <Link href={getLink("footer_email").url}>
              <motion.p
                variants={socialItem}
                onMouseEnter={() =>
                  window.dispatchEvent(
                    new CustomEvent("cursor-change", { detail: "social" }),
                  )
                }
                onMouseLeave={() =>
                  window.dispatchEvent(
                    new CustomEvent("cursor-change", { detail: "default" }),
                  )
                }
                className="
                  cursor-none transition-all duration-300
                  group-hover:text-gray-300 hover:!text-black
                  text-center md:text-left break-words
                "
                style={styleNavmxh0}
              >
                {t("navmxh0")}
              </motion.p>
            </Link>

            <Link href={getLink("nav_link_00").url}>
              <motion.p
                variants={socialItem}
                onMouseEnter={() =>
                  window.dispatchEvent(
                    new CustomEvent("cursor-change", { detail: "social" }),
                  )
                }
                onMouseLeave={() =>
                  window.dispatchEvent(
                    new CustomEvent("cursor-change", { detail: "default" }),
                  )
                }
                className="
                  cursor-none transition-all duration-300
                  group-hover:text-gray-300 hover:!text-black
                  text-center md:text-left break-words
                "
                style={styleNavmxh00}
              >
                {t("navmxh00")}
              </motion.p>
            </Link>

            <Link href={getLink("nav_link_02").url}>
              <motion.p
                variants={socialItem}
                onMouseEnter={() =>
                  window.dispatchEvent(
                    new CustomEvent("cursor-change", { detail: "social" }),
                  )
                }
                onMouseLeave={() =>
                  window.dispatchEvent(
                    new CustomEvent("cursor-change", { detail: "default" }),
                  )
                }
                className="
                  cursor-none transition-all duration-300
                  group-hover:text-gray-300 hover:!text-black
                  text-center md:text-left break-words
                "
                style={styleNavmxh01}
              >
                {t("navmxh01")}
              </motion.p>
            </Link>

            <Link href={getLink("nav_link_01").url}>
              <motion.p
                variants={socialItem}
                onMouseEnter={() =>
                  window.dispatchEvent(
                    new CustomEvent("cursor-change", { detail: "social" }),
                  )
                }
                onMouseLeave={() =>
                  window.dispatchEvent(
                    new CustomEvent("cursor-change", { detail: "default" }),
                  )
                }
                className="
                  cursor-none transition-all duration-300
                  group-hover:text-gray-300 hover:!text-black
                  text-center md:text-left break-words
                "
                style={styleNavmxh02}
              >
                {t("navmxh02")}
              </motion.p>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          variants={item}
          className="flex justify-center md:justify-end mt-8 md:mt-0 w-full"
        >
          <button
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
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
            className="
              text-xs cursor-none hover:text-gray-300
              transition-colors duration-300
            "
          >
            <span style={styleV9}>{t("v9")}</span>
          </button>
        </motion.div>
      </motion.div>

      <motion.div
        variants={container}
        className="
          mt-20 pt-6 flex flex-col md:flex-row
          justify-between items-center md:items-end
          gap-6 md:gap-0 text-xs font-medium
        "
      >
        <motion.div variants={item} className="text-center md:text-left">
          <p className="cursor-pointer hover:text-gray-300" style={styleV10}>
            {t("v10")}
          </p>
        </motion.div>

        <motion.div variants={item} className="text-center md:text-right">
          <p className="cursor-pointer hover:text-gray-300">
            ©2025 HAB Creative.
          </p>
        </motion.div>
      </motion.div>
    </motion.footer>
  );
}
