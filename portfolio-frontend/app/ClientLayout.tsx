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
  const [showIntro, setShowIntro] = useState(() => {
    // ⭐ Lấy trạng thái từ localStorage khi mount
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("introDisabled");
      return saved !== "true";
    }
    return true;
  });
  const [videoUrl, setVideoUrl] = useState("/video.mp4");
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const isAdminRoute = pathname?.startsWith("/admin") ?? false;
  const introParam = searchParams?.get("intro");

  // ⭐ 1. Xử lý intro param từ iframe (chỉ áp dụng lần đầu)
  useEffect(() => {
    if (isAdminRoute) return;
    
    // Chỉ xử lý khi có param intro=off và là lần đầu load
    if (introParam === "off" && isFirstLoad) {
      localStorage.setItem("introDisabled", "true");
      setShowIntro(false);
      setIsFirstLoad(false);
    }
  }, [introParam, isAdminRoute, isFirstLoad]);

  // ⭐ 2. Fetch video URL
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
      }
    };

    fetchIntroVideo();
  }, [isAdminRoute]);

  // ⭐ 3. Xử lý ready state
  useEffect(() => {
    if (isAdminRoute) {
      setIsReady(true);
      return;
    }

    // Nếu showIntro = false (đã tắt), set ready
    if (!showIntro) {
      setIsReady(true);
      return;
    }

    // Nếu showIntro = true, chờ intro kết thúc
    setIsReady(false);
  }, [showIntro, isAdminRoute]);

  // ⭐ 4. Khi intro kết thúc
  const handleIntroFinish = useCallback(() => {
    setShowIntro(false);
    localStorage.setItem("introDisabled", "true");
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
