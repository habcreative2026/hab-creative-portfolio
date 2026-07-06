// app/ClientLayout.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useIntro } from "@/app/context/IntroContext";
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
  const { introDisabled, setIntroDisabled } = useIntro();
  
  const [isReady, setIsReady] = useState(false);
  const [showIntro, setShowIntro] = useState(!introDisabled);
  const [videoUrl, setVideoUrl] = useState("/video.mp4");

  const isAdminRoute = pathname?.startsWith("/admin") ?? false;
  const introParam = searchParams?.get("intro");

  // Xử lý intro param từ iframe
  useEffect(() => {
    if (isAdminRoute) return;
    
    if (introParam === "off") {
      setIntroDisabled(true);
      setShowIntro(false);
    }
  }, [introParam, isAdminRoute, setIntroDisabled]);

  // Fetch video URL
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

  // Xử lý ready state
  useEffect(() => {
    if (isAdminRoute) {
      setIsReady(true);
      return;
    }

    if (!showIntro || introDisabled) {
      setIsReady(true);
      return;
    }

    setIsReady(false);
  }, [showIntro, introDisabled, isAdminRoute]);

  // Khi intro kết thúc
  const handleIntroFinish = () => {
    setShowIntro(false);
    setIntroDisabled(true);
  };

  // Admin routes - render trực tiếp
  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Cursor />

      {showIntro && !introDisabled && (
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
