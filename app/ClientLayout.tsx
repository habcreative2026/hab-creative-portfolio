"use client";

import { useEffect, useState } from "react";
import Cursor from "@/app/components/Cursor";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import IntroVideo from "./IntroVideo";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    if (!showIntro) {
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [showIntro]);

  return (
    <>
      <Cursor />

      {showIntro && (
        <IntroVideo onFinish={() => setShowIntro(false)} />
      )}

      <div className={`transition-opacity duration-700 ${isReady ? "opacity-100" : "opacity-0"}`}>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </div>
    </>
  );
}