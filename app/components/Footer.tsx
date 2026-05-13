"use client";

import { motion, Variants } from "framer-motion";

export default function FooterPage() {

  // GLOBAL container (cho layout chung)
  const container: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  // GLOBAL item
  const item: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  // SOCIAL container (chậm hơn + riêng biệt)
  const socialContainer: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.25,
        delayChildren: 0.2,
      },
    },
  };

  // SOCIAL item (mượt + rõ nhịp)
  const socialItem: Variants = {
    hidden: {
      opacity: 0,
      y: 25,
    },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.footer
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      variants={container}
      className="text-black pt-16 pb-4 px-4 md:px-4 lg:px-4"
    >

      {/* Top border */}
      <motion.div variants={item} className="border-t border-gray-300 mb-10" />

      {/* Top section */}
      <motion.div variants={container} className="grid grid-cols-1 md:grid-cols-3 items-start gap-8 md:gap-0">

        {/* LEFT - Newsletter */}
        <motion.div variants={item} className="text-center md:text-left">
          <p className="text-xs text-gray-600 mb-6">
            Subscribe to my newsletter
          </p>

          <div className="mb-4 flex justify-center md:justify-start">
            <input
            placeholder="Email *"
              type="email"
              className="w-full max-w-[300px] border-b border-gray-300 bg-transparent outline-none pb-2 focus:border-gray-500"
            />
          </div>

          <button                   onMouseEnter={() =>
  window.dispatchEvent(
    new CustomEvent("cursor-change", { detail: "userdefault" })
  )
}
  onMouseLeave={() =>
  window.dispatchEvent(
    new CustomEvent("cursor-change", { detail: "default" })
  )
} className="mt-2 bg-black text-white w-full max-w-[300px] py-4 rounded-full text-sm cursor-none transition-all duration-300
    hover:bg-white
    hover:text-black
    hover:border-black border border-black ">
            Subscribe
          </button>
        </motion.div>

        {/* CENTER - SOCIAL */}
<motion.div variants={item} className="flex flex-col items-center mt-8 md:mt-0">

  <p className="text-xs text-gray-600 mb-2">
    Social
  </p>

  <motion.div
    variants={socialContainer}
    className="text-[28px] font-bold text-left group ml-0 md:ml-18 pl-0 md:pl-6"
  >

    <motion.p
      variants={socialItem}
      onMouseEnter={() =>
        window.dispatchEvent(
          new CustomEvent("cursor-change", { detail: "social" })
        )
      }
      onMouseLeave={() =>
        window.dispatchEvent(
          new CustomEvent("cursor-change", { detail: "default" })
        )
      }
      className="
        cursor-none
        transition-all duration-300
        group-hover:text-gray-300
        hover:!text-black
        text-center md:text-left
      "
    >
      Email
    </motion.p>

    <motion.p
      variants={socialItem}
      onMouseEnter={() =>
        window.dispatchEvent(
          new CustomEvent("cursor-change", { detail: "social" })
        )
      }
      onMouseLeave={() =>
        window.dispatchEvent(
          new CustomEvent("cursor-change", { detail: "default" })
        )
      }
      className="
        cursor-none
        transition-all duration-300
        group-hover:text-gray-300
        hover:!text-black
        text-center md:text-left 
      "
    >
      LinkedIn
    </motion.p>

    <motion.p
      variants={socialItem}
      onMouseEnter={() =>
        window.dispatchEvent(
          new CustomEvent("cursor-change", { detail: "social" })
        )
      }
      onMouseLeave={() =>
        window.dispatchEvent(
          new CustomEvent("cursor-change", { detail: "default" })
        )
      }
      className="
        cursor-none
        transition-all duration-300
        group-hover:text-gray-300
        hover:!text-black
        text-center md:text-left
      "
    >
      Twitter (X)
    </motion.p>

    <motion.p
      variants={socialItem}
      onMouseEnter={() =>
        window.dispatchEvent(
          new CustomEvent("cursor-change", { detail: "social" })
        )
      }
      onMouseLeave={() =>
        window.dispatchEvent(
          new CustomEvent("cursor-change", { detail: "default" })
        )
      }
      className="
        cursor-none
        transition-all duration-300
        group-hover:text-gray-300
        hover:!text-black
        text-center md:text-left
      "
    >
      Dribbble
    </motion.p>

  </motion.div>

</motion.div>

        {/* RIGHT - Back to top */}
        <motion.div variants={item} className="flex justify-center md:justify-end mt-8 md:mt-0">
          <button                   onMouseEnter={() =>
  window.dispatchEvent(
    new CustomEvent("cursor-change", { detail: "userdefault" })
  )
}
  onMouseLeave={() =>
  window.dispatchEvent(
    new CustomEvent("cursor-change", { detail: "default" })
  )
}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-xs cursor-none hover:text-gray-300"
          >
            Back to top
          </button>
        </motion.div>

      </motion.div>

      {/* Bottom section */}
      <motion.div
        variants={container}
        className="mt-20 pt-6 flex flex-col md:flex-row justify-between items-center md:items-end gap-6 md:gap-0 text-xs font-medium"
      >

        {/* Left */}
        <motion.div variants={item} className="text-center md:text-left">
          <p className="cursor-pointer hover:text-gray-300">©2026 Tibirox™.</p>
          <p className="cursor-pointer hover:text-gray-300">All rights reserved.</p>
        </motion.div>

        {/* Center */}
        <motion.div variants={item} className="text-cebter">
          <p className="cursor-pointer hover:text-gray-300">Privacy</p>
          <p className="cursor-pointer hover:text-gray-300">Terms</p>
        </motion.div>

        {/* Right */}
        <motion.div variants={item} className="text-center md:text-right">
          <p className="cursor-pointer hover:text-gray-300">Built in Tibirox</p>
          <p className="cursor-pointer hover:text-gray-300">Created by Bht</p>
        </motion.div>

      </motion.div>

    </motion.footer>
  );
}