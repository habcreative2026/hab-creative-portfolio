"use client";
import { motion, useScroll, useSpring, useTransform, Variants, useAnimationControls } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import AboutRevealSection from "./AboutRevealSection";
import Marquee from "./Marquee";
import { useLanguage } from "../i18n/LanguageContext";

export default function ContentPage( ) {
  const { t } = useLanguage()
const controls = useAnimationControls();

useEffect(() => {
  controls.start({
    x: ["0%", "-50%"],
    transition: {
      duration: 50,
      ease: "linear",
      repeat: Infinity,
    },
  });
}, []);
 
  const { scrollY } = useScroll();

  const titleYRaw = useTransform(scrollY, [0, 500], [0, -250]);

  const titleY = useSpring(titleYRaw, {
    stiffness: 80,
    damping: 20,
    mass: 0.5,
  });

  const contentYRaw = useTransform(scrollY, [0, 400], [40, 0]);

const contentY = useSpring(contentYRaw, {
  stiffness: 60,
  damping: 25,
  mass: 0.8,
});

  const number : Variants = {
    hidden: { opacity: 0, y: 40, scale: 0.9 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  const card = (delay: number): Variants => ({
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      delay,
    },
  },
});
  return (
    <>
    <nav className="sticky top-0 z-0 bg-white pt-20 lg:pt-40 overflow-hidden">
<motion.h1 
  style={{ y: titleY }} 
  className="flex flex-wrap items-center max-w-full font-bold tracking-tight text-[60px] sm:text-[48px] md:text-[120px] lg:text-[180px] leading-none uppercase px-3 sm:px-4"
>
  <span>HAB</span>

  <span className="flex-1 mx-3 sm:mx-4 overflow-hidden">
    <motion.span
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: "100%", opacity: 1 }}
      transition={{
        duration: 1.2,
        ease: [0.22, 1, 0.36, 1], 
        delay: 0.2,
      }}
      className="block h-[10px] sm:h-[10px] md:h-[20px] bg-black origin-left"
    />
  </span>

  <span className="w-full sm:w-auto mt-2 sm:mt-0">
    CREATIVE
  </span>
</motion.h1>
</nav>
    <motion.section 
      style={{ y: contentY  }}
      className="relative z-10 bg-white py-4 -mt-2 px-4"
    >
      <p
        className="text-[18px] sm:text-[16px] sm:text-[20px] md:text-[24px] md:text-[32px] font-bold leading-tight"
        style={{
  textIndent:
    typeof window !== "undefined" && window.innerWidth < 640
      ? "60px"
      : "70px",
}}
      >
        {t.text}
      </p>


<div className="mt-4">
<div className="flex items-end justify-between gap-4 mb-4 sm:mb-0">
  <div className="flex items-end gap-2 sm:gap-4 min-w-0">
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true, margin: "-40px" }}
      className="shrink-0"
    >
      <svg
        width="56"
        height="56"
        viewBox="0 0 96.117 96.189"
        fill="black"
        className="rotate-90 sm:w-[80px] sm:h-[80px] mb-2 min-[320px]:-mb-2"
      >
        <path d="M 96.117 0.005 L 96.112 96.189 L 75.656 96.175 L 75.661 34.961 L 14.529 96.083 L 0.063 81.617 L 61.219 20.461 L 0.005 20.466 L 0 0 Z" />
      </svg>
    </motion.div>
    <span
      className="
        hidden sm:block
        text-sm text-gray-500
        -mb-2
      "
    >
      {t.v1}
    </span>

  </div>

  <span
    className="
      text-[11px] sm:text-xs
      font-bold
      whitespace-nowrap
      mb-2 min-[320px]:-mb-2
    "
  >
    {t.v2}
  </span>

</div>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
    <Link href={"/projects/the-beverly#top"} className="relative overflow-hidden h-[320px] sm:h-[420px] md:h-[600px]">
      <img
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
        src="/project_the_beverly/vinhomes_grand_park.avif"
        className="w-full h-full object-cover cursor-none"
      />
      <span className="absolute bottom-3 left-3 text-white text-[16px] sm:text-[20px] md:text-[24px] mix-blend-difference">
        The Beverly, HCMC
      </span>
    </Link>

    <Link href={"/projects/Le-Palmier-Ho-Tram#top"} className="relative overflow-hidden h-[320px] sm:h-[420px] md:h-[600px]">
      <img 
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
        src="/project_le_palmier_ho_tram/avt.jpg"
        className="w-full h-full object-cover cursor-none"
      />
      <span className="absolute bottom-3 left-3 text-white text-[16px] sm:text-[20px] md:text-[24px] mix-blend-difference">
        Le Palmier Ho Tram
      </span>
    </Link>

    <Link href={"/projects/Beer-Club-Z70#top"} className="relative overflow-hidden h-[320px] sm:h-[420px] md:h-[600px]">
      <img
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
        src="/project_beer_club_z70/beer_club_z70.avif"
        className="w-full h-full object-cover cursor-none"
      />
            <span className="absolute bottom-3 left-3 text-white text-[16px] sm:text-[20px] md:text-[24px] mix-blend-difference">
        Beer Club Z70
      </span>
    </Link>
    <Link href={"/projects/Sunneva-Island-Da-Nang#top"} className="relative overflow-hidden h-[320px] sm:h-[420px] md:h-[600px]">
      <img
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
        src="/project_sunneva_island_da_nang/sunneva_island_da_nang.avif"
        className="w-full h-full object-cover cursor-none"
      />
            <span className="absolute bottom-3 left-3 text-white text-[16px] sm:text-[20px] md:text-[24px] mix-blend-difference">
        Sunneva Island Da Nang
      </span>
    </Link>
    <Link href={"/projects/Miss-Thu-Restaurant#top"} className="relative overflow-hidden h-[320px] sm:h-[420px] md:h-[600px]">
      <img
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
        src="/project_miss_thu_restaurant/avt.jpg"
        className="w-full h-full object-cover cursor-none"
      />
            <span className="absolute bottom-3 left-3 text-white text-[16px] sm:text-[20px] md:text-[24px] mix-blend-difference">
        Miss Thu Restaurant
      </span>
    </Link>
    <Link href={"/"} className="relative overflow-hidden h-[320px] sm:h-[420px] md:h-[600px]">
      <img
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
        src="/project_flora_panorama/flora_panorama.avif"
        className="w-full h-full object-cover cursor-none"
      />
            <span className="absolute bottom-3 left-3 text-white text-[16px] sm:text-[20px] md:text-[24px] mix-blend-difference">
        Flora Panorama
      </span>
    </Link>
  </div>
</div>

   <div className="mt-2">
      <Link href={"/projects"} className="flex justify-end mb-14 mt-4">
<span className="relative cursor-pointer text-[22px] sm:text-[30px] md:text-[42px] font-bold group">
  {t.project} (17)

  <span className="
    absolute left-0 bottom-0 h-[2px] w-full bg-black
    scale-x-0 origin-right
    transition-transform duration-300
    group-hover:scale-x-100 group-hover:origin-left
  "></span>
</span>
      </Link>

<Marquee/>
    </div>
  <AboutRevealSection  />
<motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      className="bg-white relative mt-28 pt-28 mb-20 w-full flex items-center justify-center"
    >
      <div className="relative w-[96px] h-[96px]">

        <motion.svg
          viewBox="0 0 96.117 96.189"
          className="absolute inset-0 w-full h-full translate-y-4 -translate-x-12"
          fill="black"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <path d="M 96.117 0.005 L 96.112 96.189 L 75.656 96.175 L 75.661 34.961 L 14.529 96.083 L 0.063 81.617 L 61.219 20.461 L 0.005 20.466 L 0 0 Z" />
        </motion.svg>

        <motion.svg
          viewBox="0 0 96.117 96.189"
          className="absolute inset-0 w-full h-full rotate-180 -translate-y-20 translate-x-12"
          fill="black"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <path d="M 96.117 0.005 L 96.112 96.189 L 75.656 96.175 L 75.661 34.961 L 14.529 96.083 L 0.063 81.617 L 61.219 20.461 L 0.005 20.466 L 0 0 Z" />
        </motion.svg>
        <div className="relative flex items-center justify-center">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
            className="
absolute right-1/2
-translate-y-[10px] sm:-translate-y-[25px]
-translate-x-[5px] sm:-translate-x-[15px]
text-right whitespace-nowrap
text-[34px] sm:text-[50px] md:text-[80px]
font-bold leading-none tracking-tighter
"
          >
            HAB
          </motion.h1>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.7, ease: "easeOut" }}
           className="
absolute left-1/2
translate-y-[25px] sm:translate-y-[55px]
translate-x-[2px] sm:translate-x-[5px]
text-left whitespace-nowrap
text-[34px] sm:text-[50px] md:text-[80px]
font-bold leading-none tracking-tighter min-[320px]:mt-4 min-[320px]:pt-4 min-[768px]:-mt-3
"
          >
            CRE
          </motion.h1>

        </div>
      </div>
    </motion.div>


 <section className="pt-10 mt-10">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start"
      >
        <div>
          <p className="text-sm text-gray-400">{t.v4}</p>

          <h2
            className="text-[20px] sm:text-[26px] md:text-[32px] font-bold leading-tight max-w-[700px] -mt-2"
            style={{
  textIndent:
    typeof window !== "undefined" && window.innerWidth < 640
      ? "50px"
      : "140px",
}}
          >
            {t.v5}
          </h2>
        </div>

        <motion.div
          variants={number}
          className="flex flex-col items-end"
        >
          <h2 className="text-[64px] sm:text-[100px] md:text-[160px] font-bold leading-none mt-4 sm:mt-10 pt-4 sm:pt-10">
            32+
          </h2>
          <span className="text-[28px] sm:text-[42px] md:text-[64px] text-gray-400 -mt-2 sm:-mt-6">
            {t.v4}
          </span>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
        <motion.div
          variants={card(0)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="relative h-[140px] sm:h-[180px] md:h-[220px] overflow-hidden"
        >
          <img
            src="/project_the_beverly/vinhomes_grand_park.avif"
            className="w-full h-full object-cover"
          />
        </motion.div>

        <motion.div
          variants={card(0.15)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="relative h-[140px] sm:h-[180px] md:h-[220px] overflow-hidden"
        >
          <img
            src="/project_le_palmier_ho_tram/avt.jpg"
            className="w-full h-full object-cover"
          />
        </motion.div>

        <motion.div
          variants={card(0.3)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="relative h-[140px] sm:h-[180px] md:h-[220px] overflow-hidden"
        >
          <img
            src="/project_beer_club_z70/beer_club_z70.avif"
            className="w-full h-full object-cover"
          />
        </motion.div>
        <motion.div
          variants={card(0.45)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="relative h-[140px] sm:h-[180px] md:h-[220px] overflow-hidden"
        >
          <img
            src="/project_sunneva_island_da_nang/sunneva_island_da_nang.avif"
            className="w-full h-full object-cover"
          />
        </motion.div>
      </div>

      <Link href={"/contact#top"} className="flex justify-end mt-10 mb-10">
        <span className="relative cursor-pointer text-[22px] sm:text-[30px] md:text-[42px] font-bold group">
          {t.v6}

          <span
            className="
              absolute left-0 bottom-0 h-[2px] w-full bg-black
              scale-x-0 origin-right
              transition-transform duration-300
              group-hover:scale-x-100 group-hover:origin-left
            "
          ></span>
        </span>
      </Link>
    </section>
    </motion.section>
    </>
  );
} 