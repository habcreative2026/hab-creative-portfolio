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

  /*
  ========================================
  BLOBS
  ========================================
  */

  const blob1Y = useTransform(
    scrollYProgress,
    [0, 1],
    [-180, 180]
  );

  const blob2Y = useTransform(
    scrollYProgress,
    [0, 1],
    [180, -180]
  );

  const blob3Y = useTransform(
    scrollYProgress,
    [0, 1],
    [-80, 80]
  );

  const blobOpacity = useTransform(
    scrollYProgress,
    [0, 0.4],
    [0.25, 0.9]
  );

  /*
  ========================================
  CURVE LINES
  ========================================
  */

  const curve1Y = useTransform(
    scrollYProgress,
    [0, 1],
    [-200, 220]
  );

  const curve2Y = useTransform(
    scrollYProgress,
    [0, 1],
    [220, -200]
  );

  const curve3Y = useTransform(
    scrollYProgress,
    [0, 1],
    [-120, 120]
  );

  const curveRotate = useTransform(
    scrollYProgress,
    [0, 1],
    [-6, 6]
  );

  return (
    <section
      ref={ref}
      className="relative h-[240vh] sm:h-[260vh] lg:h-[280vh] bg-black"
    >
      <div className="sticky top-0 h-screen overflow-hidden bg-black">

        {/* BACKGROUND */}
        <div className="absolute inset-0 overflow-hidden">

          {/* RED */}
          <motion.div
            style={{
              y: blob1Y,
              opacity: blobOpacity,
            }}
            className="
              absolute
              left-[-20%]
              top-[-10%]
              h-[260px]
              w-[260px]
              sm:h-[500px]
              sm:w-[500px]
              lg:h-[800px]
              lg:w-[800px]
              rounded-full
              bg-red-500/25
              blur-[90px]
              lg:blur-[160px]
            "
          />

          {/* PURPLE */}
          <motion.div
            style={{
              y: blob2Y,
              opacity: blobOpacity,
            }}
            className="
              absolute
              right-[-20%]
              bottom-[-10%]
              h-[260px]
              w-[260px]
              sm:h-[500px]
              sm:w-[500px]
              lg:h-[800px]
              lg:w-[800px]
              rounded-full
              bg-fuchsia-500/25
              blur-[90px]
              lg:blur-[160px]
            "
          />

          {/* BLUE */}
          <motion.div
            style={{
              y: blob3Y,
              opacity: blobOpacity,
            }}
            className="
              absolute
              left-1/2
              top-1/2
              h-[180px]
              w-[180px]
              sm:h-[380px]
              sm:w-[380px]
              lg:h-[600px]
              lg:w-[600px]
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              bg-cyan-400/20
              blur-[80px]
              lg:blur-[140px]
            "
          />

          {/* CURVE 1 */}
          <motion.div
            style={{
              y: curve1Y,
              rotate: curveRotate,
            }}
            className="
              absolute
              left-[-10%]
              top-[5%]
              w-[130%]
              h-[320px]
              sm:h-[500px]
              border
              border-white/10
              rounded-[100%]
            "
          />

          {/* CURVE 2 */}
          <motion.div
            style={{
              y: curve2Y,
              rotate: curveRotate,
            }}
            className="
              absolute
              right-[-10%]
              bottom-[5%]
              w-[130%]
              h-[320px]
              sm:h-[600px]
              border
              border-cyan-300/10
              rounded-[100%]
            "
          />

          {/* CURVE 3 */}
          <motion.div
            style={{
              y: curve3Y,
            }}
            className="
              absolute
              left-[-20%]
              top-[40%]
              w-[150%]
              h-[220px]
              sm:h-[400px]
              border
              border-fuchsia-300/10
              rounded-[100%]
              rotate-[8deg]
            "
          />

          {/* LIGHT LINE */}
          <motion.div
            style={{
              y: useTransform(
                scrollYProgress,
                [0, 1],
                [-200, 200]
              ),
            }}
            className="
              absolute
              left-1/2
              top-[-20%]
              h-[140%]
              w-[1px]
              bg-gradient-to-b
              from-transparent
              via-white/20
              to-transparent
              blur-sm
            "
          />

          {/* GRID */}
          <div
            className="
              absolute inset-0
              opacity-[0.03]
              [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)]
              [background-size:40px_40px]
              sm:[background-size:60px_60px]
              lg:[background-size:80px_80px]
            "
          />

          {/* DARK OVERLAY */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_25%,black)]" />

        </div>

        {/* CONTENT */}
        <div
          className="
            relative z-10
            flex h-full
            items-center
            justify-center
            px-4
            sm:px-6
            lg:px-10
          "
        >
          <div className="w-full max-w-[1200px]">

            {/* TAG */}
            <div
              className="
                mb-4
                inline-flex
                rounded-full
                border border-white/10
                bg-white/5
                px-4 py-2
                sm:px-5
                backdrop-blur-xl
              "
            >
              <span
                className="
                  text-[10px]
                  sm:text-xs
                  uppercase
                  tracking-[0.3em]
                  text-white
                "
              >
                What I Do
              </span>
            </div>

            {/* TEXT */}
            <div
              className="
                max-w-full
                text-[22px]
                leading-[1.45]
                sm:text-[30px]
                md:text-[38px]
                lg:text-[34px]
                font-semibold
                tracking-[-0.05em]
                flex flex-wrap
              "
            >
              {words.map((word, i) => {

                const start =
                  (i / words.length) * 0.85;

                const end = start + 0.12;

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