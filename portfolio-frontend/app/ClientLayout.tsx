"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Cursor from "@/app/components/Cursor";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import IntroVideo from "./IntroVideo";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isReady, setIsReady] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string>("/video_intro.mp4");

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAdminRoute = pathname.startsWith("/admin");

  // Kiểm tra param intro từ iframe
  const introParam = searchParams.get("intro");

  // 1. Fetch video URL
  useEffect(() => {
    if (isAdminRoute) return;

    const fetchIntroVideo = async () => {
      try {
        const res = await fetch(`${API_URL}/api/video/public`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.url) {
            setVideoUrl(json.data.url);
          }
        }
      } catch (err) {
        console.error("Lỗi lấy intro video:", err);
      }
    };

    fetchIntroVideo();
  }, [isAdminRoute]);

  // 2. Kiểm tra intro status
  useEffect(() => {
    if (isAdminRoute) return;

    // Nếu có param intro=off → tắt intro (chỉ khi trong iframe)
    if (introParam === "off") {
      setShowIntro(false);
      setIsReady(true);
    } else {
      // Mặc định bật intro cho public
      setShowIntro(true);
      setIsReady(false);
    }
  }, [isAdminRoute, introParam]);

  // 3. Khi intro kết thúc
  useEffect(() => {
    if (!showIntro) {
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [showIntro]);

  // Admin routes → không hiển thị intro
  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Cursor />

      {showIntro && (
        <IntroVideo src={videoUrl} onFinish={() => setShowIntro(false)} />
      )}

      <div
        className={`transition-opacity duration-700 ${
          isReady ? "opacity-100" : "opacity-0"
        }`}
      >
        <Navbar />
        <main>{children}</main>
        <Footer />
      </div>
    </>
  );
}
