"use client";

import { motion, Variants } from "framer-motion";
import { useLanguage } from "../i18n/LanguageContext";

export default function FooterPage() {
  const { t } = useLanguage();

  const container: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const socialContainer: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.25,
        delayChildren: 0.2,
      },
    },
  };

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
      <motion.div
        variants={item}
        className="border-t border-gray-300 mb-10"
      />

      <motion.div
        variants={container}
        className="
          grid
          grid-cols-1
          md:grid-cols-3
          items-start
          gap-10
          md:gap-6
          lg:gap-0
        "
      >
        {/* LEFT */}
        <motion.div
          variants={item}
          className="text-center md:text-left w-full"
        >
          <p className="text-xs text-gray-600 mb-6">
            {t.v7}
          </p>

          <div className="mb-4 flex justify-center md:justify-start">
            <input
              placeholder="Email *"
              type="email"
              className="
                w-full
                max-w-[300px]
                border-b
                border-gray-300
                bg-transparent
                outline-none
                pb-2
                focus:border-gray-500
              "
            />
          </div>

          <button
            onMouseEnter={() =>
              window.dispatchEvent(
                new CustomEvent("cursor-change", {
                  detail: "userdefault",
                })
              )
            }
            onMouseLeave={() =>
              window.dispatchEvent(
                new CustomEvent("cursor-change", {
                  detail: "default",
                })
              )
            }
            className="
              mt-2
              bg-black
              text-white
              w-full
              max-w-[300px]
              py-4
              rounded-full
              text-sm
              cursor-none
              transition-all
              duration-300
              hover:bg-white
              hover:text-black
              hover:border-black
              border
              border-black
            "
          >
            {t.sb}
          </button>
        </motion.div>

        {/* CENTER */}
        <motion.div
          variants={item}
className="flex flex-col items-center md:items-start mt-8 md:mt-0 ml-0 pl-0 md:ml-10 md:pl-10 lg:ml-28 lg:pl-28"
        >
          <p className="text-xs text-gray-600 mb-2">
            {t.v8}
          </p>

          <motion.div
  variants={socialContainer}
  className="
    text-[22px]
    sm:text-[24px]
    md:text-[28px]
    font-bold
    text-center md:text-left
    group
    w-full
    leading-tight
  "
>
  <motion.p
    variants={socialItem}
    onMouseEnter={() =>
      window.dispatchEvent(
        new CustomEvent("cursor-change", {
          detail: "social",
        })
      )
    }
    onMouseLeave={() =>
      window.dispatchEvent(
        new CustomEvent("cursor-change", {
          detail: "default",
        })
      )
    }
    className="
      cursor-none
      transition-all
      duration-300
      group-hover:text-gray-300
      hover:!text-black
      text-center md:text-left
      break-words
    "
  >
    Email
  </motion.p>

  <motion.p
    variants={socialItem}
    onMouseEnter={() =>
      window.dispatchEvent(
        new CustomEvent("cursor-change", {
          detail: "social",
        })
      )
    }
    onMouseLeave={() =>
      window.dispatchEvent(
        new CustomEvent("cursor-change", {
          detail: "default",
        })
      )
    }
    className="
      cursor-none
      transition-all
      duration-300
      group-hover:text-gray-300
      hover:!text-black
      text-center md:text-left
      break-words
    "
  >
    LinkedIn
  </motion.p>

  <motion.p
    variants={socialItem}
    onMouseEnter={() =>
      window.dispatchEvent(
        new CustomEvent("cursor-change", {
          detail: "social",
        })
      )
    }
    onMouseLeave={() =>
      window.dispatchEvent(
        new CustomEvent("cursor-change", {
          detail: "default",
        })
      )
    }
    className="
      cursor-none
      transition-all
      duration-300
      group-hover:text-gray-300
      hover:!text-black
      text-center md:text-left
      break-words
    "
  >
    Twitter (X)
  </motion.p>

  <motion.p
    variants={socialItem}
    onMouseEnter={() =>
      window.dispatchEvent(
        new CustomEvent("cursor-change", {
          detail: "social",
        })
      )
    }
    onMouseLeave={() =>
      window.dispatchEvent(
        new CustomEvent("cursor-change", {
          detail: "default",
        })
      )
    }
    className="
      cursor-none
      transition-all
      duration-300
      group-hover:text-gray-300
      hover:!text-black
      text-center md:text-left
      break-words
    "
  >
    Dribbble
  </motion.p>
</motion.div>
        </motion.div>

        {/* RIGHT */}
        <motion.div
          variants={item}
          className="
            flex
            justify-center
            md:justify-end
            mt-8
            md:mt-0
            w-full
          "
        >
          <button
            onMouseEnter={() =>
              window.dispatchEvent(
                new CustomEvent("cursor-change", {
                  detail: "userdefault",
                })
              )
            }
            onMouseLeave={() =>
              window.dispatchEvent(
                new CustomEvent("cursor-change", {
                  detail: "default",
                })
              )
            }
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
            className="
              text-xs
              cursor-none
              hover:text-gray-300
              transition-colors
              duration-300
            "
          >
            {t.v9}
          </button>
        </motion.div>
      </motion.div>

      <motion.div
        variants={container}
        className="
          mt-20
          pt-6
          flex
          flex-col
          md:flex-row
          justify-between
          items-center
          md:items-end
          gap-6
          md:gap-0
          text-xs
          font-medium
        "
      >
        {/* LEFT */}
        <motion.div
          variants={item}
          className="text-center md:text-left"
        >
          <p className="cursor-pointer hover:text-gray-300">
            {t.v10}
          </p>
        </motion.div>

        {/* RIGHT */}
        <motion.div
          variants={item}
          className="text-center md:text-right"
        >
          <p className="cursor-pointer hover:text-gray-300">
            ©2026 HAB Creative.
          </p>
        </motion.div>
      </motion.div>
    </motion.footer>
  );
}