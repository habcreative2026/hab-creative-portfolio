import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";

const Marquee = () => {
  const controls = useAnimation();

  const logos = [
    "/category_logo/category_logo_v0.png",
    "/category_logo/category_logo_v1.png",
    "/category_logo/category_logo_v2.png",
    "/category_logo/category_logo_v3.png",
    "/category_logo/category_logo_v4.png",
    "/category_logo/category_logo_v5.png",
  ];

  const tripleLogos = [...logos, ...logos, ...logos];

  useEffect(() => {
    controls.start({
      x: [0, "-33.333%"],
      transition: {
        duration: 15,
        ease: "linear",
        repeat: Infinity,
        repeatType: "loop",
      },
    });
  }, [controls]);

  return (
    <div className="w-full overflow-hidden py-10 mb-14">
      <div className="flex [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <motion.div
          className="flex flex-nowrap min-w-max"
          animate={controls}
          onHoverStart={() => controls.stop()}
          onHoverEnd={() => {
            controls.start({
              x: [0, "-33.333%"],
              transition: {
                duration: 15,
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
                opacity: 0.35,
                transition: { duration: 0.2 },
              }}
              className="
                flex-shrink-0
                px-4
                sm:px-6
                md:px-8
                w-[120px]
                sm:w-[150px]
                md:w-[180px]
                lg:w-[200px]
                cursor-pointer
              "
            >
              <img
                src={logo}
                alt=""
                className="
                  h-5
                  sm:h-6
                  md:h-7
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