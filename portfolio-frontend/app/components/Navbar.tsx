"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useScroll } from "framer-motion";
import { useTime } from "../useTime";
import { useLanguage } from "../i18n/LanguageContext";
import { Globe } from "lucide-react";
import { usePathname } from "next/navigation";
import { useLinks } from "../context/LinkContext";
import { useTranslationStyle } from "../context/TextStyleContext";

interface ProjectItem {
  _id: string;
  title: string;
}

interface NavbarProps {
  suppressTransitions?: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function NavbarPage({
  suppressTransitions = false,
}: NavbarProps) {
  const [playing, setPlaying] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [allowTransition, setAllowTransition] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const { lang, setLang, t } = useLanguage();
  const [openLang, setOpenLang] = useState(false);
  const [openMobileLang, setOpenMobileLang] = useState(false);
  const { getLink } = useLinks();
  const [isMobile, setIsMobile] = useState(false);

  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const langRef = useRef<HTMLDivElement | null>(null);
  const mobileLangRef = useRef<HTMLDivElement | null>(null);
  const time = useTime("Asia/Ho_Chi_Minh");

  const styleProjects = useTranslationStyle("projects");
  const styleJournal = useTranslationStyle("journal");
  const styleAbout = useTranslationStyle("about");
  const styleContact = useTranslationStyle("contact");
  const styleAvailable = useTranslationStyle("available");
  const styleHcmc = useTranslationStyle("hcmc");
  const styleEmail = useTranslationStyle("email");
  const styleSdthab = useTranslationStyle("sdthab");
  const styleNavmxh00 = useTranslationStyle("navmxh00");
  const styleNavmxh01 = useTranslationStyle("navmxh01");
  const styleNavmxh02 = useTranslationStyle("navmxh02");

  const { scrollY } = useScroll();
  const pathname = usePathname();

  const closeAllMenus = () => {
    setMobileMenu(false);
    setOpenLang(false);
    setOpenMobileLang(false);
  };

  const [logoData, setLogoData] = useState<{
    logo_image: string;
    logo_alt: string;
    logo_link: string;
    logo_width: number;
    logo_height: number;
  }>({
    logo_image: "/logo_bhq.png",
    logo_alt: "Logo",
    logo_link: "/",
    logo_width: 120,
    logo_height: 32,
  });

  // ============ INIT AUDIO + SCROLL SUBSCRIBE ============
  useEffect(() => {
    let isMounted = true;

    const initAudio = async () => {
      try {
        const res = await fetch(`${API_URL}/api/audio/public`);
        if (res.ok && isMounted) {
          const json = await res.json();
          const audioUrl = json.success ? json.data.url : "/music.mp3";

          audioRef.current = new Audio(audioUrl);
          audioRef.current.loop = true;
          audioRef.current.volume = 0.3;
          audioRef.current.preload = "auto";
        }
      } catch (err) {
        console.error("Lỗi đồng bộ nhạc nền từ CMS:", err);
        if (isMounted) {
          audioRef.current = new Audio("/music.mp3");
          audioRef.current.loop = true;
          audioRef.current.volume = 0.3;
        }
      }
    };

    initAudio();

    const currentScroll = scrollY.get();
    setIsScrolled(currentScroll > 100);

    const unsubscribe = scrollY.on("change", (latest) => {
      setIsScrolled(latest > 100);
    });

    return () => {
      isMounted = false;
      if (audioRef.current) {
        audioRef.current.pause();
      }
      unsubscribe();
    };
  }, [scrollY]);

  // ============ ALLOW TRANSITION LOGIC ============
  useEffect(() => {
    if (suppressTransitions) {
      setAllowTransition(false);
      return;
    }

    // Bật transition sau 2 RAF → chắc chắn browser đã paint xong
    // frame đầu tiên của Navbar visible → không animate state cũ
    let raf1: number;
    let raf2: number;

    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setAllowTransition(true);
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [suppressTransitions]);

  // ============ SYNC SCROLL WHEN VISIBLE ============
  useEffect(() => {
    if (suppressTransitions) return;
    const currentScroll = scrollY.get();
    setIsScrolled(currentScroll > 100);
  }, [suppressTransitions, scrollY]);

  const toggleSound = () => {
    if (!audioRef.current) return;

    const newState = !playing;
    setPlaying(newState);
    window.dispatchEvent(
      new CustomEvent("sound-change", {
        detail: newState,
      }),
    );

    if (newState) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  };

  useEffect(() => {
    const handleFirstInteraction = async () => {
      if (!audioRef.current) return;

      try {
        await audioRef.current.play();

        setPlaying(true);

        window.dispatchEvent(
          new CustomEvent("sound-change", {
            detail: true,
          }),
        );
      } catch (error) {
        console.error("Audio autoplay blocked:", error);
      } finally {
        window.removeEventListener("pointerdown", handleFirstInteraction);
      }
    };

    window.addEventListener("pointerdown", handleFirstInteraction, {
      once: true,
    });

    return () => {
      window.removeEventListener("pointerdown", handleFirstInteraction);
    };
  }, []);

  useEffect(() => {
    closeAllMenus();
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setOpenLang(false);
      }

      if (
        mobileLangRef.current &&
        !mobileLangRef.current.contains(e.target as Node)
      ) {
        setOpenMobileLang(false);
      }
    };

    window.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    const fetchProjectsData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${apiUrl}/api/cards`);
        const resData = await res.json();

        if (resData.success) {
          setProjects(resData.data);
        }
      } catch (error) {
        console.error("Lỗi khi kết nối API MongoDB:", error);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjectsData();

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const res = await fetch(`${API_URL}/api/logo`);
        const data = await res.json();
        if (data.success && data.data) {
          setLogoData({
            logo_image: data.data.logo_image || "/logo_bhq.png",
            logo_alt: data.data.logo_alt || "Logo",
            logo_link: data.data.logo_link || "/",
            logo_width: data.data.logo_width || 120,
            logo_height: data.data.logo_height || 32,
          });
        }
      } catch (error) {
        console.error("Error fetching logo:", error);
      }
    };

    fetchLogo();
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full bg-white font-sans py-2 z-50">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes sound-wave-center {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(2.8); }
        }
        .animate-sound-center {
          animation: sound-wave-center 0.6s ease-in-out infinite;
          transform-origin: center;
        }
      `,
        }}
      />

      <div className="mx-auto flex flex-row items-start justify-between text-[12px] font-medium leading-none tracking-tight px-4 pl-1.5 pr-4 gap-4 lg:gap-30 xl:gap-20">
        {/* LOGO */}
        <Link
          href={logoData.logo_link || "/"}
          className="flex items-center justify-between z-30 bg-white"
        >
          <div
            onMouseEnter={() =>
              window.dispatchEvent(
                new CustomEvent("cursor-change", { detail: "home" }),
              )
            }
            onMouseLeave={() =>
              window.dispatchEvent(
                new CustomEvent("cursor-change", { detail: "default" }),
              )
            }
            className="cursor-none"
          >
            <img
              src={logoData.logo_image || "/logo_bhq.png"}
              alt={logoData.logo_alt || "Logo"}
              style={{
                width: logoData.logo_width || 120,
                height: logoData.logo_height || 32,
                objectFit: "contain",
              }}
              className="object-cover"
            />
          </div>
        </Link>

        <div className="flex flex-1 min-w-0 items-start">
          <div
            className={`flex items-start mr-auto ${
              allowTransition
                ? "transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
                : ""
            } ${
              isScrolled
                ? "lg:-translate-x-[20px] xl:-translate-x-[50px]"
                : "translate-x-0"
            }`}
          >
            <div className="hidden lg:flex items-center gap-6 text-black/80">
              <a
                href={getLink("nav_mobile").url}
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
                className="hidden xl:block cursor-none"
              >
                <span style={styleSdthab}>{t("sdthab")}</span>
              </a>
              <a
                href={getLink("nav_gmail").url}
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
                className="hidden xl:block transition cursor-none"
              >
                <span style={styleEmail}>{t("email")}</span>
              </a>
              <Link
                href={getLink("nav_contact").url}
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
                  cursor-none
                  bg-black
                  text-white
                  px-5
                  py-3
                  rounded-full
                  text-[11px]
                  font-bold
                  whitespace-nowrap
                  border border-black 
                  transition-all duration-300
                  hover:bg-white
                  hover:text-black
                  hover:border-black
                "
              >
                <span style={styleAvailable}>{t("available")}</span>
              </Link>
            </div>
          </div>

          {/* RIGHT SIDE — Menu items */}
          <div
            className={`hidden lg:flex items-start gap-x-8 pt-3 ${
              allowTransition
                ? "transition-all duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                : ""
            } ${
              isScrolled
                ? "lg:-translate-x-[20px] xl:-translate-x-[60px]"
                : "translate-x-0"
            }`}
          >
            {!isScrolled ? (
              <>
                <div className="flex flex-col gap-5">
                  <Link
                    href={getLink("nav_projects").url}
                    onMouseEnter={() =>
                      window.dispatchEvent(
                        new CustomEvent("cursor-change", {
                          detail: "userdefault",
                        }),
                      )
                    }
                    onMouseLeave={() =>
                      window.dispatchEvent(
                        new CustomEvent("cursor-change", { detail: "default" }),
                      )
                    }
                    className="cursor-none transition whitespace-nowrap"
                  >
                    <span style={styleProjects}>
                      {t("projects")} (
                      {loadingProjects ? "..." : projects.length})
                    </span>
                  </Link>
                  <div className="flex flex-col gap-4 items-end">
                    <div
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
                      className="cursor-none transition"
                    >
                      <Link href={getLink("nav_journal").url}>
                        <span style={styleJournal}>{t("journal")}</span>
                      </Link>
                    </div>
                    <Link
                      href={getLink("nav_about").url}
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
                      className="cursor-none transition"
                    >
                      <span style={styleAbout}>{t("about")}</span>
                    </Link>
                    <Link
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
                      href={getLink("nav_contact").url}
                      className="cursor-none transition"
                    >
                      <span style={styleContact}>{t("contact")}</span>
                    </Link>
                  </div>
                </div>
                <div className="flex flex-col gap-5">
                  <a
                    target="_blank"
                    href={getLink("nav_link_00").url}
                    onMouseEnter={() =>
                      window.dispatchEvent(
                        new CustomEvent("cursor-change", {
                          detail: "userdefault",
                        }),
                      )
                    }
                    onMouseLeave={() =>
                      window.dispatchEvent(
                        new CustomEvent("cursor-change", { detail: "default" }),
                      )
                    }
                    className="cursor-none transition"
                  >
                    <span style={styleNavmxh00}>{t("navmxh00")}</span>
                  </a>
                  <a
                    target="_blank"
                    href={getLink("nav_link_02").url}
                    onMouseEnter={() =>
                      window.dispatchEvent(
                        new CustomEvent("cursor-change", {
                          detail: "userdefault",
                        }),
                      )
                    }
                    onMouseLeave={() =>
                      window.dispatchEvent(
                        new CustomEvent("cursor-change", { detail: "default" }),
                      )
                    }
                    className="cursor-none transition"
                  >
                    <span style={styleNavmxh01}>{t("navmxh01")}</span>
                  </a>
                  <a
                    target="_blank"
                    href={getLink("nav_link_01").url}
                    onMouseEnter={() =>
                      window.dispatchEvent(
                        new CustomEvent("cursor-change", {
                          detail: "userdefault",
                        }),
                      )
                    }
                    onMouseLeave={() =>
                      window.dispatchEvent(
                        new CustomEvent("cursor-change", { detail: "default" }),
                      )
                    }
                    className="cursor-none transition"
                  >
                    <span style={styleNavmxh02}>{t("navmxh02")}</span>
                  </a>
                </div>
              </>
            ) : (
              <div className="flex flex-row gap-6">
                <Link
                  onMouseEnter={() =>
                    window.dispatchEvent(
                      new CustomEvent("cursor-change", {
                        detail: "userdefault",
                      }),
                    )
                  }
                  onMouseLeave={() =>
                    window.dispatchEvent(
                      new CustomEvent("cursor-change", { detail: "default" }),
                    )
                  }
                  href={getLink("nav_projects").url}
                  className="cursor-none transition whitespace-nowrap"
                >
                  <span style={styleProjects}>
                    {t("projects")} ({loadingProjects ? "..." : projects.length}
                    )
                  </span>
                </Link>
                <div
                  onMouseEnter={() =>
                    window.dispatchEvent(
                      new CustomEvent("cursor-change", {
                        detail: "userdefault",
                      }),
                    )
                  }
                  onMouseLeave={() =>
                    window.dispatchEvent(
                      new CustomEvent("cursor-change", { detail: "default" }),
                    )
                  }
                  className="cursor-none transition"
                >
                  <Link href={getLink("nav_journal").url}>
                    <span style={styleJournal}>{t("journal")}</span>
                  </Link>
                </div>
                <Link
                  href={getLink("nav_about").url}
                  onMouseEnter={() =>
                    window.dispatchEvent(
                      new CustomEvent("cursor-change", {
                        detail: "userdefault",
                      }),
                    )
                  }
                  onMouseLeave={() =>
                    window.dispatchEvent(
                      new CustomEvent("cursor-change", { detail: "default" }),
                    )
                  }
                  className="cursor-none transition"
                >
                  <span style={styleAbout}>{t("about")}</span>
                </Link>
                <Link
                  onMouseEnter={() =>
                    window.dispatchEvent(
                      new CustomEvent("cursor-change", {
                        detail: "userdefault",
                      }),
                    )
                  }
                  onMouseLeave={() =>
                    window.dispatchEvent(
                      new CustomEvent("cursor-change", { detail: "default" }),
                    )
                  }
                  href={getLink("nav_contact").url}
                  className="cursor-none transition"
                >
                  <span style={styleContact}>{t("contact")}</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — Language, Time, Sound */}
        <div className="flex items-center gap-2 sm:gap-4 z-30 bg-white pt-2 sm:pt-3">
          <button
            onClick={() => {
              setMobileMenu((prev) => !prev);

              if (mobileMenu) {
                setOpenMobileLang(false);
              }
            }}
            className="
              lg:hidden
              px-4
              py-2
              rounded-full
              border
              border-black
              bg-white
              text-black
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.12em]
              transition-all
              duration-300
              hover:bg-black
              hover:text-white
              -mt-1
            "
          >
            {mobileMenu ? "Close" : "Menu"}
          </button>

          <div className="hidden sm:flex items-center gap-4 whitespace-nowrap text-black/80">
            <div ref={langRef} className="relative">
              <button
                onClick={() => setOpenLang(!openLang)}
                className="flex items-center gap-2 text-[13px] font-medium transition-all duration-300 rounded-lg"
              >
                <Globe size={14} className="text-black/80 mt-0.2" />
              </button>

              <div
                className={`
                  absolute top-6 left-1/2 -translate-x-1/2 w-[54px] bg-white
                  border border-black/5 rounded-xl shadow-xl p-1.5 z-[9999]
                  transition-all duration-300 origin-top
                  ${
                    openLang
                      ? "opacity-100 visible translate-y-0 scale-100"
                      : "opacity-0 invisible -translate-y-2 scale-95"
                  }
                `}
              >
                {[
                  { code: "vi", flag: "🇻🇳" },
                  { code: "en", flag: "🇺🇸" },
                  { code: "de", flag: "🇩🇪" },
                ].map((item) => {
                  const isSelected = lang === item.code;
                  return (
                    <button
                      key={item.code}
                      onClick={() => {
                        setLang(item.code as any);
                        closeAllMenus();
                      }}
                      className={`
                        w-full flex items-center justify-between gap-2 px-3 py-2
                        rounded-lg text-left text-[13px] font-medium
                        transition-all duration-200 mb-0.5 last:mb-0
                        ${
                          isSelected
                            ? "bg-black text-white"
                            : "text-black/70 hover:bg-black/5 hover:text-black"
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[16px]">{item.flag}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span style={styleHcmc}>{t("hcmc")}</span>
              <span className="text-[12px] animate-pulse">•</span>
              <span>{time}</span>
            </div>
          </div>

          <button
            onMouseEnter={() =>
              window.dispatchEvent(
                new CustomEvent("cursor-change", { detail: "sound" }),
              )
            }
            onMouseLeave={() =>
              window.dispatchEvent(
                new CustomEvent("cursor-change", { detail: "default" }),
              )
            }
            onClick={toggleSound}
            className="hidden lg:flex items-center justify-center h-[14px] w-[30px] cursor-pointer cursor-none"
          >
            <div
              className={`flex items-center transition-all duration-500 ${
                playing ? "gap-[2px]" : "gap-0"
              }`}
            >
              {[...Array(7)].map((_, i) => (
                <span
                  key={i}
                  className={`bg-black transition-all duration-500 ${
                    playing
                      ? "w-[1.1px] animate-sound-center rounded-full"
                      : "w-[4px] h-[1px]"
                  }`}
                  style={{
                    height: playing ? `${4 + (i % 2) * 3}px` : "0.5px",
                    animationDelay: playing ? `${i * 0.1}s` : "0s",
                  }}
                />
              ))}
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-500 ${
          mobileMenu ? "max-h-[600px] opacity-100 py-6" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 flex flex-col gap-5 text-[14px] font-medium">
          <Link href={getLink("nav_projects").url}>
            <span style={styleProjects}>
              {t("projects")} ({loadingProjects ? "..." : projects.length})
            </span>
          </Link>

          <Link href={getLink("nav_journal").url}>
            <span style={styleJournal}>{t("journal")}</span>
          </Link>

          <Link href={getLink("nav_about").url}>
            <span style={styleAbout}>{t("about")}</span>
          </Link>

          <Link href={getLink("nav_contact").url}>
            <span style={styleContact}>{t("contact")}</span>
          </Link>

          <div className="border-t pt-5 flex flex-col gap-4 text-black/70">
            <a href={getLink("nav_mobile").url}>
              <span style={styleSdthab}>{t("sdthab")}</span>
            </a>

            <a href={getLink("nav_gmail").url}>
              <span style={styleEmail}>{t("email")}</span>
            </a>

            <a
              target="_blank"
              href={getLink("nav_link_02").url}
              onClick={closeAllMenus}
            >
              <span style={styleNavmxh00}>{t("navmxh00")}</span>
            </a>

            <a
              target="_blank"
              href={getLink("nav_link_02").url}
              onClick={closeAllMenus}
            >
              <span style={styleNavmxh01}>{t("navmxh01")}</span>
            </a>

            <a
              target="_blank"
              href={getLink("nav_link_01").url}
              onClick={closeAllMenus}
            >
              <span style={styleNavmxh02}>{t("navmxh02")}</span>
            </a>

            <div className="border-t pt-4 mt-1 flex items-center justify-between">
              <span className="text-black/50 text-[13px]">{t("language")}</span>

              <div ref={mobileLangRef} className="relative">
                <button
                  onClick={() => setOpenMobileLang(!openMobileLang)}
                  className="flex items-center gap-2 text-[13px] font-medium text-black transition-all duration-300 py-1 px-2 rounded-lg bg-black/5"
                >
                  <Globe size={14} className="text-black/60" />
                </button>
                <div
                  className={`
                    absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-[54px]
                    bg-white border border-black/10 rounded-xl shadow-xl p-1.5
                    z-[9999] transition-all duration-300 origin-bottom
                    ${
                      openMobileLang
                        ? "opacity-100 visible translate-y-0 scale-100"
                        : "opacity-0 invisible translate-y-2 scale-95"
                    }
                  `}
                >
                  {[
                    { code: "vi", flag: "🇻🇳" },
                    { code: "en", flag: "🇺🇸" },
                    { code: "de", flag: "🇩🇪" },
                  ].map((item) => {
                    const isSelected = lang === item.code;
                    return (
                      <button
                        key={item.code}
                        onClick={() => {
                          setLang(item.code as any);
                          closeAllMenus();
                        }}
                        className={`
                          w-full flex items-center justify-between gap-2 px-3 py-2
                          rounded-lg text-left text-[13px] font-medium
                          transition-all duration-200 mb-0.5 last:mb-0
                          ${
                            isSelected
                              ? "bg-black text-white"
                              : "text-black/70 hover:bg-black/5 hover:text-black"
                          }
                        `}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[16px]">{item.flag}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
