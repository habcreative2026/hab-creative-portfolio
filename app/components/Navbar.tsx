"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useScroll } from "framer-motion";
import { useTime } from "../useTime";

export default function NavbarPage() {
  const [playing, setPlaying] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [allowTransition, setAllowTransition] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const time = useTime("Asia/Ho_Chi_Minh"); 

  const { scrollY } = useScroll();

  useEffect(() => {
  audioRef.current = new Audio("/music.mp3");
  audioRef.current.loop = true;
  audioRef.current.volume = 0.3;

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

// NavbarPage.tsx

const toggleSound = () => {
  if (!audioRef.current) return;

  const newState = !playing;
  setPlaying(newState);

  // Phát sự kiện để Cursor cập nhật
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

      <div className="mx-auto flex flex-row items-start justify-between text-[12px] font-medium leading-none tracking-tight px-4 gap-50">
        
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
} className="text-[22px] font-bold leading-none tracking-tighter uppercase mt-1.5 cursor-none">
            <img 
            src="/logo_bhq.png"
            alt="logo"
            className="w-15 h-15 object-cover"
            />
            {/* BHQ */}
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
            <div className="lg:flex items-center gap-6 text-black/80">
              <a
  href="tel:+84973112480"
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
  (84) 973112480
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
                buihaitrong.dev@gmail.com
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
  Available for hire
</Link>
            </div>
          </div>

          {/* MENU SECTION */}
          <div
            className={`flex items-start gap-x-8 pt-3 ${
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
                    Projects (17)
                  </Link>
                  <div className="flex flex-col gap-4 items-end">
                    <Link href={"/journal"}
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
                    className="cursor-none transition">Journal</Link>
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
                    className="cursor-none transition">About</Link>
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
                    href={"/contact"} className="cursor-none transition">Contact</Link>
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
                  Projects (17)
                </Link>
                <Link href={"/journal"} 
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
                className="cursor-none transition">Journal</Link>
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
                className="cursor-none transition">About</Link>
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
                href={"/contact"} className="cursor-none transition">Contact</Link>
              </div>
            )}
          </div>
        </div>

        {/* TIME + SOUND */}
        <div className="flex items-center gap-4 z-30 bg-white pt-3">
          <div className="flex items-center gap-2 whitespace-nowrap text-black/80">
            <span>HCMC</span>
            <span className="text-[10px] animate-pulse">●</span>
            <span>{time}</span>
          </div>

          <button onMouseEnter={() =>
  window.dispatchEvent(
    new CustomEvent("cursor-change", { detail: "sound" })
  )
}
onMouseLeave={() =>
  window.dispatchEvent(
    new CustomEvent("cursor-change", { detail: "default" })
  )
} onClick={toggleSound} className="flex items-center justify-center h-[14px] w-[30px] cursor-pointer cursor-none">
            <div className={`flex items-center transition-all duration-500 ${playing ? "gap-[2px]" : "gap-0"}`}>
              {[...Array(7)].map((_, i) => (
                <span
                  key={i}
                  className={`bg-black transition-all duration-500 ${
                    playing ? "w-[1.1px] animate-sound-center rounded-full" : "w-[4px] h-[1px]"
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
    </header>
  );
}