"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function BeerClubZ70Page() {
    const arrowRef = useRef(null);
    const [rotateArrow, setRotateArrow] = useState(false);
    useEffect(() => {
    const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        setRotateArrow(true);  
      } else {
        setRotateArrow(false);  
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
    <div className="min-h-screen mt-30 pt-30 px-40">
      
      {/* Top content */}
<div className="grid grid-cols-3 gap-10 items-start">

  {/* LEFT TEXT */}
  <div className="col-span-2 max-w-2xl">
    <p className="max-w-auto leading-relaxed font-medium font-inter text-[20px] px-4">
    Với quy mô 26ha, <span className="font-bold">Sunneva Island</span> mang đến các sản phẩm biệt thự, nhà phố đáp ứng đa nhu cầu nghỉ dưỡng – đầu tư. Đây cũng là dự án hiếm hoi mang đậm dấu ấn kiến trúc 2 phong cách <span className="font-bold">Đông Dương và Champa</span> trong từng thiết kế nhà và cảnh quan giữa lòng phố thị Đà Nẵng.
    </p>
  </div>

  {/* RIGHT INFO */}
<div className="flex flex-col gap-2">

  {/* Company + Timeline */}
  <div className="flex gap-40">

    {/* Company */}
    <div>
      <p className="text-[18px] font-inter font-bold">Company</p>
      <p className="text-[16px] font-inter">Beer Club Z70</p>
    </div>

    {/* Timeline (đã kéo vào bên trái tự nhiên bằng gap) */}
    <div>
      <p className="text-[18px] font-inter font-bold">Timeline</p>
      <p className="text-[16px] font-inter">2023</p>
    </div>

  </div>

  {/* Role */}
  <div>
    <p className="text-[18px] font-inter font-bold">Category</p>
    <p className="text-[16px] font-inter">Invitation,
Social Media,
Social Poster,
Flyer,…</p>
  </div>

  {/* Live */}
<div className="group inline-block">
  <p className="text-[18px] font-inter font-bold">Live</p>

  <p className="relative inline-block text-[16px] font-inter cursor-pointer">
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
<Link href={"/projects#top"} className="group text-sm text-black flex items-center gap-1 cursor-pointer px-4">
  <span className="text-lg">
    ‹
  </span>
  <span className="transition-transform duration-200 group-hover:translate-x-1">
    Back to projects
  </span>
</Link>

{/* Visual + Description Section */}
<div className="mt-2 flex flex-col gap-3">

  {/* 1. Full width image */}
    <div className="relative w-full h-full overflow-hidden group">
  {/* IMAGE (base) */}
  <img
    src="/project_beer_club_z70/001.webp"
    alt="Lightspeed visual"
    className="w-full h-full object-cover"
  />
</div>

  <div className="grid grid-cols-2">
    <div />

    {/* <div className="text-sm leading-relaxed text-gray-700 space-y-6">
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
    </div> */}

  </div>

  {/* 3. Two images side by side */}
  {/* <div className="grid grid-cols-2 gap-2">

      <img
        src=""
        alt="Phones UI"
        className="w-full h-full object-cover"
      />

      <img
        src="https://framerusercontent.com/images/41EPtl1EzZTUlyFoLNhjzihUvM.png?scale-down-to=1024&width=5000&height=3750"
        alt="Pattern"
        className="w-full h-full object-cover"
      />

  </div> */}
    <img
      src="/project_beer_club_z70/002.webp"
      alt="Lightspeed visual"
      className="w-full h-full object-cover"
    />
        <img
      src="/project_beer_club_z70/003.webp"
      alt="Lightspeed visual"
      className="w-full h-full object-cover"
    />
        <img
      src="/project_beer_club_z70/004.webp"
      alt="Lightspeed visual"
      className="w-full h-full object-cover"
    />
        <img
      src="/project_beer_club_z70/005.webp"
      alt="Lightspeed visual"
      className="w-full h-full object-cover"
    />
        <img
      src="/project_beer_club_z70/006.webp"
      alt="Lightspeed visual"
      className="w-full h-full object-cover"
    />
        <img
      src="/project_beer_club_z70/007.webp"
      alt="Lightspeed visual"
      className="w-full h-full object-cover"
    />
            <img
      src="/project_beer_club_z70/008.webp"
      alt="Lightspeed visual"
      className="w-full h-full object-cover"
    />
            <img
      src="/project_beer_club_z70/009.webp"
      alt="Lightspeed visual"
      className="w-full h-full object-cover"
    />
            <img
      src="/project_beer_club_z70/010.webp"
      alt="Lightspeed visual"
      className="w-full h-full object-cover"
    />
<div className="grid grid-cols-2 mb-20">

  {/* Left content (0 → 50%) */}
  {/* <div className="text-sm leading-relaxed text-gray-700 space-y-6">
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
  </div> */}

  <div />

</div>
</div>
{/* Latest projects */}
<div className="mt-12 border-t pt-12">

{/* Header */}
<div className="flex items-center justify-between mb-6"> 

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
    <Link 
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
    href={"/projects/the-beverly#top"} className="relative overflow-hidden h-[320px]">
      <img
        src="/project_the_beverly/vinhomes_grand_park.avif"
        className="w-full h-full object-cover transition-transform duration-500 cursor-none"
      />
      <span className="absolute bottom-2 left-3 text-white text-[24px] mix-blend-difference">
        The Beverly, HCMC
      </span>
    </Link>

    {/* Item 2 */}
    <Link 
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
    href={"/projects/le-palmier-ho-tram#top"} className="relative overflow-hidden h-[320px]">
      <img
        src="/project_le_palmier_ho_tram/le_palmier_ho_tram.avif"
        className="w-full h-full object-cover transition-transform duration-500 cursor-none"
      />
      <span className="absolute bottom-2 left-3 text-white text-[24px] mix-blend-difference">
        Le Palmier Ho Tram
      </span>
    </Link>

  </div>

</div>
    </div>
  );
}