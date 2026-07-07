"use client";

import { useEffect, useState } from "react";
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

const [isReady, setIsReady] = useState(true);
const [showIntro, setShowIntro] = useState(false);
const [videoUrl, setVideoUrl] = useState("/video.mp4");

const isAdminRoute = pathname?.startsWith("/admin") ?? false;
const isHomePage = pathname === "/";
const introDisabled = searchParams?.get("intro") === "off";

// Fetch video
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

// Điều khiển Intro theo route
useEffect(() => {
if (isAdminRoute || introDisabled) {
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

}, [pathname, isAdminRoute, isHomePage, introDisabled]);

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
