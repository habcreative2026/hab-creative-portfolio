"use client";
import React, { useState, useEffect, useRef } from "react";

interface FontPickerProps {
  value: string;
  onChange: (font: string) => void;
  placeholder?: string;
}

// Danh sách font phổ biến (fallback nếu API lỗi)
const FALLBACK_FONTS = [
  "Inter",
  "Roboto",
  "Playfair Display",
  "Montserrat",
  "Oswald",
  "Lora",
  "Poppins",
  "Open Sans",
  "Raleway",
  "Nunito",
  "Work Sans",
  "Quicksand",
  "DM Sans",
  "Plus Jakarta Sans",
  "Outfit",
  "Manrope",
  "Space Grotesk",
  "Lexend Deca",
  "Bebas Neue",
  "Anton",
  "Abril Fatface",
  "Pacifico",
  "Dancing Script",
  "Caveat",
  "Great Vibes",
  "Josefin Sans",
  "Cormorant Garamond",
  "Cinzel Decorative",
  "Orbitron",
  "Audiowide",
  "Exo 2",
  "Rajdhani",
  "Kanit",
  "Titillium Web",
  "Fira Sans",
  "Noto Sans",
  "Source Sans Pro",
  "Source Code Pro",
  "IBM Plex Sans",
  "IBM Plex Serif",
  "Merriweather",
  "Lato",
  "Varela Round",
  "Maven Pro",
  "Cairo",
  "Amiri",
  "Alegreya",
  "Quattrocento Sans",
  "Pathway Gothic One",
  "Barlow",
  "Barlow Condensed",
  "Teko",
  "Staatliches",
  "ZCOOL KuaiLe",
  "Rubik",
  "Sora",
  "Clash Display",
  "Cabinet Grotesk",
  "Sentient",
  "Zodiak",
  "Pally",
  "Khand",
  "Sarpanch",
  "Saira",
  "Saira Condensed",
  "Saira Semi Condensed",
  "Saira Stencil One",
  "Tomorrow",
  "Share Tech Mono",
  "Space Mono",
  "JetBrains Mono",
  "Fira Code",
  "Inconsolata",
  "DM Mono",
  "Major Mono Display",
  "Ubuntu Mono",
  "Cascadia Code",
];

export default function FontPickerComponent({
  value,
  onChange,
  placeholder = "Chọn font...",
}: FontPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [fonts, setFonts] = useState<string[]>(FALLBACK_FONTS);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // API Key của Google Fonts
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_FONTS_API_KEY || "";

  // Fetch danh sách fonts từ Google Fonts API
  useEffect(() => {
    // Nếu không có API Key thì dùng fallback
    if (!API_KEY) {
      setFonts(FALLBACK_FONTS);
      return;
    }

    const fetchFonts = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://www.googleapis.com/webfonts/v1/webfonts?key=${API_KEY}&sort=popularity`,
        );
        const data = await response.json();
        if (data.items) {
          const fontNames = data.items.map((item: any) => item.family);
          setFonts(fontNames);
        } else {
          setFonts(FALLBACK_FONTS);
        }
      } catch (error) {
        console.error("Error fetching fonts:", error);
        setFonts(FALLBACK_FONTS);
      } finally {
        setLoading(false);
      }
    };

    fetchFonts();
  }, [API_KEY]);

  // Đóng dropdown khi click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter fonts theo search term
  const filteredFonts = fonts.filter((font) =>
    font.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div ref={dropdownRef} className="relative w-full">
      {/* Button trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#1F2937] border border-slate-700 p-2 rounded text-white text-xs focus:border-blue-500 focus:outline-none transition flex justify-between items-center"
      >
        <span style={{ fontFamily: value || "inherit" }}>
          {value || placeholder}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1 bg-[#1F2937] border border-slate-700 rounded-lg shadow-2xl z-50 max-h-80 overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-slate-700 sticky top-0 bg-[#1F2937]">
            <input
              type="text"
              placeholder="Tìm kiếm font..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#111827] border border-slate-700 p-2 rounded text-white text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Font list */}
          <div className="overflow-y-auto max-h-60">
            {loading ? (
              <div className="text-center text-slate-400 text-xs p-4">
                Đang tải fonts...
              </div>
            ) : filteredFonts.length === 0 ? (
              <div className="text-center text-slate-400 text-xs p-4">
                Không tìm thấy font
              </div>
            ) : (
              filteredFonts.map((font) => (
                <button
                  key={font}
                  type="button"
                  onClick={() => {
                    onChange(font);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={`w-full px-3 py-2 text-left text-xs hover:bg-[#374151] transition ${
                    value === font
                      ? "bg-blue-600/20 border-l-2 border-blue-500"
                      : ""
                  }`}
                  style={{ fontFamily: font }}
                >
                  {font}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
