"use client";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function MaintenanceGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const res = await fetch(`${API_URL}/api/settings/maintenance`);
        const data = await res.json();
        if (data.maintenance) {
          setIsMaintenance(true);
          setMessage(data.message || "Hệ thống đang được bảo trì");
        }
      } catch (error) {
        console.error("Error checking maintenance:", error);
      } finally {
        setLoading(false);
      }
    };
    checkMaintenance();

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  if (isMaintenance && !pathname?.startsWith("/admin")) {
    return (
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative min-h-screen w-full overflow-hidden bg-black flex items-center justify-center p-4"
      >
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(234, 179, 8, 0.15) 0%, transparent 50%)`,
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at ${100 - mousePosition.x}% ${100 - mousePosition.y}%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)`,
            }}
          />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        </div>

        <div className="absolute inset-0 pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-yellow-500 rounded-full animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
                width: `${1 + Math.random() * 2}px`,
                height: `${1 + Math.random() * 2}px`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center max-w-3xl">
          {/* Text */}
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter select-none">
            404
          </h1>

          <div className="mt-4 space-y-2">
            <p className="text-white/30 text-sm md:text-base font-light tracking-[0.2em]">
              {message}
            </p>
          </div>

          <div className="mt-8 w-48 md:w-64 mx-auto">
            <div className="relative h-0.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-purple-500 to-yellow-500 rounded-full animate-shimmer"
                style={{
                  width: "200%",
                  animation: "shimmer 2s linear infinite",
                }}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-white/10 animate-pulse"
                style={{
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-0 w-full text-center z-10">
          <p className="text-white text-[10px] tracking-[0.5em] uppercase">
            HAB CREATIVE
          </p>
        </div>

        <style jsx global>{`
          @keyframes spin-reverse {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(-360deg);
            }
          }
          .animate-spin-reverse {
            animation: spin-reverse 1s linear infinite;
          }

          @keyframes shimmer {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
          .animate-shimmer {
            animation: shimmer 2s linear infinite;
          }

          @keyframes twinkle {
            0%,
            100% {
              opacity: 0.1;
              transform: scale(1);
            }
            50% {
              opacity: 0.5;
              transform: scale(1.5);
            }
          }
          .animate-twinkle {
            animation: twinkle ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  return children;
}
