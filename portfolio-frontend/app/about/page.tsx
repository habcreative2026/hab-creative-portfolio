"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useLanguage } from "../i18n/LanguageContext";
import { useEffect, useState } from "react";

interface AboutData {
  header_name?: { vi: string; en: string; de: string };
  header_description?: { vi: string; en: string; de: string };
  header_sub_description?: { vi: string; en: string; de: string };
  header_year_text?: { vi: string; en: string; de: string };
  header_image?: string;
  style_header_name?: {
    font: string;
    size: number;
    weight: string;
    color: string;
  };
  style_header_description?: {
    font: string;
    size: number;
    weight: string;
    color: string;
  };
  style_header_sub_description?: {
    font: string;
    size: number;
    weight: string;
    color: string;
  };
  experience_title?: { vi: string; en: string; de: string };
  experiences?: Array<{
    position: { vi: string; en: string; de: string };
    type: { vi: string; en: string; de: string };
    company: { vi: string; en: string; de: string };
    year: { vi: string; en: string; de: string };
  }>;
  achievement_title?: { vi: string; en: string; de: string };
  achievements?: Array<{
    title: { vi: string; en: string; de: string };
    description: { vi: string; en: string; de: string };
    year: { vi: string; en: string; de: string };
  }>;
  label_position?: { vi: string; en: string; de: string };
  label_type?: { vi: string; en: string; de: string };
  label_company?: { vi: string; en: string; de: string };
  label_year?: { vi: string; en: string; de: string };
  label_title?: { vi: string; en: string; de: string };
  label_description?: { vi: string; en: string; de: string };
  label_achievement_year?: { vi: string; en: string; de: string };
}

export default function AboutPage() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const { lang } = useLanguage();

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/about`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          console.log("About data:", data.data);
          setAboutData(data.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const { scrollY } = useScroll();

  const textYRaw = useTransform(scrollY, [0, 600], [0, -150]);
  const textY = useSpring(textYRaw, {
    stiffness: 70,
    damping: 20,
    mass: 0.7,
  });

  const titleYRaw = useTransform(scrollY, [0, 1000], [0, 250]);
  const titleY = useSpring(titleYRaw, {
    stiffness: 50,
    damping: 25,
    mass: 1,
  });

  const getText = (obj: any): string => {
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    return obj[lang] || obj.vi || obj.en || "";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-xs text-white">
        ...
      </div>
    );
  }

  const experiences = aboutData?.experiences || [];
  const achievements = aboutData?.achievements || [];

  const labels = {
    position: aboutData?.label_position || {
      vi: "Vị trí",
      en: "Position",
      de: "Position",
    },
    type: aboutData?.label_type || {
      vi: "Loại hình",
      en: "Type",
      de: "Art",
    },
    company: aboutData?.label_company || {
      vi: "Công ty",
      en: "Company",
      de: "Firma",
    },
    year: aboutData?.label_year || {
      vi: "Thời gian",
      en: "Year",
      de: "Jahr",
    },
    title: aboutData?.label_title || {
      vi: "Tiêu đề",
      en: "Title",
      de: "Titel",
    },
    description: aboutData?.label_description || {
      vi: "Mô tả",
      en: "Description",
      de: "Beschreibung",
    },
    achievementYear: aboutData?.label_achievement_year || {
      vi: "Thời gian",
      en: "Year",
      de: "Jahr",
    },
  };

  return (
    <div className="min-h-screen pt-24 md:pt-40">
      <section className="relative pt-10 md:pt-20">
        <div className="sticky top-0 min-h-screen md:h-screen grid grid-cols-1 md:grid-cols-2 items-start gap-10 md:gap-0">
          <div className="relative z-20 flex flex-col justify-between h-auto md:h-[450px] px-4 md:px-0">
            <motion.h1
              style={{ y: titleY }}
              className="font-bold tracking-tight leading-none text-[52px] sm:text-[80px] md:text-[160px]"
            >
              <div className="flex items-center flex-wrap">
                <span
                  style={{
                    fontFamily: aboutData?.style_header_name?.font || "Inter",
                    fontSize: aboutData?.style_header_name?.size
                      ? `${aboutData.style_header_name.size}px`
                      : "160px",
                    fontWeight: aboutData?.style_header_name?.weight || "700",
                    color: aboutData?.style_header_name?.color || "#111111",
                  }}
                >
                  {getText(aboutData?.header_name) || "QUI BUI"}
                </span>
              </div>
            </motion.h1>

            <motion.div
              style={{ y: textY }}
              className="max-w-full bg-white px-0 md:px-4 mt-6 md:mt-0"
            >
              <p
                className="text-xs text-gray-400"
                style={{
                  fontFamily:
                    aboutData?.style_header_description?.font || "Inter",
                  fontSize: aboutData?.style_header_description?.size
                    ? `${aboutData.style_header_description.size}px`
                    : "12px",
                  fontWeight:
                    aboutData?.style_header_description?.weight || "400",
                  color:
                    aboutData?.style_header_description?.color || "#9ca3af",
                }}
              >
                {getText(aboutData?.header_description) || "Về tôi"}
              </p>

              <p
                className="text-[16px] sm:text-[20px] md:text-[24px] leading-relaxed font-semibold mt-2 md:-mt-4"
                style={{
                  textIndent: isDesktop ? "100px" : "0px",
                  fontFamily:
                    aboutData?.style_header_sub_description?.font || "Inter",
                  fontSize: aboutData?.style_header_sub_description?.size
                    ? `${aboutData.style_header_sub_description.size}px`
                    : "24px",
                  fontWeight:
                    aboutData?.style_header_sub_description?.weight || "600",
                  color:
                    aboutData?.style_header_sub_description?.color || "#111111",
                }}
              >
                {getText(aboutData?.header_sub_description) ||
                  "Tôi là một nhà thiết kế và phát triển web sáng tạo..."}
              </p>
            </motion.div>
          </div>

          <div className="relative z-10 flex justify-end px-4 md:px-0">
            <img
              src={aboutData?.header_image || "/bhq.jpg"}
              className="w-full md:w-[680px] h-[280px] sm:h-[420px] md:h-[440px] object-cover"
              alt=""
            />

            <motion.div
              style={{ y: textY }}
              className="absolute bottom-4 right-8 md:right-4 z-30 mix-blend-difference text-white text-[16px] md:text-[24px] whitespace-nowrap"
            >
              {getText(aboutData?.header_year_text) || ""}
            </motion.div>
          </div>
        </div>
      </section>

      <div className="px-4 pt-2 mt-2 lg:-pt-24 lg:-mt-24">
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-[40%_20%_20%_20%] mb-6 md:mb-2">
            <h2 className="md:col-start-2 text-3xl md:text-5xl font-semibold mb-6 md:mb-14">
              {getText(aboutData?.experience_title) || "Kinh nghiệm làm việc"}
            </h2>
          </div>

          <div className="hidden md:grid grid-cols-[40%_20%_20%_20%] text-xs font-semibold text-gray-400 mb-2">
            <div>{getText(labels.position)}</div>
            <div>{getText(labels.type)}</div>
            <div>{getText(labels.company)}</div>
            <div>{getText(labels.year)}</div>
          </div>

          <div className="space-y-4 text-[18px] md:text-[24px] font-semibold">
            {experiences.map((exp, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-[40%_20%_20%_20%] border-t py-4 gap-2 md:gap-0"
              >
                <div>{getText(exp.position)}</div>
                <div className="text-sm md:text-[24px] text-gray-500 md:text-black">
                  {getText(exp.type)}
                </div>
                <div className="text-sm md:text-[24px] text-gray-500 md:text-black">
                  {getText(exp.company)}
                </div>
                <div className="text-sm md:text-[24px] text-gray-500 md:text-black">
                  {getText(exp.year)}
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="mt-14 pt-14"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl mb-10 md:mb-14 font-semibold">
            {getText(aboutData?.achievement_title) || "Thành tựu"}
          </h2>

          <div className="hidden md:grid grid-cols-[30%_50%_10%] text-xs font-semibold text-gray-400 mb-2">
            <div>{getText(labels.title)}</div>
            <div>{getText(labels.description)}</div>
            <div>{getText(labels.achievementYear)}</div>
          </div>

          <div className="space-y-4 text-[18px] md:text-[24px] font-semibold mb-20">
            {achievements.map((ach, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-[30%_50%_10%] border-t py-4 gap-2 md:gap-0"
              >
                <div>{getText(ach.title)}</div>
                <div className="text-sm md:text-[24px] text-gray-500 md:text-black">
                  {getText(ach.description)}
                </div>
                <div className="text-sm md:text-[24px] text-gray-500 md:text-black">
                  {getText(ach.year)}
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
