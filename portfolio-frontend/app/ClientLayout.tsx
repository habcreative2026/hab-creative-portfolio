"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Cursor from "@/app/components/Cursor";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import IntroVideo from "./IntroVideo";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ⭐ DANH SÁCH CÁC ROUTE KHÔNG HIỂN THỊ INTRO
const NO_INTRO_ROUTES = [
  "/auth-denied", 
];

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isReady, setIsReady] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string>("/video_intro.mp4");
  const [introFinished, setIntroFinished] = useState(false);

  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ⭐ KIỂM TRA CÓ NẰM TRONG DANH SÁCH KHÔNG HIỂN THỊ INTRO
  const isNoIntroRoute = NO_INTRO_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route)
  );

  const isAdminRoute = pathname.startsWith("/admin");
  const introParam = searchParams.get("intro");

  // ⭐ NẾU LÀ ROUTE KHÔNG HIỂN THỊ INTRO → TRẢ VỀ CHILDREN NGAY
  if (isNoIntroRoute) {
    return <>{children}</>;
  }

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
      // Kiểm tra sessionStorage để biết đã xem intro chưa
      const hasSeenIntro = sessionStorage.getItem("hasSeenIntro");
      if (hasSeenIntro === "true") {
        setShowIntro(false);
        setIsReady(true);
      } else {
        setShowIntro(true);
        setIsReady(false);
      }
    }
  }, [isAdminRoute, introParam]);

  // 3. Khi intro kết thúc
  const handleIntroFinish = () => {
    sessionStorage.setItem("hasSeenIntro", "true");
    setShowIntro(false);
    setTimeout(() => {
      setIsReady(true);
    }, 400);
  };

  // Admin routes → không hiển thị intro
  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Cursor />

      {showIntro && (
        <IntroVideo
          src={videoUrl}
          onFinish={handleIntroFinish}
          autoPlay={true}
        />
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
