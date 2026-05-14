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
    <div className="min-h-screen pt-40 px-4">

      <div className="flex justify-between mb-8">
        <p className="max-w-[520px] leading-snug font-bold text-[24px]">
          Product design, experiences, websites, and brands — design stories from around the globe
        </p>

        <p className="text-[24px] font-bold">
          '19 — 26
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 gap-y-6">

        {/* ITEM 1 */}
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
              className="w-full h-[520px] object-cover cursor-none"
              variants={imgVariants}
            />

            {/* <motion.span 
              className="absolute top-2 left-2 text-gray-500 text-4xl mix-blend-difference"
              variants={numberVariants}
              transition={numberTransition}
            >
              '01
            </motion.span> */}
          </Link>

          <div className="mt-3 px-4">
            <p className="text-lg">The Beverly, HCMC</p> 

            <motion.p
              variants={text2Variants}
              transition={smooth}
              className="text-sm text-gray-500"
            >
              Vingroup 
            </motion.p>
          </div>
        </motion.div>

        {/* ITEM 2 */}
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
              className="w-full h-[520px] object-cover cursor-none"
              variants={imgVariants}
            />

            {/* <motion.span
              className="absolute top-2 left-2 text-gray-500 text-4xl mix-blend-difference"
              variants={numberVariants}
              transition={numberTransition}
            >
              '02
            </motion.span> */}
          </Link>

          <div className="mt-3 px-4">
            <p className="text-lg">Le Palmier Ho Tram</p>

            <motion.p
              variants={text2Variants}
              transition={smooth}
              className="text-sm text-gray-500"
            >
              Dong Tay Holding
            </motion.p>
          </div>
        </motion.div>

        {/* ITEM 3 */}
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
              className="w-full h-[520px] object-cover cursor-none"
              variants={imgVariants}
            />

            {/* <motion.span
              className="absolute top-2 left-2 text-gray-500 text-4xl mix-blend-difference"
              variants={numberVariants}
              transition={numberTransition}
            >
              '03
            </motion.span> */}
          </Link>

          <div className="mt-3 px-4">
            <p className="text-lg">Beer Club Z70</p>

            <motion.p
              variants={text2Variants}
              transition={smooth}
              className="text-sm text-gray-500"
            >
              Beer Club Z70
            </motion.p>
          </div>
        </motion.div>

        {/* ITEM 4 */}
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
              className="w-full h-[520px] object-cover cursor-none"
              variants={imgVariants}
            />

{/* 
            <motion.span
              className="absolute top-2 left-2 text-gray-500 text-4xl mix-blend-difference"
              variants={numberVariants}
              transition={numberTransition}
            >
              '04
            </motion.span> */}
          </Link>

          <div className="mt-3 px-4">
            <p className="text-lg">Sunneva Island Da Nang</p>

            <motion.p
              variants={text2Variants}
              transition={smooth}
              className="text-sm text-gray-500"
            >
              Sun Group
            </motion.p>
          </div>
        </motion.div>

        {/* ITEM 5 */}
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
              className="w-full h-[520px] object-cover cursor-none"
              variants={imgVariants}
            />

            {/* <motion.span
              className="absolute top-2 left-2 text-gray-500 text-4xl mix-blend-difference"
              variants={numberVariants}
              transition={numberTransition}
            >
              '05
            </motion.span> */}
          </Link>

          <div className="mt-3 px-4">
            <p className="text-lg">Miss Thu Restaurant</p>

            <motion.p
              variants={text2Variants}
              transition={smooth}
              className="text-sm text-gray-500"
            >
              Miss Thu
            </motion.p>
          </div>
        </motion.div>

        {/* ITEM 6 */}
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
              className="w-full h-[520px] object-cover cursor-none"
              variants={imgVariants}
            />

            {/* <motion.span
              className="absolute top-2 left-2 text-gray-500 text-4xl mix-blend-difference"
              variants={numberVariants}
              transition={numberTransition}
            >
              '06
            </motion.span> */}
          </Link>

          <div className="mt-3 px-4">
            <p className="text-lg">Flora Panorama</p>

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