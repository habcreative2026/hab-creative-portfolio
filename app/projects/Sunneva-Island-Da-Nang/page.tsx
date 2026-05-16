"use client";
import { useLanguage } from "@/app/i18n/LanguageContext";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function SunnevaIslandPage() {
  const { t } = useLanguage();
  const arrowRef = useRef(null);
  const [rotateArrow, setRotateArrow] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRotateArrow(true);
        } else {
          setRotateArrow(false);
        }
      },
      {
        threshold: 0.6,
      }
    );

    if (arrowRef.current) {
      observer.observe(arrowRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen mt-16 md:mt-30 pt-10 md:pt-30 px-4 sm:px-6 md:px-10 lg:px-20 xl:px-40">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10 items-start">

        <div className="lg:col-span-2 max-w-2xl">
          <p className="max-w-auto leading-relaxed font-medium font-inter text-[16px] sm:text-[18px] md:text-[20px] px-0 md:px-4">
            {t.project444}
          </p>
        </div>

        <div className="flex flex-col gap-4 md:gap-2">

          <div className="flex flex-col sm:flex-row sm:gap-20 md:gap-40 gap-4">
            <div>
              <p className="text-[16px] md:text-[18px] font-inter font-bold">
                {t.company}
              </p>

              <p className="text-[14px] md:text-[16px] font-inter">
                Sun Group
              </p>
            </div>

            <div>
              <p className="text-[16px] md:text-[18px] font-inter font-bold">
                {t.v15}
              </p>

              <p className="text-[14px] md:text-[16px] font-inter">
                2022 - 2023
              </p>
            </div>
          </div>

          {/* Role */}
          <div>
            <p className="text-[16px] md:text-[18px] font-inter font-bold">
              {t.category}
            </p>

            <p className="text-[14px] md:text-[16px] font-inter">
              {t.v16}
            </p>
          </div>

          <div className="group inline-block">
            <p className="text-[16px] md:text-[18px] font-inter font-bold">
              {t.v13}
            </p>

            <p className="relative inline-block text-[14px] md:text-[16px] font-inter cursor-pointer break-all">
              {t.v14}

              <span
                className="
                  absolute left-0 bottom-0 h-[1px] w-full bg-black
                  scale-x-0 origin-right
                  transition-transform duration-300
                  group-hover:scale-x-100 group-hover:origin-left
                "
              ></span>
            </p>
          </div>
        </div>
      </div>

      <Link
        href={"/projects#top"}
        className="group text-sm text-black flex items-center gap-1 cursor-pointer px-0 md:px-4 mt-8"
      >
        <span className="text-lg">
          ‹
        </span>

        <span className="transition-transform duration-200 group-hover:translate-x-1">
          {t.backtoproject}
        </span>
      </Link>

      <div className="mt-2 flex flex-col gap-3">

        <div className="relative w-full h-full overflow-hidden group">

          <div className="relative w-full h-[260px] sm:h-[400px] md:h-[600px] lg:h-[800px] overflow-hidden md:-mt-14">
            <iframe
              title="vimeo-player"
              src="https://player.vimeo.com/video/894421461?h=10b6466cdb&autoplay=1&muted=1&loop=1"
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>

        <div className="grid grid-cols-2">
          <div />
        </div>

        <div className="md:-mt-20 md:-pt-20">
          <img
            src="/project_sunneva_island_da_nang/001.avif"
            alt="Lightspeed visual"
            className="w-full h-full object-cover"
          />
        </div>

        <img
          src="/project_sunneva_island_da_nang/002.avif"
          alt="Lightspeed visual"
          className="w-full h-full object-cover"
        />

        <img
          src="/project_sunneva_island_da_nang/003.avif"
          alt="Lightspeed visual"
          className="w-full h-full object-cover"
        />

        <img
          src="/project_sunneva_island_da_nang/004.avif"
          alt="Lightspeed visual"
          className="w-full h-full object-cover"
        />

        <img
          src="/project_sunneva_island_da_nang/005.webp"
          alt="Lightspeed visual"
          className="w-full h-full object-cover"
        />

        <img
          src="/project_sunneva_island_da_nang/006.webp"
          alt="Lightspeed visual"
          className="w-full h-full object-cover"
        />

        <img
          src="/project_sunneva_island_da_nang/007.webp"
          alt="Lightspeed visual"
          className="w-full h-full object-cover"
        />

        <div className="grid grid-cols-2 mb-12 md:mb-20">
          <div />
        </div>

      </div>

      <div className="mt-12 border-t pt-8 md:pt-12">

        <div className="flex items-center justify-between mb-6 gap-4">

          <h2 className="text-[36px] sm:text-[48px] md:text-[64px] font-medium tracking-tight leading-none">
            {t.latest}
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

          <Link
            onMouseEnter={() =>
              window.dispatchEvent(
                new CustomEvent("cursor-change", { detail: "image" })
              )
            }
            onMouseLeave={() =>
              window.dispatchEvent(
                new CustomEvent("cursor-change", { detail: "default" })
              )
            }
            href={"/projects/the-beverly#top"}
            className="relative overflow-hidden h-[240px] sm:h-[280px] md:h-[320px]"
          >
            <img
              src="/project_the_beverly/vinhomes_grand_park.avif"
              className="w-full h-full object-cover transition-transform duration-500 cursor-none"
            />

            <span className="absolute bottom-2 left-3 text-white text-[18px] sm:text-[20px] md:text-[24px] mix-blend-difference">
              The Beverly, HCMC
            </span>
          </Link>

          <Link
            onMouseEnter={() =>
              window.dispatchEvent(
                new CustomEvent("cursor-change", { detail: "image" })
              )
            }
            onMouseLeave={() =>
              window.dispatchEvent(
                new CustomEvent("cursor-change", { detail: "default" })
              )
            }
            href={"/projects/Beer-Club-Z70#top"}
            className="relative overflow-hidden h-[240px] sm:h-[280px] md:h-[320px]"
          >
            <img
              src="/project_beer_club_z70/beer_club_z70.avif"
              className="w-full h-full object-cover transition-transform duration-500 cursor-none"
            />

            <span className="absolute bottom-2 left-3 text-white text-[18px] sm:text-[20px] md:text-[24px] mix-blend-difference">
              Beer Club Z70
            </span>
          </Link>

        </div>

      </div>
    </div>
  );
}