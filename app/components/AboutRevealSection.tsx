"use client";

import {
  motion,
  useScroll,
  useTransform,
} from "framer-motion";

import { useRef } from "react";

export default function AboutRevealSection() {
    const text = `
Whether it’s building a distinctive brand identity, designing interfaces that feel effortless, or developing websites that perform seamlessly, my work is about turning vision into tangible results. Each service is shaped to not only solve problems but to create opportunities for growth, clarity, and impact.
`;

const words = text.split(" ");
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });


  const line1 = useTransform(
    scrollYProgress,
    [0.08, 0.18],
    [0.08, 1]
  );

  const line2 = useTransform(
    scrollYProgress,
    [0.22, 0.32],
    [0.08, 1]
  );

  const line3 = useTransform(
    scrollYProgress,
    [0.36, 0.46],
    [0.08, 1]
  );

  const line4 = useTransform(
    scrollYProgress,
    [0.5, 0.6],
    [0.08, 1]
  );

  /*
  ========================================
  GRADIENT BLOBS
  ========================================
  */

  const blob1Y = useTransform(
    scrollYProgress,
    [0, 1],
    [-100, 100]
  );

  const blob2Y = useTransform(
    scrollYProgress,
    [0, 1],
    [100, -100]
  );

  const blobOpacity = useTransform(
    scrollYProgress,
    [0, 0.3],
    [0.3, 0.8]
  );

  return (
    <section
      ref={ref}
      className="relative h-[320vh] bg-black"
    >
      <div className="sticky top-0 h-screen overflow-hidden bg-black">


        <div className="absolute inset-0 overflow-hidden">

          {/* RED GLOW */}
          <motion.div
            style={{
              y: blob1Y,
              opacity: blobOpacity,
            }}
            className="
              absolute
              left-[-10%]
              top-[-10%]
              h-[700px]
              w-[700px]
              rounded-full
              bg-red-500/30
              blur-[140px]
            "
          />

          {/* PURPLE GLOW */}
          <motion.div
            style={{
              y: blob2Y,
              opacity: blobOpacity,
            }}
            className="
              absolute
              right-[-10%]
              bottom-[-10%]
              h-[700px]
              w-[700px]
              rounded-full
              bg-purple-500/30
              blur-[140px]
            "
          />

          {/* BLUE CENTER */}
          <motion.div
            style={{
              opacity: blobOpacity,
            }}
            className="
              absolute
              left-1/2
              top-1/2
              h-[500px]
              w-[500px]
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              bg-blue-500/20
              blur-[120px]
            "
          />

          {/* GRID */}
          <div
            className="
              absolute inset-0
              opacity-[0.03]
              [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)]
              [background-size:80px_80px]
            "
          />
        </div>

        {/* ===================================== */}
        {/* CONTENT */}
        {/* ===================================== */}

        <div
          className="
            relative z-10
            flex h-full
            items-center
            justify-center
            px-6
          "
        >
          <div className="max-w-[1100px]">

            {/* TAG */}
            <div
              className="
                mt-10
                mb-3
                inline-flex
                rounded-full
                border border-white/10
                bg-white/5
                px-5 py-2
                backdrop-blur-xl
              "
            >
              <span
                className="
                  text-xs
                  uppercase
                  tracking-[0.3em]
                  text-white
                "
              >
                What I Do
              </span>
            </div>

<div
  className="
    
    max-w-auto
    text-[30px]
    md:text-[34px]
    lg:text-[38px]
    font-semibold
    leading-normal
    tracking-[-0.05em]
    flex flex-wrap
  "
>
  {words.map((word, i) => { 

    const start = i / words.length * 0.85;
const end = start + 0.12;

// const start = i / words.length;
// const end = start + 0.03;

    const color = useTransform(
      scrollYProgress,
      [start, end],
      [
        "rgba(255,255,255,0.08)",
        "rgba(255,255,255,1)"
      ]
    );

    return (
      <motion.span
        key={i}
        style={{ color }}
        className="mr-[0.25em]"
      >
        {word}
      </motion.span>
    );
  })}
</div>

          </div>
        </div>

      </div>
    </section>
  );
}