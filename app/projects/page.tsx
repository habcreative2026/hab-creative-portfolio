"use client";

import { motion, type Transition } from "framer-motion";
import Link from "next/link";

export default function ProjectPage() {
  const imgVariants = {
    rest: { scale: 1 },
    hover: { scale: 1 }
  };

  const numberVariants = {
    rest: {
      opacity: 0,
      scale: 0.5
    },
    hover: {
      opacity: 1,
      scale: 1
    }
  };

  const text2Variants = {
    rest: {
      opacity: 0,
      y: 0
    },
    hover: {
      opacity: 1,
      y: 0
    }
  };

  const smooth: Transition = {
    duration: 0.6,
    ease: [0.16, 1, 0.3, 1]
  };

  const numberTransition: Transition = {
    type: "spring",
    stiffness: 120,
    damping: 14
  };

  return (
    <div className="min-h-screen pt-28 md:pt-40 px-4">

      <div className="flex flex-col md:flex-row justify-between gap-4 md:gap-0 mb-8">
        <p className="max-w-[600px] leading-snug font-bold text-[18px] md:text-[24px]">
          Product design, experiences, websites, and brands — design stories from around the globe
        </p>

        <p className="text-[18px] md:text-[24px] font-bold">
          '19 — 26
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 gap-y-6">

        <motion.div initial="rest" whileHover="hover" animate="rest" className="cursor-pointer">
          <Link href={"/projects/the-beverly#top"} className="relative overflow-hidden">
            <motion.img
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
              className="w-full h-[300px] sm:h-[420px] md:h-[520px] object-cover cursor-none"
              variants={imgVariants}
            />
          </Link>

          <div className="mt-3 px-2 md:px-4">
            <p className="text-base md:text-lg">The Beverly, HCMC</p>

            <motion.p
              variants={text2Variants}
              transition={smooth}
              className="text-sm text-gray-500"
            >
              Vingroup
            </motion.p>
          </div>
        </motion.div>

        <motion.div initial="rest" whileHover="hover" animate="rest" className="cursor-pointer">
          <Link href={"/projects/Le-Palmier-Ho-Tram#top"} className="relative overflow-hidden">
            <motion.img
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
              className="w-full h-[300px] sm:h-[420px] md:h-[520px] object-cover cursor-none"
              variants={imgVariants}
            />
          </Link>

          <div className="mt-3 px-2 md:px-4">
            <p className="text-base md:text-lg">Le Palmier Ho Tram</p>

            <motion.p
              variants={text2Variants}
              transition={smooth}
              className="text-sm text-gray-500"
            >
              Dong Tay Holding
            </motion.p>
          </div>
        </motion.div>

        <motion.div initial="rest" whileHover="hover" animate="rest" className="cursor-pointer">
          <Link href={"/projects/Beer-Club-Z70#top"} className="relative overflow-hidden">
            <motion.img
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
              className="w-full h-[300px] sm:h-[420px] md:h-[520px] object-cover cursor-none"
              variants={imgVariants}
            />
          </Link>

          <div className="mt-3 px-2 md:px-4">
            <p className="text-base md:text-lg">Beer Club Z70</p>

            <motion.p
              variants={text2Variants}
              transition={smooth}
              className="text-sm text-gray-500"
            >
              Beer Club Z70
            </motion.p>
          </div>
        </motion.div>

        <motion.div initial="rest" whileHover="hover" animate="rest" className="cursor-pointer">
          <Link href={"/projects/Sunneva-Island-Da-Nang#top"} className="relative overflow-hidden">
            <motion.img
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
              className="w-full h-[300px] sm:h-[420px] md:h-[520px] object-cover cursor-none"
              variants={imgVariants}
            />
          </Link>

          <div className="mt-3 px-2 md:px-4">
            <p className="text-base md:text-lg">Sunneva Island Da Nang</p>

            <motion.p
              variants={text2Variants}
              transition={smooth}
              className="text-sm text-gray-500"
            >
              Sun Group
            </motion.p>
          </div>
        </motion.div>

        <motion.div initial="rest" whileHover="hover" animate="rest" className="cursor-pointer">
          <Link href={"/projects/Miss-Thu-Restaurant#top"} className="relative overflow-hidden">
            <motion.img
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
              className="w-full h-[300px] sm:h-[420px] md:h-[520px] object-cover cursor-none"
              variants={imgVariants}
            />
          </Link>

          <div className="mt-3 px-2 md:px-4">
            <p className="text-base md:text-lg">Miss Thu Restaurant</p>

            <motion.p
              variants={text2Variants}
              transition={smooth}
              className="text-sm text-gray-500"
            >
              Miss Thu
            </motion.p>
          </div>
        </motion.div>

        <motion.div initial="rest" whileHover="hover" animate="rest" className="cursor-pointer">
          <Link href={"/projects/eightball#top"} className="relative overflow-hidden">
            <motion.img
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
              className="w-full h-[300px] sm:h-[420px] md:h-[520px] object-cover cursor-none"
              variants={imgVariants}
            />
          </Link>

          <div className="mt-3 px-2 md:px-4">
            <p className="text-base md:text-lg">Flora Panorama</p>

            <motion.p
              variants={text2Variants}
              transition={smooth}
              className="text-sm text-gray-500"
            >
              Nam Long Group
            </motion.p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}