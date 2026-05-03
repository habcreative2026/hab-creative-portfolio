"use client";

import { useEffect, useState } from "react";
import Cursor from "@/app/components/Cursor";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import IntroVideo from "./IntroVideo";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false); // GIỮ NGUYÊN
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    if (!showIntro) {
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 200); // giữ delay cũ

      return () => clearTimeout(timer);
    }
  }, [showIntro]);

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Cursor />

        {/* INTRO VIDEO */}
        {showIntro && (
          <IntroVideo
            onFinish={() => {
              setShowIntro(false);
            }}
          />
        )}

        {/* MAIN CONTENT */}
        <div
          className={`flex flex-col min-h-screen transition-opacity duration-700 ${
            isReady ? "opacity-100" : "opacity-0"
          }`}
        >
          <Navbar />

          <main className="flex-1">{children}</main>

          <Footer />
        </div>
      </body>
    </html>
  );
}