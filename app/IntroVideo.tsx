"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface IntroVideoProps {
  onFinish: () => void;
}

export default function IntroVideo({
  onFinish,
}: IntroVideoProps) {
  const [split, setSplit] = useState(false);

  return (
    <div className="fixed inset-0 z-[999] overflow-hidden bg-black">

      <motion.video
        src="/video_intro.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-cover"
        onEnded={() => {
          setSplit(true);

          setTimeout(() => {
            onFinish();
          }, 350);
        }}
      />

      <AnimatePresence>
        {split && (
          <>
            <motion.div
              initial={{ x: 0 }}
              animate={{ x: "-100%" }}
              transition={{
                duration: 0.35,
                ease: "easeOut",
              }}
              className="
                absolute top-0 left-0
                w-1/2 h-full
                bg-black
                z-40
              "
            />

            <motion.div
              initial={{ x: 0 }}
              animate={{ x: "100%" }}
              transition={{
                duration: 0.35,
                ease: "easeOut",
              }}
              className="
                absolute top-0 right-0
                w-1/2 h-full
                bg-black
                z-40
              "
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}