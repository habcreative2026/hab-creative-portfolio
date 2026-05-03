"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type CursorVariant = "default" | "userdefault" | "social" | "image" | "home" | "sound";

const Cursor = () => {
  const [soundOn, setSoundOn] = useState(true);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 300 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  const [variant, setVariant] = useState<CursorVariant>("default");

  const pathname = usePathname();

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, []);

  useEffect(() => {
    const handleChange = (e: any) => {
      if (!e?.detail) return;
      setVariant(e.detail);
    };

    window.addEventListener("cursor-change", handleChange);

    return () => {
      window.removeEventListener("cursor-change", handleChange);
    };
  }, []);

// Cursor.tsx

useEffect(() => {
  const handleSound = (e: any) => {
    // Kiểm tra chính xác dữ liệu từ detail
    if (typeof e.detail === "boolean") {
      setSoundOn(e.detail);
    }
  };

  window.addEventListener("sound-change", handleSound);
  
  // (Tùy chọn) Gửi một event yêu cầu check trạng thái hiện tại nếu cần
  return () => {
    window.removeEventListener("sound-change", handleSound);
  };
}, []);

  useEffect(() => {
    setVariant("default");

    window.dispatchEvent(
      new CustomEvent("cursor-change", {
        detail: "default",
      })
    );
  }, [pathname]);

  const variants = {
    default: {
      width: 16,
      height: 16,
      backgroundColor: "#C0C0C0",
      border: "1px solid rgba(255,255,255,0.2)",
    },

    userdefault: {
      width: 22,
      height: 22,
      backgroundColor: "transparent",
      border: "1px solid #AAAAAA",
    },

    home: {
  width: 50,
  height: 50,
  backgroundColor: "#000",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "12px",
  fontWeight: 600,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
},

sound: {
  width: 40,
  height: 40,
  backgroundColor: "rgba(221, 221, 221, 0.45)",
  border: "1px solid rgba(255,255,255,0.2)",
  color: "#000",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "12px",
  fontWeight: 600,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
},

    social: {
      width: 28,
      height: 28,
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "1px solid rgba(255,255,255,0.2)",
    },

    image: {
      width: 96,
      height: 96,
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
     border: "1px solid rgba(255,255,255,0.2)",
    },
  };

  // const isBlend = variant === "social" || variant === "image";

  return (
    <motion.div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        translateX: x,
        translateY: y,
        x: "-50%",
        y: "-50%",
        borderRadius: "50%",
        boxSizing: "border-box",
        pointerEvents: "none",
        zIndex: 9999,
mixBlendMode:
  variant === "social" || variant === "image"
    ? "difference"
    : "normal",

backgroundColor:
  variant === "social" || variant === "image"
    ? "#fff"
    : undefined,
      }}
      variants={variants}
      animate={variant}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >

      {variant === "home" && (
  <div className="overflow-hidden">
    <motion.span
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      transition={{
        duration: 0.4,
        ease: [0.87, 0, 0.13, 1],
      }}
      className="block font-inter"
    >
      HOME
    </motion.span>
  </div>
)}
      {/* SOCIAL icon */}
      {variant === "social" && (
  <svg
    width="16"
    height="16"
    viewBox="0 0 96.117 96.189"
    fill="none"
  >
    <path
      d="M96.117 0.005 L96.112 96.189 L75.656 96.175 L75.661 34.961 L14.529 96.083 L0.063 81.617 L61.219 20.461 L0.005 20.466 L0 0 Z"
      fill="black"
    />
  </svg>
)}

      {/* IMAGE preview */}
      {variant === "image" && (
  <svg
    width="50"
    height="50"
    viewBox="0 0 96.117 96.189"
    fill="none"
  >
    <path
      d="M96.117 0.005 L96.112 96.189 L75.656 96.175 L75.661 34.961 L14.529 96.083 L0.063 81.617 L61.219 20.461 L0.005 20.466 L0 0 Z"
      fill="black"
    />
  </svg>
)}


{variant === "sound" && (
  <div className="overflow-hidden">
    <motion.span
      key={soundOn ? "sound-on" : "sound-off"} 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      transition={{
        duration: 0.35,
        ease: [0.87, 0, 0.13, 1],
      }}
      className="block text-[12px] text-black font-bold tracking-widest font-inter"
    >
      {soundOn ? "OFF" : "ON"}
    </motion.span>
  </div>
)}

    </motion.div>
  );
};

export default Cursor;