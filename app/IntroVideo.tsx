"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function IntroVideo({ onFinish }: { onFinish: () => void }) {
  const [split, setSplit] = useState(false);

  return (
    <div className="fixed inset-0 z-[999] overflow-hidden bg-black">
      {/* VIDEO */}
      <motion.video
        src="/video_intro.mp4"
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover"
        onEnded={() => {
          setSplit(true);
          setTimeout(onFinish, 2200);
        }}
        animate={
          split
            ? {
                scale: 1.15,
                filter: "blur(8px)",
                opacity: 0.5,
              }
            : {}
        }
        transition={{ duration: 1 }}
      />

      <AnimatePresence>
        {split && (
          <>
            {/* FLASH */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 bg-white z-10 pointer-events-none"
            />

            {/* SPLIT TOP */}
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: "-130%" }}
              transition={{ duration: 1.2, ease: [0.87, 0, 0.13, 1] }}
              className="absolute top-0 w-full h-1/2 bg-black z-20"
            />

            {/* SPLIT BOTTOM */}
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: "130%" }}
              transition={{ duration: 1.2, ease: [0.87, 0, 0.13, 1] }}
              className="absolute bottom-0 w-full h-1/2 bg-black z-20"
            />

            {/* SPLIT LEFT */}
            <motion.div
              initial={{ x: 0 }}
              animate={{ x: "-130%" }}
              transition={{ duration: 1.2, ease: [0.87, 0, 0.13, 1] }}
              className="absolute left-0 w-1/2 h-full bg-black z-20"
            />

            {/* SPLIT RIGHT */}
            <motion.div
              initial={{ x: 0 }}
              animate={{ x: "130%" }}
              transition={{ duration: 1.2, ease: [0.87, 0, 0.13, 1] }}
              className="absolute right-0 w-1/2 h-full bg-black z-20"
            />

            {/* BRAND TEXT */}
            {/* <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.4 }}
              >
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="overflow-hidden"
                >
                  <motion.h1
                    initial={{ letterSpacing: "0.2em", opacity: 0 }}
                    animate={{ letterSpacing: "0.5em", opacity: 1 }}
                    transition={{ duration: 1.2, delay: 0.6 }}
                    className="
                      text-white 
                      text-4xl md:text-7xl 
                      font-extrabold 
                      tracking-[0.5em]
                      text-center
                    "
                  >
                    HAB CREATIVE
                  </motion.h1>
                </motion.div>
              </motion.div>
            </div> */}

            {/* FADE OUT */}
            {/* <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8, duration: 0.6 }}
              className="absolute inset-0 bg-black z-40 pointer-events-none"
            /> */}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}