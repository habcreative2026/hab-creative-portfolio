"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type LinkInfo = {
  url: string;
  label: string;
  isNewTab: boolean;
};

type LinkContextType = {
  getLink: (key: string) => LinkInfo;
  loading: boolean;
};

const LinkContext = createContext<LinkContextType | null>(null);
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function LinkProvider({ children }: { children: React.ReactNode }) {
  const [links, setLinks] = useState<Record<string, LinkInfo>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLinks() {
      try {
        const res = await fetch(`${API_URL}/api/links/public`, {
          next: { revalidate: 300 },
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setLinks(json.data);
          }
        }
      } catch (err) {
        console.error("Không thể đồng bộ Links từ CMS Backend:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLinks();
  }, []);

  const getLink = (key: string): LinkInfo => {
    return links[key] || { url: "#", label: key, isNewTab: false };
  };

  return (
    <LinkContext.Provider value={{ getLink, loading }}>
      {!loading ? children : null}
    </LinkContext.Provider>
  );
}

export function useLinks() {
  const context = useContext(LinkContext);
  if (!context) {
    throw new Error("useLinks phải được bọc trong LinkProvider");
  }
  return context;
}
