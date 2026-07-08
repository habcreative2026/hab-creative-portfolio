"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Cursor from "./app/components/Cursor";
import Navbar from "./app/components/Navbar";
import Footer from "./app/components/Footer";
import IntroVideo from "./IntroVideo";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const [isReady, setIsReady] = useState(true);
  const [showIntro, setShowIntro] = useState(false);
  const [videoUrl, setVideoUrl] = useState("/video.mp4");

  const isAdminRoute = pathname?.startsWith("/admin") ?? false;
  const isHomePage = pathname === "/";

  // Nếu website đang chạy trong iframe (Admin Preview)
  const isIframe = typeof window !== "undefined" && window.self !== window.top;

  // Chỉ Home mới cần fetch video
  useEffect(() => {
    if (isAdminRoute || !isHomePage || isIframe) return;

    const fetchIntroVideo = async () => {
      try {
        const res = await fetch(`${API_URL}/api/video/public`);

        if (!res.ok) throw new Error("Failed to fetch video");

        const json = await res.json();

        if (json.success && json.data?.url) {
          setVideoUrl(json.data.url);
        }
      } catch (err) {
        console.error("Lỗi lấy intro video:", err);
      }
    };

    fetchIntroVideo();
  }, [isAdminRoute, isHomePage, isIframe]);

  // Điều khiển Intro
  useEffect(() => {
    if (isAdminRoute || isIframe) {
      setShowIntro(false);
      setIsReady(true);
      return;
    }

    if (isHomePage) {
      setShowIntro(true);
      setIsReady(false);
    } else {
      setShowIntro(false);
      setIsReady(true);
    }
  }, [pathname, isAdminRoute, isHomePage, isIframe]);

  const handleIntroFinish = () => {
    setShowIntro(false);
    setIsReady(true);
  };

  // Admin không render layout
  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Cursor />

      {showIntro && <IntroVideo src={videoUrl} onFinish={handleIntroFinish} />}

      <div
        className={`
          transition-opacity duration-700 ease-in-out
          ${isReady ? "opacity-100" : "opacity-0"}
        `}
      >
        <Navbar />
        <main>{children}</main>
        <Footer />
      </div>
    </>
  );
}
