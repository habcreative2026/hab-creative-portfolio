"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";

export default function TitlePage() {
  const { scrollY } = useScroll();

  const yRaw = useTransform(scrollY, [0, 300], [0, -120]);

  const y = useSpring(yRaw, {
    stiffness: 80,
    damping: 20,
    mass: 0.5,
  });

  return (
    <nav className="sticky top-0 z-0 bg-white pt-32 overflow-hidden">
      <motion.h1 
        style={{ y }} 
        className="flex items-center max-w-full font-bold tracking-tight text-[48px] md:text-[120px] lg:text-[180px] leading-none uppercase"
      >
        <span>ELLIOT</span>

        <span className="flex-1 mx-4">
          <span className="block w-full h-[20px] bg-black"></span>
        </span>

        <span>ROWE</span>
      </motion.h1>
    </nav>
  );
}