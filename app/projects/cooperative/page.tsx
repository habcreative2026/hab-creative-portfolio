"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function CooperativePage() {
    const arrowRef = useRef(null);
    const [rotateArrow, setRotateArrow] = useState(false);
    useEffect(() => {
    const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        setRotateArrow(true);   // thấy → xoay
      } else {
        setRotateArrow(false);  // không thấy → reset
      }
    },
    {
      threshold: 0.6, // thấy 60% element
    }
  );

  if (arrowRef.current) {
    observer.observe(arrowRef.current);
  }

  return () => observer.disconnect();
}, []);
  return (
    <div className="min-h-screen mt-30 pt-30 px-4">
      
      {/* Top content */}
<div className="grid grid-cols-3 gap-10 items-start">

  {/* LEFT TEXT */}
  <div className="col-span-2 max-w-2xl">
    <p className="max-w-auto leading-snug font-bold text-[24px]">
      Lightspeed is a British fintech company providing fast,
      secure online payment solutions for small and medium-sized businesses.
    </p>
  </div>

  {/* RIGHT INFO */}
<div className="flex flex-col gap-6">

  {/* Company + Timeline */}
  <div className="flex gap-36">

    {/* Company */}
    <div>
      <p className="text-xs text-gray-700">Company</p>
      <p className="text-[24px] font-medium">Lightspeed</p>
    </div>

    {/* Timeline (đã kéo vào bên trái tự nhiên bằng gap) */}
    <div>
      <p className="text-xs text-gray-700">Timeline</p>
      <p className="text-[24px] font-medium">2024 — 2025</p>
    </div>

  </div>

  {/* Role */}
  <div>
    <p className="text-xs text-gray-700">Role</p>
    <p className="text-[24px] font-medium">Product Designer</p>
  </div>

  {/* Live */}
<div className="group inline-block">
  <p className="text-xs text-gray-700">Live</p>

  <p className="relative inline-block text-[24px] font-medium cursor-pointer">
    Live project

    <span
      className="
        absolute left-0 bottom-0 h-[1px] w-full bg-black
        scale-x-0 origin-right
        transition-transform duration-300
        group-hover:scale-x-100 group-hover:origin-left
      "
    ></span>
  </p>
</div>

</div>

</div>

      {/* Bottom */}
<Link href={"/projects#top"} className="group text-sm text-black flex items-center gap-1 cursor-pointer">
  <span className="text-lg">
    ‹
  </span>
  <span className="transition-transform duration-200 group-hover:translate-x-1">
    Back to projects
  </span>
</Link>

{/* Visual + Description Section */}
<div className="mt-2 flex flex-col gap-5">

  {/* 1. Full width image */}
    <img
      src="https://framerusercontent.com/images/eSwpVesqtEA3fYvovomC4SNF9qQ.png?scale-down-to=2048&width=5000&height=3750"
      alt="Lightspeed visual"
      className="w-full h-full object-cover"
    />

  <div className="grid grid-cols-2">
    <div />

    <div className="text-sm leading-relaxed text-gray-700 space-y-6">
      <div>
        <p className="font-medium text-gray-500 mb-1">Project overview</p>
        <p className="font-bold">
          Lightspeed approached us at a pivotal moment in their growth. 
          They had developed a powerful payment infrastructure that promised 
          faster transactions and lower fees, but their digital presence failed 
          to reflect the innovation and trustworthiness of their product. 
          The website was cluttered, the brand lacked cohesion, and potential clients 
          often left before fully understanding the value proposition. The goal was clear: 
          create a modern, intuitive platform that communicated confidence, streamlined their 
          product story, and invited businesses to explore what Lightspeed had to offer. 
          Beyond visuals, the project required a holistic approach — designing a seamless 
          experience that aligned with the pace and security of financial technology.
        </p>
      </div>

      <div>
        <p className="font-medium text-gray-500 mb-1">Challenges</p>
        <p className="font-bold">
          Designing for fintech always brings its own set of challenges. 
          Lightspeed’s audience was split between small business owners with little technical 
          background and developers who needed in - depth documentation. Catering to both groups 
          meant balancing clarity with complexity. Additionally, the company’s existing identity 
          relied heavily on generic stock visuals and outdated typography, which created a 
          disconnect between their cutting - edge product and their online presence. The biggest 
          challenge, however, was trust. In finance, every design decision — from color palette 
          to micro - interaction — impacts how secure a platform feels. We had to craft a visual 
          language that not only looked sleek but also conveyed reliability and transparency. 
          Alongside this, there were technical hurdles: optimizing site performance for global 
          markets, ensuring accessibility compliance, and integrating live payment demos without 
          compromising speed or security.
        </p>
      </div>
    </div>

  </div>

  {/* 3. Two images side by side */}
  <div className="grid grid-cols-2 gap-2">

      <img
        src="https://framerusercontent.com/images/Bf7iPwBZzRn9O7qcuaMZraKTjfo.png?scale-down-to=1024&width=5000&height=3750"
        alt="Phones UI"
        className="w-full h-full object-cover"
      />

      <img
        src="https://framerusercontent.com/images/41EPtl1EzZTUlyFoLNhjzihUvM.png?scale-down-to=1024&width=5000&height=3750"
        alt="Pattern"
        className="w-full h-full object-cover"
      />

  </div>
    <img
      src="https://framerusercontent.com/images/6Qc5MaJXLDunbNd0iR3N65KZYs.png?scale-down-to=2048&width=5000&height=3750"
      alt="Lightspeed visual"
      className="w-full h-full object-cover"
    />
<div className="grid grid-cols-2">

  {/* Left content (0 → 50%) */}
  <div className="text-sm leading-relaxed text-gray-700 space-y-6">
    <div>
      <p className="font-medium text-gray-500 mb-1">Results</p>
      <p className="font-bold">
        The redesigned Lightspeed experience launched with a strong, minimal design system 
        centered around bold typography, a refined color scheme, and intuitive navigation. 
        Small business owners now encountered a clear, jargon-free explanation of the product, 
        while developers gained access to well-structured documentation and code samples. The 
        addition of subtle interactive elements created a sense of speed without overwhelming the 
        user. Post-launch, Lightspeed reported a 42% increase in signups within the first three 
        months, alongside a measurable drop in bounce rates on key product pages. Feedback from 
        clients emphasized how much more approachable and professional the brand felt. The project 
        not only elevated their digital presence but positioned Lightspeed as a serious contender 
        in the crowded fintech landscape—bridging the gap between innovation and trust.
      </p>
    </div>
  </div>

  <div />

</div>
</div>
{/* Latest projects */}
<div className="mt-12 border-t pt-12">

{/* Header */}
<div className="flex items-center justify-between mb-4">

  {/* Title */}
  <h2 className="text-[64px] font-medium tracking-tight leading-none">
    Latest projects
  </h2>

  {/* Arrow */}
  <div ref={arrowRef} className="cursor-pointer">
    <svg
      width="60"
      height="60"
      viewBox="0 0 96.117 96.189"
      fill="black"
      className={`transition-transform duration-500 ease-out ${
        rotateArrow ? "-rotate-180" : "-rotate-90"
      }`}
    >
      <path d="M 96.117 0.005 L 96.112 96.189 L 75.656 96.175 L 75.661 34.961 L 14.529 96.083 L 0.063 81.617 L 61.219 20.461 L 0.005 20.466 L 0 0 Z" />
    </svg>
  </div>

</div>

  {/* Grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

    {/* Item 1 */}
    <Link href={"/projects/ikigai-labs#top"} className="relative overflow-hidden h-[520px]">
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
        src="https://framerusercontent.com/images/dsyYZrrFd4cPft59VZ5bqUbrs.png?scale-down-to=1024&width=1200&height=686"
        className="w-full h-full object-cover transition-transform duration-500 cursor-none"
      />
      <span className="absolute bottom-2 left-3 text-white text-[24px] mix-blend-difference">
        Ikigai Labs, Japan
      </span>
    </Link>

    {/* Item 2 */}
    <Link href={"/projects/fourpoints#top"} className="relative overflow-hidden h-[520px]">
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
        src="https://framerusercontent.com/images/bMDu1PESNGtMadkpWjSecY9jM0.png?width=800&height=1200"
        className="w-full h-full object-cover transition-transform duration-500 cursor-none"
      />
      <span className="absolute bottom-2 left-3 text-white text-[24px] mix-blend-difference">
        Fourpoints, Canada
      </span>
    </Link>

  </div>

</div>
    </div>
  );
}