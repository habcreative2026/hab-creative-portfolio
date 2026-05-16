"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useScroll } from "framer-motion";
import { useTime } from "../useTime";
import { useLanguage } from "../i18n/LanguageContext";
import { Globe, ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";

export default function NavbarPage() {
  const [playing, setPlaying] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [allowTransition, setAllowTransition] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const { lang, setLang, t } = useLanguage();
const [openLang, setOpenLang] = useState(false);
const [openMobileLang, setOpenMobileLang] = useState(false);

const langRef = useRef<HTMLDivElement | null>(null);
const mobileLangRef = useRef<HTMLDivElement | null>(null);
  const time = useTime("Asia/Ho_Chi_Minh"); 

  const { scrollY } = useScroll();
  const pathname = usePathname();
  const closeAllMenus = () => {
  setMobileMenu(false);
  setOpenLang(false);
  setOpenMobileLang(false);
};

  useEffect(() => {
audioRef.current = new Audio("/music.mp3");
audioRef.current.loop = true;
audioRef.current.volume = 0.3;
audioRef.current.preload = "auto";

  const currentScroll = scrollY.get();
  setIsScrolled(currentScroll > 100);

  setHasMounted(true);

  const timer = setTimeout(() => { 
    setAllowTransition(true);
  }, 200);

  const unsubscribe = scrollY.on("change", (latest) => {
    setIsScrolled(latest > 100);
  });

  return () => {
    unsubscribe();
    clearTimeout(timer); 
  };
}, [scrollY]);

const toggleSound = () => {
  if (!audioRef.current) return;

  const newState = !playing;
  setPlaying(newState);
  window.dispatchEvent(
    new CustomEvent("sound-change", {
      detail: newState,
    })
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
        })
      );
    } catch (error) {
      console.error("Audio autoplay blocked:", error);
    } finally {
      window.removeEventListener(
        "pointerdown",
        handleFirstInteraction
      );
    }
  };

  window.addEventListener(
    "pointerdown",
    handleFirstInteraction,
    { once: true }
  );

  return () => {
    window.removeEventListener(
      "pointerdown",
      handleFirstInteraction
    );
  };
}, []);


useEffect(() => {
  closeAllMenus();
}, [pathname]);

useEffect(() => {
  const handleClickOutside = (e: MouseEvent) => {

    if (
      langRef.current &&
      !langRef.current.contains(e.target as Node)
    ) {
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
    window.removeEventListener(
      "click",
      handleClickOutside
    );
  };
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

      <div className="mx-auto flex flex-row items-start justify-between text-[12px] font-medium leading-none tracking-tight px-4 gap-4 lg:gap-50">
        
        <Link href={"/"} className="flex items-center justify-between z-30 bg-white">
          <h1 onMouseEnter={() =>
  window.dispatchEvent(
    new CustomEvent("cursor-change", { detail: "home" })
  )
}
onMouseLeave={() =>
  window.dispatchEvent(
    new CustomEvent("cursor-change", { detail: "default" })
  )
} className="text-[22px] font-bold leading-none tracking-tighter uppercase cursor-none">
        <img 
  src="/logo_bhq.png"
  alt="logo"
  className="w-full h-8 mt-0.5 object-cover"
/>
          </h1>
        </Link>

        <div className={`flex flex-1 items-start transition-opacity duration-300 ${hasMounted ? "opacity-100" : "opacity-0"}`}>
          
          <div
            className={`flex items-start mr-auto ${
              // Chỉ thêm transition sau khi đã mounted và đã check scroll xong
              allowTransition ? "transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]" : ""
            } ${
              isScrolled ? "-translate-x-[180px]" : "translate-x-0"
            }`}
          >
<div className="hidden lg:flex items-center gap-6 text-black/80">
              <a
  href="tel:+84925555958"
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
  className="cursor-none"
>
  (84) 92 5555 958
</a>
              <a href="mailto:buihaitrong.dev@gmail.com" 
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
              className="transition cursor-none">
                hello@habcreative.com
              </a>
<Link
  href={"/contact"}
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
  {t.available}
</Link>
            </div>
          </div>
<div
  className={`hidden lg:flex items-start gap-x-8 pt-3 ${
    allowTransition ? "transition-all duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)]" : ""
  } ${
    isScrolled ? "-translate-x-[60px]" : "translate-x-0"
  }`}
>
            {!isScrolled ? (
              <>
                <div className="flex flex-col gap-5">
                  <Link href={"/projects"} 
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
                  className="cursor-none transition whitespace-nowrap">
                    {t.projects} (17)
                  </Link>
                  <div className="flex flex-col gap-4 items-end">
                    <div
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
                    className="cursor-none transition">{t.journal}</div>
                    <Link href={"/about"}
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
                    className="cursor-none transition">{t.about}</Link>
                    <Link
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
                    href={"/contact"} className="cursor-none transition">{t.contact}</Link>
                  </div>
                </div>
                <div className="flex flex-col gap-5">
                  <a target="_blank" href={"https://vn.linkedin.com/"}
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
                  className="cursor-none transition">LinkedIn</a>
                  <a target="_blank" href={"https://x.com/"} 
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
                  className="cursor-none transition">Twitter (X)</a>
                  <a target="_blank" href={"https://dribbble.com/"}
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
                  className="cursor-none  transition">Dribbble</a>
                </div>
              </>
            ) : (
              <div className="flex flex-row gap-6">
                <Link
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
                href={"/projects"} className="cursor-none transition whitespace-nowrap">
                  {t.projects} (17)
                </Link>
                <div
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
                className="cursor-none transition">{t.journal}</div>
                <Link href={"/about"} 
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
                className="cursor-none transition">{t.about}</Link>
                <Link 
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
                href={"/contact"} className="cursor-none transition">{t.contact}</Link>
              </div>
            )}
          </div>
        </div>
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
    className="
      flex
      items-center
      gap-2
      text-[13px]
      font-medium
      transition-all
      duration-300
      rounded-lg
    "
  >
    <Globe size={14} className="text-black/80 mt-0.2" />
    <span className="text-[14px] ml-0.5 -mt-1">
      {lang === "vi" && "🇻🇳"}
      {lang === "en" && "🇺🇸"}
      {lang === "de" && "🇩🇪"}
    </span>

    <ChevronDown
      size={13}
      className={`
        text-black/40
        transition-transform
        duration-300
        ${openLang ? "rotate-180" : ""}
      `}
    />
  </button>

  <div
    className={`
      absolute
      top-9
      left-1/2
      -translate-x-1/2
      w-[140px]
      bg-white
      border
      border-black/5
      rounded-xl
      shadow-xl
      p-1.5
      z-[9999]
      transition-all
      duration-300
      origin-top

      ${
        openLang
          ? "opacity-100 visible translate-y-0 scale-100"
          : "opacity-0 invisible -translate-y-2 scale-95"
      }
    `}
  >
    {[
      { code: "vi", label: "Vietnamese", flag: "🇻🇳" },
      { code: "en", label: "English", flag: "🇺🇸" },
      { code: "de", label: "German", flag: "🇩🇪" },
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
            w-full
            flex
            items-center
            justify-between
            gap-2
            px-3
            py-2
            rounded-lg
            text-left
            text-[13px]
            font-medium
            transition-all
            duration-200
            mb-0.5
            last:mb-0

            ${
              isSelected
                ? "bg-black text-white"
                : "text-black/70 hover:bg-black/5 hover:text-black"
            }
          `}
        >
          <div className="flex items-center gap-2">
            <span className="text-[16px]">{item.flag}</span>
            <span>{item.label}</span>
          </div>
          
          {isSelected && (
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
          )}
        </button>
      );
    })}
  </div>
</div>
  <div className="flex items-center gap-2 -mt-0.2">
    <span>{t.hcmc}</span>
    <span className="text-[10px] animate-pulse">●</span>
    <span>{time}</span>
  </div>

</div>
  <button
    onMouseEnter={() =>
      window.dispatchEvent(
        new CustomEvent("cursor-change", { detail: "sound" })
      )
    }
    onMouseLeave={() =>
      window.dispatchEvent(
        new CustomEvent("cursor-change", { detail: "default" })
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
<div
  className={`lg:hidden overflow-hidden transition-all duration-500 ${
    mobileMenu
      ? "max-h-[600px] opacity-100 py-6"
      : "max-h-0 opacity-0"
  }`}
>
  <div className="px-4 flex flex-col gap-5 text-[14px] font-medium">

    <Link href={"/projects"}>
      {t.projects} (17)
    </Link>

    <div>
      {t.journal}
    </div>

    <Link href={"/about"}>
      {t.about}
    </Link>

    <Link href={"/contact"}>
      {t.contact}
    </Link>

    <div className="border-t pt-5 flex flex-col gap-4 text-black/70">

      <a href="tel:+84925555958">
        (84) 92 5555 958
      </a>

      <a href="mailto:buihaitrong.dev@gmail.com">
        hello@habcreative.com
      </a>

      <a target="_blank" href="https://vn.linkedin.com/" onClick={closeAllMenus}>
        LinkedIn
      </a>

      <a target="_blank" href="https://x.com/" onClick={closeAllMenus}>
        Twitter (X)
      </a>

      <a target="_blank" href="https://dribbble.com/" onClick={closeAllMenus}>
        Dribbble
      </a>
      <div className="border-t pt-4 mt-1 flex items-center justify-between">
        <span className="text-black/50 text-[13px]">{t.language}</span>
        
        <div ref={mobileLangRef} className="relative">
          <button
            onClick={() => setOpenMobileLang(!openMobileLang)}
            className="
              flex
              items-center
              gap-2
              text-[13px]
              font-medium
              text-black
              transition-all
              duration-300
              py-1
              px-2
              rounded-lg
              bg-black/5
            "
          >
            <Globe size={14} className="text-black/60" />

            <span className="text-[14px] ml-0.5">
              {lang === "vi" && "🇻🇳"}
              {lang === "en" && "🇺🇸"}
              {lang === "de" && "🇩🇪"}
            </span>

            <ChevronDown
              size={13}
              className={`
                text-black/40
                transition-transform
                duration-300
                ${openMobileLang ? "rotate-180" : ""}
              `}
            />
</button>
          <div
            className={`
              absolute
              bottom-full
              mb-2
              left-0/2
              -translate-x-1/2
              w-[140px]
              bg-white
              border
              border-black/10
              rounded-xl
              shadow-xl
              p-1.5
              z-[9999]
              transition-all
              duration-300
              origin-bottom

              ${
                openMobileLang
                  ? "opacity-100 visible translate-y-0 scale-100"
                  : "opacity-0 invisible translate-y-2 scale-95"
              }
            `}
          >
            {[
              { code: "vi", label: "Vietnamese", flag: "🇻🇳" },
              { code: "en", label: "English", flag: "🇺🇸" },
              { code: "de", label: "German", flag: "🇩🇪" },
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
                    w-full
                    flex
                    items-center
                    justify-between
                    gap-2
                    px-3
                    py-2
                    rounded-lg
                    text-left
                    text-[13px]
                    font-medium
                    transition-all
                    duration-200
                    mb-0.5
                    last:mb-0

                    ${
                      isSelected
                        ? "bg-black text-white"
                        : "text-black/70 hover:bg-black/5 hover:text-black"
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[16px]">{item.flag}</span>
                    <span>{item.label}</span>
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