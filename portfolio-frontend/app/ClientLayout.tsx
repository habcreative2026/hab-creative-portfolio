"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Cursor from "@/app/components/Cursor";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import IntroVideo from "./IntroVideo";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [isReady, setIsReady] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [videoUrl, setVideoUrl] = useState("/video.mp4");

  // Kiểm tra admin route
  const isAdminRoute = pathname?.startsWith("/admin") ?? false;
  
  // Kiểm tra intro param
  const introParam = searchParams?.get("intro");

  // ⭐ 1. Fetch video URL - chỉ chạy 1 lần
  useEffect(() => {
    if (isAdminRoute) return;

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
        // Giữ video mặc định nếu fetch thất bại
      }
    };

    fetchIntroVideo();
  }, [isAdminRoute]); // ⭐ Chỉ phụ thuộc isAdminRoute

  // ⭐ 2. Xử lý intro status
  useEffect(() => {
    if (isAdminRoute) {
      setIsReady(true);
      return;
    }

    // Tắt intro nếu có param intro=off (từ iframe)
    if (introParam === "off") {
      setShowIntro(false);
      setIsReady(true);
    } else {
      setShowIntro(true);
      setIsReady(false);
    }
  }, [isAdminRoute, introParam]);

  // ⭐ 3. Khi intro kết thúc
  useEffect(() => {
    if (!showIntro && !isAdminRoute) {
      const timer = setTimeout(() => setIsReady(true), 200);
      return () => clearTimeout(timer);
    }
  }, [showIntro, isAdminRoute]);

  // ⭐ 4. Xử lý kết thúc intro
  const handleIntroFinish = useCallback(() => {
    setShowIntro(false);
  }, []);

  // Admin routes → render trực tiếp
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
        />
      )}

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
