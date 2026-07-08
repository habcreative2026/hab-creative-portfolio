"use client";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useLanguage } from "@/app/i18n/LanguageContext";
import Link from "next/link";

interface CardProject {
  _id: string;
  title: string;
  location: string;
  slug: string;
  homeImage: string;
  order: number;
}

const convertToEmbedUrl = (url: string): string => {
  if (!url) return "";
  let cleanUrl = url.trim();
  if (cleanUrl.includes("vimeo.com")) {
    if (cleanUrl.includes("player.vimeo.com")) return cleanUrl;
    const vimeoReg =
      /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/;
    const match = cleanUrl.match(vimeoReg);
    if (match && match[3]) {
      return `https://player.vimeo.com/video/${match[3]}?autoplay=1&muted=0&loop=1&badge=0&autopause=0&player_id=0&app_id=58479`;
    }
  }
  if (cleanUrl.includes("youtube.com") || cleanUrl.includes("youtu.be")) {
    if (cleanUrl.includes("youtube.com/embed/")) return cleanUrl;
    const ytReg =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = cleanUrl.match(ytReg);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=1&mute=0&loop=1&playlist=${match[2]}&playsinline=1`;
    }
  }
  return cleanUrl;
};

export default function ProjectDetailDisplay() {
  const params = useParams();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;

  const { lang, t } = useLanguage();

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [allProjects, setAllProjects] = useState<CardProject[]>([]);
  const [latestProjects, setLatestProjects] = useState<CardProject[]>([]);
  const [latestLoading, setLatestLoading] = useState(true);
  const [rotateArrow, setRotateArrow] = useState(false);
  const arrowRef = useRef(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${slug}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setProject(resData.data);
        } else {
          setProject(null);
        }
        setLoading(false);
      })
      .catch(() => {
        setProject(null);
        setLoading(false);
      });
  }, [slug]);

  useEffect(() => {
    if (!project) return;
    const fonts = new Set<string>();
    [
      "style_title",
      "style_company",
      "style_company_value",
      "style_year",
      "style_year_value",
      "style_category",
      "style_category_value",
      "style_description",
      "style_live",
      "style_live_value",
    ].forEach((key) => {
      if (project[key]?.font) fonts.add(project[key].font);
    });
    project.media_blocks?.forEach((b: any) => {
      if (b.text_font) fonts.add(b.text_font);
    });

    if (fonts.size === 0) return;

    const fontQuery = Array.from(fonts)
      .map((f) => `family=${f.replace(/\s+/g, "+")}:wght@300;400;500;700;900`)
      .join("&");

    const link = document.createElement("link");
    link.href = `https://fonts.googleapis.com/css2?${fontQuery}&display=swap`;
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, [project, slug]);

  useEffect(() => {
    const fetchAllProjects = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${apiUrl}/api/cards`);
        const resData = await res.json();

        if (resData.success && resData.data.length > 0) {
          setAllProjects(resData.data);
        }
      } catch (error) {
        console.error("Lỗi fetch danh sách dự án:", error);
      } finally {
        setLatestLoading(false);
      }
    };

    fetchAllProjects();
  }, []);

  useEffect(() => {
    if (allProjects.length === 0 || !project) return;

    const filteredProjects = allProjects.filter((p) => p.slug !== project.slug);

    if (filteredProjects.length === 0) {
      setLatestProjects([]);
      return;
    }

    const shuffled = [...filteredProjects].sort(() => 0.5 - Math.random());
    const randomTwo = shuffled.slice(0, Math.min(2, shuffled.length));
    setLatestProjects(randomTwo);
  }, [allProjects, project]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setRotateArrow(entry.isIntersecting);
      },
      { threshold: 0.6 },
    );

    const currentRef = arrowRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [latestProjects]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-xs text-white">
        ...
      </div>
    );

  if (!project)
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-xs text-gray-500">
        404
      </div>
    );

  const trans = (fieldObj: any) => {
    if (!fieldObj) return "";
    if (typeof fieldObj === "string") return fieldObj;
    return fieldObj[lang] || fieldObj["vi"] || fieldObj["en"] || "";
  };

  const getTextStyle = (styleObj: any) => {
    if (!styleObj) return {};
    return {
      fontFamily: styleObj.font || "Inter",
      fontSize: styleObj.size ? `${styleObj.size}px` : "inherit",
      fontWeight: styleObj.weight || "400",
      color: styleObj.color || "inherit",
      letterSpacing:
        styleObj.letter_spacing !== undefined &&
        styleObj.letter_spacing !== null
          ? `${styleObj.letter_spacing}px`
          : "normal",
    };
  };

  return (
    <div className="min-h-screen mt-16 md:mt-30 pt-10 md:pt-30 px-4 sm:px-6 md:px-10 lg:px-20 xl:px-40">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10 items-start">
        <div className="lg:col-span-2 max-w-2xl">
          <p
            className="max-w-auto leading-relaxed font-medium px-0 md:px-4"
            style={{
              ...getTextStyle(project.style_description),
              fontSize: project.style_description?.size
                ? `${project.style_description.size}px`
                : "18px",
            }}
          >
            {trans(project.description)}
          </p>
        </div>
        <div className="flex flex-col gap-4 md:gap-2">
          <div className="flex flex-col sm:flex-row sm:gap-20 md:gap-40 gap-4">
            <div style={{ textAlign: project.style_company?.align as any }}>
              <p
                style={{
                  ...getTextStyle(project.style_company),
                  fontSize: project.style_company?.size
                    ? `${project.style_company.size}px`
                    : "18px",
                }}
              >
                {t("company")}
              </p>
              <p
                style={{
                  ...getTextStyle(project.style_company_value),
                  fontSize: project.style_company_value?.size
                    ? `${project.style_company_value.size}px`
                    : "16px",
                }}
              >
                {project.company || "—"}
              </p>
            </div>
            <div style={{ textAlign: project.style_year?.align as any }}>
              <p
                style={{
                  ...getTextStyle(project.style_year),
                  fontSize: project.style_year?.size
                    ? `${project.style_year.size}px`
                    : "18px",
                }}
              >
                {t("v15")}
              </p>
              <p
                style={{
                  ...getTextStyle(project.style_year_value),
                  fontSize: project.style_year_value?.size
                    ? `${project.style_year_value.size}px`
                    : "16px",
                }}
              >
                {project.year || "—"}
              </p>
            </div>
          </div>
          <div style={{ textAlign: project.style_category?.align as any }}>
            <p
              style={{
                ...getTextStyle(project.style_category),
                fontSize: project.style_category?.size
                  ? `${project.style_category.size}px`
                  : "18px",
              }}
            >
              {t("category")}
            </p>
            <p
              style={{
                ...getTextStyle(project.style_category_value),
                fontSize: project.style_category_value?.size
                  ? `${project.style_category_value.size}px`
                  : "16px",
              }}
            >
              {trans(project.category)}
            </p>
          </div>
          {project.live?.url && (
            <div className="group inline-block">
              <p
                style={{
                  ...getTextStyle(project.style_live),
                  fontSize: project.style_live?.size
                    ? `${project.style_live.size}px`
                    : "18px",
                }}
              >
                {t("v13")}
              </p>
              <a
                href={project.live.url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative inline-block cursor-pointer break-all"
                style={{
                  ...getTextStyle(project.style_live_value),
                  fontSize: project.style_live_value?.size
                    ? `${project.style_live_value.size}px`
                    : "16px",
                }}
              >
                {project.live?.label?.[lang] ||
                  project.live?.label?.vi ||
                  project.live?.text ||
                  "Visit Project"}
                <span
                  className="
                  absolute left-0 bottom-0 h-[1px] w-full bg-black
                  scale-x-0 origin-right
                  transition-transform duration-300
                  group-hover:scale-x-100 group-hover:origin-left
                "
                ></span>
              </a>
            </div>
          )}
        </div>
      </div>
      <Link
        href={"/projects#top"}
        className="group text-sm text-black flex items-center gap-1 cursor-pointer px-0 md:px-4 mt-8"
      >
        <span className="text-lg">‹</span>
        <span className="transition-transform duration-200 group-hover:translate-x-1">
          {t("backtoproject")}
        </span>
      </Link>

      <div className="flex flex-row flex-wrap w-full items-start gap-y-4 sm:gap-y-4">
        {project.media_blocks?.map((block: any, idx: number) => {
          const wPercent =
            block.width_percent !== undefined ? block.width_percent : 100;

          let alignmentClass = "mx-auto";
          if (block.align_block === "left") alignmentClass = "mr-auto ml-0";
          if (block.align_block === "right") alignmentClass = "ml-auto mr-0";

          const isEmbedVideo =
            block.type === "iframe" ||
            (block.type === "video" &&
              (block.src?.includes("vimeo.com") ||
                block.src?.includes("youtube.com")));

          return (
            <div
              key={block.id || `block-${idx}`}
              style={{ "--block-width": `${wPercent}%` } as React.CSSProperties}
              className={`${alignmentClass} w-full sm:w-[var(--block-width)] transition-all px-0 sm:px-2`}
            >
              <div
                className={`relative overflow-hidden w-full h-full ${isEmbedVideo ? "aspect-video" : ""}`}
              >
                {block.type === "text_block" && (
                  <div
                    className="text-block-container w-full whitespace-pre-line flex items-center justify-center relative"
                    style={{
                      minHeight: `${block.height_px || 200}px`,
                    }}
                  >
                    <span
                      className="text-block-content"
                      style={{
                        position: "absolute",
                        left: `${block.text_x ?? 50}%`,
                        top: `${block.text_y ?? 50}%`,
                        transform: "translate(-50%, -50%)",
                        width: "90%",
                        fontFamily: block.text_font || "Inter",
                        fontWeight: block.text_weight || "400",
                        color: block.text_color || "#111111",
                        textAlign: (block.text_align || "center") as any,
                        letterSpacing: `${block.text_letter_spacing || 0}px`,
                        fontSize: `clamp(14px, 2vw + 8px, ${block.text_size || 24}px)`,
                      }}
                    >
                      {trans(block.text_content)}
                    </span>
                  </div>
                )}

                {block.type === "image" && (
                  <div
                    className="relative w-full h-full"
                    style={{
                      paddingBottom: `${(block.height_px / ((block.width_percent / 100) * 1200)) * 100}%`,
                    }}
                  >
                    <img
                      src={block.src}
                      alt="Project image"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    {block.overlay?.src && (
                      <div
                        className="absolute"
                        style={{
                          left: `${block.overlay.x || 50}%`,
                          top: `${block.overlay.y || 50}%`,
                          width: `${block.overlay.width || 30}%`,
                          height: `${block.overlay.height || 30}%`,
                          transform: `translate(-50%, -50%) rotate(${block.overlay.rotation || 0}deg)`,
                          opacity: block.overlay.opacity || 1,
                        }}
                      >
                        {block.overlay.type === "video" ? (
                          <video
                            src={block.overlay.src}
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <img
                            src={block.overlay.src}
                            alt="Overlay"
                            className="w-full h-full object-contain"
                          />
                        )}
                      </div>
                    )}

                    {/* Text overlay giữ nguyên */}
                    {block.has_text_overlay && block.text_content?.vi && (
                      <div
                        className="absolute whitespace-pre-line max-w-[85%]"
                        style={{
                          left: `${block.text_x ?? 50}%`,
                          top: `${block.text_y ?? 50}%`,
                          transform: "translate(-50%, -50%)",
                          width: "90%",
                          fontFamily: block.text_font || "Inter",
                          fontSize: `${block.text_size || 24}px`,
                          fontWeight: block.text_weight || "400",
                          color: block.text_color || "#ffffff",
                          textAlign: block.text_align || "center",
                          letterSpacing: `${block.text_letter_spacing || 0}px`,
                        }}
                      >
                        {block.text_content?.vi}
                      </div>
                    )}
                  </div>
                )}

                {block.type === "video" &&
                  block.src &&
                  !block.src.includes("vimeo.com") &&
                  !block.src.includes("youtube.com") && (
                    <video
                      src={block.src}
                      autoPlay
                      muted
                      loop
                      playsInline
                      // controls
                      className="w-full h-auto object-cover"
                    />
                  )}

                {isEmbedVideo && block.src && (
                  <iframe
                    title={`embed-${idx}`}
                    src={convertToEmbedUrl(block.src)}
                    className="w-full aspect-video border-0 block"
                    allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                    allowFullScreen
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!latestLoading && latestProjects.length > 0 && (
        <div className="mt-12 border-t pt-8 md:pt-12">
          <div className="flex items-center justify-between mb-6 gap-4">
            <h2 className="text-[36px] sm:text-[48px] md:text-[64px] font-medium tracking-tight leading-none">
              {trans({
                vi: "Dự án mới nhất",
                en: "Latest Projects",
                de: "Neueste Projekte",
              })}
            </h2>

            <div ref={arrowRef} className="cursor-pointer shrink-0">
              <svg
                width="60"
                height="60"
                viewBox="0 0 96.117 96.189"
                fill="black"
                className={`w-[40px] h-[40px] md:w-[60px] md:h-[60px] transition-transform duration-500 ease-out ${
                  rotateArrow ? "-rotate-180" : "-rotate-90"
                }`}
              >
                <path d="M 96.117 0.005 L 96.112 96.189 L 75.656 96.175 L 75.661 34.961 L 14.529 96.083 L 0.063 81.617 L 61.219 20.461 L 0.005 20.466 L 0 0 Z" />
              </svg>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {latestProjects.map((project) => (
              <Link
                key={project._id}
                href={`/projects/${project.slug}#top`}
                className="relative overflow-hidden h-[240px] sm:h-[280px] md:h-[320px]"
              >
                <img
                  src={project.homeImage}
                  className="w-full h-full object-cover transition-transform duration-500"
                  alt={project.title}
                />
                <span className="absolute bottom-2 left-3 text-white text-[18px] sm:text-[20px] md:text-[24px] mix-blend-difference">
                  {t(project.title)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
