"use client";

import { useState } from "react";
import Link from "next/link";

export default function JournalPage() {
    const [active, setActive] = useState("All");
  return (
    <div className="min-h-screen pt-40 px-4">
      
      {/* HEADER */}
      <div className="flex justify-between items-start mb-10">
        <p className="max-w-[520px] leading-snug font-bold text-[24px]">
          I write about web design, product design, and some other random stuff
        </p>

<div className="flex flex-wrap justify-end gap-2 text-sm max-w-[360px]">

      <span
        onClick={() => setActive("All")}
        className={`px-3 py-1 rounded-full border border-black cursor-pointer transition
          ${active === "All" ? "bg-black text-white" : ""}
        `}
      >
        All
      </span>

      <span
        onClick={() => setActive("Design")}
        className={`px-3 py-1 rounded-full border border-black cursor-pointer transition
          ${active === "Design" ? "bg-black text-white" : ""}
        `}
      >
        Design
      </span>

      <span
        onClick={() => setActive("Development")}
        className={`px-3 py-1 rounded-full border border-black cursor-pointer transition
          ${active === "Development" ? "bg-black text-white" : ""}
        `}
      >
        Development
      </span>

      <span
        onClick={() => setActive("Personal")}
        className={`px-3 py-1 rounded-full border border-black cursor-pointer transition
          ${active === "Personal" ? "bg-black text-white" : ""}
        `}
      >
        Personal
      </span>

      <span
        onClick={() => setActive("Random")}
        className={`px-3 py-1 rounded-full border border-black cursor-pointer transition
          ${active === "Random" ? "bg-black text-white" : ""}
        `}
      >
        Random
      </span>

    </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-2 gap-2">

        {/* CARD 1 */}
        <Link href="/journal/brigding-the-gap-between-design-development#top" className={`group cursor-pointer mb-8 ${
  active !== "All" && active !== "Design" ? "hidden" : ""
}`}>
          <div className="overflow-hidden">
            <img
                                                              onMouseEnter={() =>
  window.dispatchEvent(
    new CustomEvent("cursor-change", { detail: "image" })
  )
}
  onMouseLeave={() =>
  window.dispatchEvent(
    new CustomEvent("cursor-change", { detail: "default" })
  )
}
              src="https://framerusercontent.com/images/YxeYtGJD5UmXSqrfSBacGGEHQ0.png?width=800&height=1200"
              className="w-full h-[420px] object-cover transition-transform duration-500 cursor-none"
            />
          </div>

          <h3 className="text-[28px] font-medium mt-4">
            Bridging The Gap Between Design & Development
          </h3>
          <p className="text-sm text-gray-600 mt-1">
Discover how strategic design can create lasting brand equity, drive conversions, 
and position your business for long-term growth in an increasingly visual digital landscape.
          </p>
        </Link>

        {/* CARD 2 */}
        <div className={`group cursor-pointer mb-8 ${
  active !== "All" && active !== "Development" ? "hidden" : ""
}`}>
          <div className="overflow-hidden">
            <img
                                                              onMouseEnter={() =>
  window.dispatchEvent(
    new CustomEvent("cursor-change", { detail: "image" })
  )
}
  onMouseLeave={() =>
  window.dispatchEvent(
    new CustomEvent("cursor-change", { detail: "default" })
  )
}
              src="https://framerusercontent.com/images/q5qRCsFHkPXKl0JUTrmKlF2sNs.png?width=904&height=1200"
              className="w-full h-[420px] object-cover transition-transform duration-500 cursor-none"
            />
          </div>

          <h3 className="text-[28px] font-medium mt-4">
            Why Minimalism Still Works in 2025
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Discover how strategic design can create lasting brand equity, drive conversions, 
and position your business for long-term growth in an increasingly visual digital landscape.
          </p>
        </div>

        {/* CARD 3 */}
        <div className={`group cursor-pointer mb-8 ${
  active !== "All" && active !== "Personal" ? "hidden" : ""
}`}>
          <div className="overflow-hidden">
            <img
                                                              onMouseEnter={() =>
  window.dispatchEvent(
    new CustomEvent("cursor-change", { detail: "image" })
  )
}
  onMouseLeave={() =>
  window.dispatchEvent(
    new CustomEvent("cursor-change", { detail: "default" })
  )
}
              src="https://framerusercontent.com/images/UUmfE6W0GJGXWZ8FA2DRfia6qI.jpg?scale-down-to=2048&width=4032&height=3024"
              className="w-full h-[420px] object-cover transition-transform duration-500 cursor-none"
            />
          </div>

          <h3 className="text-[28px] font-medium mt-4">
            The Beauty of Subtle Interactions
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Discover how strategic design can create lasting brand equity, drive conversions, 
and position your business for long-term growth in an increasingly visual digital landscape.
          </p>
        </div>

        {/* CARD 4 */}
        <div className={`group cursor-pointer mb-8 ${
  active !== "All" && active !== "Design" ? "hidden" : ""
}`}>
          <div className="overflow-hidden">
            <img
                                                              onMouseEnter={() =>
  window.dispatchEvent(
    new CustomEvent("cursor-change", { detail: "image" })
  )
}
  onMouseLeave={() =>
  window.dispatchEvent(
    new CustomEvent("cursor-change", { detail: "default" })
  )
}
              src="https://framerusercontent.com/images/lfcda73ooRpMjVYU9Gm8UV1i4Vk.png?width=960&height=1200"
              className="w-full h-[420px] object-cover transition-transform duration-500 cursor-none"
            />
          </div>

          <h3 className="text-[28px] font-medium mt-4">
            Why Constraints Make Us More Creative
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Discover how strategic design can create lasting brand equity, drive conversions, 
and position your business for long-term growth in an increasingly visual digital landscape.
          </p>
        </div>

                {/* CARD 5 */}
        <div className={`group cursor-pointer mb-8 ${
  active !== "All" && active !== "Random" ? "hidden" : ""
}`}>
          <div className="overflow-hidden">
            <img
                                                              onMouseEnter={() =>
  window.dispatchEvent(
    new CustomEvent("cursor-change", { detail: "image" })
  )
}
  onMouseLeave={() =>
  window.dispatchEvent(
    new CustomEvent("cursor-change", { detail: "default" })
  )
}
              src="https://framerusercontent.com/images/WXpVq6EmRB4Eoywcko8qpdSk.png?scale-down-to=1024&width=1200&height=1200"
              className="w-full h-[420px] object-cover transition-transform duration-500 cursor-none"
            />
          </div>

          <h3 className="text-[28px] font-medium mt-4">
            The Beauty of Subtle Interactions
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Discover how strategic design can create lasting brand equity, drive conversions, 
and position your business for long-term growth in an increasingly visual digital landscape.
          </p>
        </div>

        {/* CARD 6 */}
        <div className={`group cursor-pointer mb-8 ${
  active !== "All" && active !== "Development" ? "hidden" : ""
}`}>
          <div className="overflow-hidden">
            <img
                                                              onMouseEnter={() =>
  window.dispatchEvent(
    new CustomEvent("cursor-change", { detail: "image" })
  )
}
  onMouseLeave={() =>
  window.dispatchEvent(
    new CustomEvent("cursor-change", { detail: "default" })
  )
}
              src="https://framerusercontent.com/images/zJzeaMm9MNg0VU51ByZ7stUevR0.jpg?scale-down-to=1024&width=1200&height=1200"
              className="w-full h-[420px] object-cover transition-transform duration-500 cursor-none"
            />
          </div>

          <h3 className="text-[28px] font-medium mt-4">
            Why Constraints Make Us More Creative
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Discover how strategic design can create lasting brand equity, drive conversions, 
and position your business for long-term growth in an increasingly visual digital landscape.
          </p>
        </div>

                {/* CARD 7 */}
        <div className={`group cursor-pointer mb-8 ${
  active !== "All" && active !== "Personal" ? "hidden" : ""
}`}>
          <div className="overflow-hidden">
            <img
                                                              onMouseEnter={() =>
  window.dispatchEvent(
    new CustomEvent("cursor-change", { detail: "image" })
  )
}
  onMouseLeave={() =>
  window.dispatchEvent(
    new CustomEvent("cursor-change", { detail: "default" })
  )
}
              src="https://framerusercontent.com/images/yX88DWF0J8YWTIEYWqWhNZZAOk.png?scale-down-to=1024&width=1200&height=1200"
              className="w-full h-[420px] object-cover transition-transform duration-500 cursor-none"
            />
          </div>

          <h3 className="text-[28px] font-medium mt-4">
            The Beauty of Subtle Interactions
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Discover how strategic design can create lasting brand equity, drive conversions, 
and position your business for long-term growth in an increasingly visual digital landscape.
          </p>
        </div>

        {/* CARD 8 */}
        <div className={`group cursor-pointer mb-8 ${
  active !== "All" && active !== "Design" ? "hidden" : ""
}`}>
          <div className="overflow-hidden">
            <img
                                                              onMouseEnter={() =>
  window.dispatchEvent(
    new CustomEvent("cursor-change", { detail: "image" })
  )
}
  onMouseLeave={() =>
  window.dispatchEvent(
    new CustomEvent("cursor-change", { detail: "default" })
  )
}
              src="https://framerusercontent.com/images/B1bC2MLneDsaYpJQlS51Xnm2fg.jpg?width=1200&height=1200"
              className="w-full h-[420px] object-cover transition-transform duration-500 cursor-none"
            />
          </div>

          <h3 className="text-[28px] font-medium mt-4">
            Why Constraints Make Us More Creative
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Discover how strategic design can create lasting brand equity, drive conversions, 
and position your business for long-term growth in an increasingly visual digital landscape.
          </p>
        </div>

      </div>
    </div>
  );
}