"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";

interface LogoItem {
  _id: string;
  url: string;
}

const Marquee = () => {
  const controls = useAnimation();
  const [logos, setLogos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/marquee`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data.length > 0) {
          const urlList = res.data.map((item: LogoItem) => item.url);
          setLogos(urlList);
        }
      })
      .catch((err) => console.error("Lỗi đồng bộ dữ liệu Marquee:", err))
      .finally(() => setLoading(false));
  }, []);

  const tripleLogos = [...logos, ...logos, ...logos];

  useEffect(() => {
    if (logos.length > 0) {
      controls.start({
        x: "-33.333%",
        transition: {
          duration: 25,
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop",
        },
      });
    }
  }, [logos, controls]);

  if (loading || logos.length === 0) return null;

  return (
    <div className="w-full overflow-hidden mt-12 pt-12 mb-18">
      <div className="flex [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
        <motion.div
          className="flex flex-nowrap min-w-max"
          animate={controls}
          onHoverStart={() => controls.stop()}
          onHoverEnd={() => {
            controls.start({
              x: "-33.333%",
              transition: {
                duration: 25,
                ease: "linear",
                repeat: Infinity,
                repeatType: "loop",
              },
            });
          }}
        >
          {tripleLogos.map((logo, index) => (
            <motion.div
              key={index}
              whileHover={{
                opacity: 0.6,
                scale: 1.03,
                transition: { duration: 0.2 },
              }}
              className="
                flex-shrink-0
                px-4
                sm:px-6
                md:px-8
                w-[140px]
                sm:w-[170px]
                md:w-[200px]
                lg:w-[220px]
                cursor-pointer
              "
            >
              <img
                src={logo}
                alt=""
                className="
                  h-36
                  sm:h-40
                  md:h-44
                  w-auto
                  object-contain
                  mx-auto
                  transition-opacity
                "
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Marquee;
