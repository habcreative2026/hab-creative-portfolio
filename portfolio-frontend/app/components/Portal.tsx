// app/components/Portal.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
  children: React.ReactNode;
}

export default function Portal({ children }: PortalProps) {
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
    // Tạo container nếu chưa có
    if (!document.getElementById("portal-root")) {
      const div = document.createElement("div");
      div.id = "portal-root";
      document.body.appendChild(div);
    }
    ref.current = document.getElementById("portal-root");
  }, []);

  if (!mounted || !ref.current) return null;
  return createPortal(children, ref.current);
}
