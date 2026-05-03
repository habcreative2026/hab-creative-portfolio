"use client";

import { motion, type Transition } from "framer-motion";

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
          '16 — 25
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 gap-y-10">

        {/* ITEM 1 */}
        <motion.div initial="rest" whileHover="hover" animate="rest" className="cursor-pointer">
          <div className="relative overflow-hidden">
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
              src="https://framerusercontent.com/images/KEjcFcCuYenJ9eQP0EZizbmck.webp?width=1200"
              className="w-full h-[520px] object-cover cursor-none"
              variants={imgVariants}
            />

            <motion.span
              className="absolute top-2 left-2 text-gray-500 text-4xl mix-blend-difference"
              variants={numberVariants}
              transition={numberTransition}
            >
              '01
            </motion.span>
          </div>

          <div className="mt-3">
            <p className="text-lg">Lightspeed, UK</p>

            <motion.p
              variants={text2Variants}
              transition={smooth}
              className="text-sm text-gray-500"
            >
              Product Design · Web Design
            </motion.p>
          </div>
        </motion.div>

        {/* ITEM 2 */}
        <motion.div initial="rest" whileHover="hover" animate="rest" className="cursor-pointer">
          <div className="relative overflow-hidden">
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
              src="https://framerusercontent.com/images/N81w6fWVhPDX2mWpO8SylHjEKok.webp?width=1200"
              className="w-full h-[520px] object-cover cursor-none"
              variants={imgVariants}
            />

            <motion.span
              className="absolute top-2 left-2 text-gray-500 text-4xl mix-blend-difference"
              variants={numberVariants}
              transition={numberTransition}
            >
              '02
            </motion.span>
          </div>

          <div className="mt-3">
            <p className="text-lg">CloudWatch, Norway</p>

            <motion.p
              variants={text2Variants}
              transition={smooth}
              className="text-sm text-gray-500"
            >
              Web Design · Development
            </motion.p>
          </div>
        </motion.div>

        {/* ITEM 3 */}
                <motion.div initial="rest" whileHover="hover" animate="rest" className="cursor-pointer">
          <div className="relative overflow-hidden">
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
              src="https://framerusercontent.com/images/N81w6fWVhPDX2mWpO8SylHjEKok.webp?width=1200"
              className="w-full h-[520px] object-cover cursor-none"
              variants={imgVariants}
            />

            <motion.span
              className="absolute top-2 left-2 text-gray-500 text-4xl mix-blend-difference"
              variants={numberVariants}
              transition={numberTransition}
            >
              '03
            </motion.span>
          </div>

          <div className="mt-3">
            <p className="text-lg">CloudWatch, Norway</p>

            <motion.p
              variants={text2Variants}
              transition={smooth}
              className="text-sm text-gray-500"
            >
              Web Design · Development
            </motion.p>
          </div>
        </motion.div>

        {/* ITEM 4 */}
                <motion.div initial="rest" whileHover="hover" animate="rest" className="cursor-pointer">
          <div className="relative overflow-hidden">
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
              src="https://framerusercontent.com/images/N81w6fWVhPDX2mWpO8SylHjEKok.webp?width=1200"
              className="w-full h-[520px] object-cover cursor-none"
              variants={imgVariants}
            />

            <motion.span
              className="absolute top-2 left-2 text-gray-500 text-4xl mix-blend-difference"
              variants={numberVariants}
              transition={numberTransition}
            >
              '04
            </motion.span>
          </div>

          <div className="mt-3">
            <p className="text-lg">CloudWatch, Norway</p>

            <motion.p
              variants={text2Variants}
              transition={smooth}
              className="text-sm text-gray-500"
            >
              Web Design · Development
            </motion.p>
          </div>
        </motion.div>

        {/* ITEM 5 */}
                <motion.div initial="rest" whileHover="hover" animate="rest" className="cursor-pointer">
          <div className="relative overflow-hidden">
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
              src="https://framerusercontent.com/images/N81w6fWVhPDX2mWpO8SylHjEKok.webp?width=1200"
              className="w-full h-[520px] object-cover cursor-none"
              variants={imgVariants}
            />

            <motion.span
              className="absolute top-2 left-2 text-gray-500 text-4xl mix-blend-difference"
              variants={numberVariants}
              transition={numberTransition}
            >
              '05
            </motion.span>
          </div>

          <div className="mt-3">
            <p className="text-lg">CloudWatch, Norway</p>

            <motion.p
              variants={text2Variants}
              transition={smooth}
              className="text-sm text-gray-500"
            >
              Web Design · Development
            </motion.p>
          </div>
        </motion.div>

        {/* ITEM 6 */}
                <motion.div initial="rest" whileHover="hover" animate="rest" className="cursor-pointer">
          <div className="relative overflow-hidden">
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
              src="https://framerusercontent.com/images/N81w6fWVhPDX2mWpO8SylHjEKok.webp?width=1200"
              className="w-full h-[520px] object-cover cursor-none"
              variants={imgVariants}
            />

            <motion.span
              className="absolute top-2 left-2 text-gray-500 text-4xl mix-blend-difference"
              variants={numberVariants}
              transition={numberTransition}
            >
              '06
            </motion.span>
          </div>

          <div className="mt-3">
            <p className="text-lg">CloudWatch, Norway</p>

            <motion.p
              variants={text2Variants}
              transition={smooth}
              className="text-sm text-gray-500"
            >
              Web Design · Development
            </motion.p>
          </div>
        </motion.div>
        
        {/* ITEM 7 */}
                <motion.div initial="rest" whileHover="hover" animate="rest" className="cursor-pointer">
          <div className="relative overflow-hidden">
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
              src="https://framerusercontent.com/images/N81w6fWVhPDX2mWpO8SylHjEKok.webp?width=1200"
              className="w-full h-[520px] object-cover cursor-none"
              variants={imgVariants}
            />

            <motion.span
              className="absolute top-2 left-2 text-gray-500 text-4xl mix-blend-difference"
              variants={numberVariants}
              transition={numberTransition}
            >
              '07
            </motion.span>
          </div>

          <div className="mt-3">
            <p className="text-lg">CloudWatch, Norway</p>

            <motion.p
              variants={text2Variants}
              transition={smooth}
              className="text-sm text-gray-500"
            >
              Web Design · Development
            </motion.p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}