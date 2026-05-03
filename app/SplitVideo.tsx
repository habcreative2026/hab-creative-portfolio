"use client";

import { useScroll, useTransform, motion } from "framer-motion";

// SplitVideo.tsx
export default function SplitVideo() {
  const { scrollY } = useScroll();
  
  // Hiệu ứng diễn ra từ 0 đến 600px scroll để tạo cảm giác mượt
  const progress = useTransform(scrollY, [0, 600], [0, 1]);

  const topY = useTransform(progress, [0, 1], ["0%", "-100%"]);
  const bottomY = useTransform(progress, [0, 1], ["0%", "100%"]);
  const leftX = useTransform(progress, [0, 1], ["0%", "-100%"]); 
  const rightX = useTransform(progress, [0, 1], ["0%", "100%"]);

  return (
    <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
      {/* TOP */}
      <motion.div style={{ y: topY }} className="absolute top-0 w-full h-1/2 overflow-hidden">
        <video src="/video.mp4" autoPlay muted loop className="w-full h-[200%] object-cover absolute top-0" />
      </motion.div>

      {/* BOTTOM */}
      <motion.div style={{ y: bottomY }} className="absolute bottom-0 w-full h-1/2 overflow-hidden">
        <video src="/video.mp4" autoPlay muted loop className="w-full h-[200%] object-cover absolute bottom-0" />
      </motion.div>

      {/* LEFT */}
      <motion.div style={{ x: leftX }} className="absolute left-0 w-1/2 h-full overflow-hidden">
        <video src="/video.mp4" autoPlay muted loop className="w-[200%] h-full object-cover absolute left-0" />
      </motion.div>

      {/* RIGHT */}
      <motion.div style={{ x: rightX }} className="absolute right-0 w-1/2 h-full overflow-hidden">
        <video src="/video.mp4" autoPlay muted loop className="w-[200%] h-full object-cover absolute right-0" />
      </motion.div>
    </div>
  );
}