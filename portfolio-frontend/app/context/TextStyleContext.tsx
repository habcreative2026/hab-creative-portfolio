"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

// ===================== CONFIG =====================
const GLOBAL_FALLBACK_KEY = "projects";
const BROADCAST_CHANNEL_NAME = "text-style-updates";
const POLL_INTERVAL_MS = 5 * 60 * 1000; // ⭐ 5 phút (thay vì 10s)
const MIN_FETCH_INTERVAL_MS = 30 * 1000; // ⭐ 30s throttle

// ===================== TYPES =====================
export interface StyleData {
  fontFamily?: string;
  fontWeight?: number;
  fontSize?: number;
  letterSpacing?: number;
  color?: string;
}

interface TextStyleContextValue {
  stylesByKey: Record<string, StyleData>;
  loading: boolean;
  refresh: () => Promise<void>;
}

// ===================== CONTEXT =====================
const TextStyleContext = createContext<TextStyleContextValue>({
  stylesByKey: {},
  loading: true,
  refresh: async () => {},
});

// ===================== PROVIDER =====================
export function TextStyleProvider({ children }: { children: React.ReactNode }) {
  const [stylesByKey, setStylesByKey] = useState<Record<string, StyleData>>({});
  const [loading, setLoading] = useState(true);
  const lastFetchRef = useRef<number>(0);
  const isFetchingRef = useRef<boolean>(false);

  // ===================== FETCH + APPLY STYLES =====================
  const fetchStyles = async (silent = false) => {
    if (!API_URL) {
      console.warn("[TextStyle] API_URL not defined");
      if (!silent) setLoading(false);
      return;
    }

    // ⭐ Tránh fetch đồng thời
    if (isFetchingRef.current) {
      console.log("[TextStyle] ⏭️ Already fetching, skip");
      return;
    }

    isFetchingRef.current = true;

    try {
      const res = await fetch(
        `${API_URL}/api/translations/public?t=${Date.now()}`,
        {
          cache: "no-store",
        },
      );

      // ⭐ XỬ LÝ 429 - KHÔNG THROW, CHỈ LOG
      if (res.status === 429) {
        console.warn(
          "[TextStyle] ⚠️ Rate limited (429). Giữ data cũ, thử lại sau.",
        );
        if (!silent) setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      if (data.success && data.data) {
        const stylesMap: Record<string, StyleData> = data.data._styles || {};

        setStylesByKey(stylesMap);

        if (!silent) {
          console.log(
            `[TextStyle] ✅ Loaded ${Object.keys(stylesMap).length} styled keys`,
          );
        }

        // Auto-load Google Fonts
        const fontFamilies = new Set<string>();
        Object.values(stylesMap).forEach((s) => {
          if (s.fontFamily) fontFamilies.add(s.fontFamily);
        });

        fontFamilies.forEach((fontName) => {
          const fontId = `google-font-${fontName.replace(/\s/g, "-")}`;
          if (document.getElementById(fontId)) return;

          const link = document.createElement("link");
          link.id = fontId;
          link.rel = "stylesheet";
          link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, "+")}:wght@300;400;500;600;700;800;900&display=swap`;
          document.head.appendChild(link);

          if (!silent) {
            console.log(`[TextStyle] 📥 Loaded font: ${fontName}`);
          }
        });
      }
    } catch (error: any) {
      // ⭐ Chỉ log khi KHÔNG phải 429
      if (!error?.message?.includes("429")) {
        console.error("[TextStyle] ❌ Load error:", error.message || error);
      }
    } finally {
      isFetchingRef.current = false;
      if (!silent) setLoading(false);
    }
  };

  // ⭐ Throttled fetch — ít nhất 30s giữa 2 lần gọi
  const throttledFetch = (silent = true) => {
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchRef.current;

    if (timeSinceLastFetch < MIN_FETCH_INTERVAL_MS) {
      console.log(
        `[TextStyle] ⏭️ Throttled (${Math.round((MIN_FETCH_INTERVAL_MS - timeSinceLastFetch) / 1000)}s remaining)`,
      );
      return;
    }

    lastFetchRef.current = now;
    fetchStyles(silent);
  };

  const refresh = async () => {
    lastFetchRef.current = Date.now();
    await fetchStyles(false);
  };

  // ===================== EFFECT 1: Initial load =====================
  useEffect(() => {
    lastFetchRef.current = Date.now();
    fetchStyles(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===================== EFFECT 2: BroadcastChannel =====================
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("BroadcastChannel" in window)) {
      console.warn("[TextStyle] BroadcastChannel not supported");
      return;
    }

    const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);

    channel.onmessage = (event) => {
      if (event.data?.type === "text-style-updated") {
        console.log("[TextStyle] 🔔 Received update, refreshing...");
        throttledFetch(true);
      }
    };

    return () => {
      channel.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===================== EFFECT 3: Polling (fallback) =====================
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (document.visibilityState === "visible") {
        throttledFetch(true);
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===================== EFFECT 4: Visibility change =====================
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        throttledFetch(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <TextStyleContext.Provider value={{ stylesByKey, loading, refresh }}>
      {children}
    </TextStyleContext.Provider>
  );
}

// ===================== 🎯 HOOK CHÍNH =====================
export function useTranslationStyle(key: string): React.CSSProperties {
  const { stylesByKey } = useContext(TextStyleContext);

  const ownStyle = stylesByKey[key];
  const globalStyle = stylesByKey[GLOBAL_FALLBACK_KEY];
  const style = ownStyle || globalStyle;

  if (!style) return {};

  const css: React.CSSProperties = {};

  if (style.fontFamily) {
    css.fontFamily = `"${style.fontFamily}", sans-serif`;
  }
  if (style.fontWeight && style.fontWeight > 0) {
    css.fontWeight = style.fontWeight;
  }
  if (style.fontSize && style.fontSize > 0) {
    css.fontSize = `${style.fontSize}px`;
  }
  if (style.letterSpacing && style.letterSpacing !== 0) {
    css.letterSpacing = `${style.letterSpacing}em`;
  }
  if (style.color) {
    css.color = style.color;
  }

  return css;
}

// ===================== 🎯 HOOK PHỤ =====================
export function useTranslationStylesMap() {
  return useContext(TextStyleContext);
}

export function useRefreshTextStyles() {
  const { refresh } = useContext(TextStyleContext);
  return refresh;
}

// ===================== 🆕 BROADCAST HELPER =====================
export function broadcastTextStyleUpdate() {
  if (typeof window === "undefined") return;
  if (!("BroadcastChannel" in window)) return;

  const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  channel.postMessage({ type: "text-style-updated" });
  channel.close();

  console.log("[TextStyle] 📢 Broadcasted update to all tabs");
}
