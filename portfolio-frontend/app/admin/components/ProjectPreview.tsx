"use client";
import React, { useEffect } from "react";
import { useLanguage } from "@/app/i18n/LanguageContext";
import Link from "next/link";

// Hàm tiện ích hỗ trợ tự động chuyển đổi link vimeo/youtube thường sang link nhúng iframe player
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

// ✅ Component nhận props là dữ liệu project
export default function ProjectPreview({ project }: { project: any }) {
  const { lang } = useLanguage();

  // Load fonts từ project data
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
  }, [project]);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-xs text-red-500">
        NO PROJECT DATA
      </div>
    );
  }

  const trans = (fieldObj: any) => {
    if (!fieldObj) return "";
    if (typeof fieldObj === "string") return fieldObj;
    return fieldObj[lang] || fieldObj["vi"] || fieldObj["en"] || "";
  };

  // Helper lấy style cho text
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
    <div className="min-h-screen px-4 sm:px-6 md:px-10 lg:px-20 xl:px-40 bg-white">
      {/* THÔNG TIN PROJECT */}
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
          <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
            {/* Company */}
            <div style={{ textAlign: project.style_company?.align as any }}>
              <p
                style={{
                  ...getTextStyle(project.style_company),
                  fontSize: project.style_company?.size
                    ? `${project.style_company.size}px`
                    : "18px",
                }}
              >
                Company
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
            {/* Timeline */}
            <div style={{ textAlign: project.style_year?.align as any }}>
              <p
                style={{
                  ...getTextStyle(project.style_year),
                  fontSize: project.style_year?.size
                    ? `${project.style_year.size}px`
                    : "18px",
                }}
              >
                Timeline
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
          {/* Category */}
          <div style={{ textAlign: project.style_category?.align as any }}>
            <p
              style={{
                ...getTextStyle(project.style_category),
                fontSize: project.style_category?.size
                  ? `${project.style_category.size}px`
                  : "18px",
              }}
            >
              Category
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
          {/* Live */}
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
                Live
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
          Back to project
        </span>
      </Link>

      {/* SECTION ĐỘNG: RENDER MEDIA BLOCKS RESPONSIVE */}
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

                {/* 2. IMAGE BLOCK - HỖ TRỢ VIDEO OVERLAY */}
                {block.type === "image" && (
                  <div className="relative w-full h-auto">
                    <img
                      src={block.src}
                      loading="lazy"
                      className="w-full h-auto object-cover"
                      alt="Project visual"
                    />

                    {/* ⭐ VIDEO/IMAGE OVERLAY */}
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
                          zIndex: 10,
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

                    {/* TEXT OVERLAY (giữ nguyên) */}
                    {block.has_text_overlay && (
                      <div
                        className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none whitespace-pre-line max-w-[70%] z-20 w-full px-2"
                        style={{
                          left: `${block.text_x ?? 50}%`,
                          top: `${block.text_y ?? 50}%`,
                          fontFamily: block.text_font || "Inter",
                          fontWeight: block.text_weight || "400",
                          color: block.text_color || "#ffffff",
                          textAlign: (block.text_align || "center") as any,
                          letterSpacing: `${block.text_letter_spacing || 0}px`,
                          lineHeight: "1.3",
                          fontSize: `clamp(10px, 4vw, ${block.text_size || 24}px)`,
                        }}
                      >
                        {trans(block.text_content)}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. VIDEO LOCAL */}
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
                      controls
                      className="w-full h-auto object-cover"
                    />
                  )}

                {/* 4. EMBED VIDEO */}
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
    </div>
  );
}
