"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Cursor from "@/app/components/Cursor";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import IntroVideo from "./IntroVideo";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
let isHardReloadOrFirstLoad = true;

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin") ?? false;
  const isHomePage = pathname === "/";
  const isIframe = typeof window !== "undefined" && window.self !== window.top;
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window === "undefined" || isAdminRoute || isIframe) return false;

    if (isHardReloadOrFirstLoad && isHomePage) {
      return true;
    }

    const hasPlayedSession = sessionStorage.getItem("intro_session_played");
    return isHomePage && !hasPlayedSession;
  });

  const [videoUrl, setVideoUrl] = useState("/video.mp4");
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
      } catch (error) {
        console.error("Lỗi lấy intro video:", error);
      }
    };

    fetchIntroVideo();
  }, [isAdminRoute, isHomePage, isIframe]);
  useEffect(() => {
    if (isAdminRoute || isIframe) {
      setShowIntro(false);
      return;
    }

    if (isHardReloadOrFirstLoad) {
      isHardReloadOrFirstLoad = false;

      if (isHomePage) {
        sessionStorage.removeItem("intro_session_played");
        setShowIntro(true);
      } else {
        sessionStorage.setItem("intro_session_played", "true");
        setShowIntro(false);
      }
      return;
    }

    if (!isHomePage) {
      setShowIntro(false);
    } else {
      const hasPlayedSession = sessionStorage.getItem("intro_session_played");
      if (hasPlayedSession) {
        setShowIntro(false);
      } else {
        setShowIntro(true);
      }
    }
  }, [pathname, isAdminRoute, isHomePage, isIframe]);

  const handleIntroFinish = () => {
    sessionStorage.setItem("intro_session_played", "true");
    setShowIntro(false);
  };

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Cursor />
      {showIntro ? (
        <IntroVideo src={videoUrl} onFinish={handleIntroFinish} />
      ) : (
        <>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </>
      )}
    </>
  );
}
