"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function MissThuRestaurantPage() {
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
     Miss Thu là một nhà hàng được xây dựng theo hướng <span className="font-bold">“story-led restaurant”</span>. 
     Lấy cảm hứng từ ký ức tuổi thơ ở Sài Gòn xưa tạo nên một 
     không gian ẩm thực vừa quen thuộc, vừa hiện đại và giàu cảm xúc.
    </p>
  </div>

  {/* RIGHT INFO */}
<div className="flex flex-col gap-2">

  {/* Company + Timeline */}
  <div className="flex gap-40">

    {/* Company */}
    <div>
      <p className="text-[18px] font-inter font-bold">Company</p>
      <p className="text-[16px] font-inter">Miss Thu</p>
    </div>

    {/* Timeline (đã kéo vào bên trái tự nhiên bằng gap) */}
    <div>
      <p className="text-[18px] font-inter font-bold">Timeline</p>
      <p className="text-[16px] font-inter">2021</p>
    </div>

  </div>

  {/* Role */}
  <div>
    <p className="text-[18px] font-inter font-bold">Category</p>
    <p className="text-[16px] font-inter">Branding</p>
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


  <div className="grid grid-cols-2">
    <video
  autoPlay
  muted
  loop
  playsInline
  className="w-full h-full object-cover"
>
  <source src="/project_miss_thu_restaurant/video.mp4" type="video/mp4" />
</video>
      <div className="flex justify-center items-center ml-20">
        <p className="font-inter text-[20px] leading-sugn">
          Sài Thành xưa là một thế giới giản đơn nhưng đầy cảm xúc. Những con phố nhỏ rải đều mùi thơm của 
          các quán cà phê và quán ăn đường phố. Nhìn lại những năm 90, đó là ký ức đáng nhớ với những ai đã 
          đi qua năm tháng ấy.
        </p>
      </div>

</div>

    <video
  autoPlay
  muted
  loop
  playsInline
  className="w-full h-full object-cover"
>
  <source src="/project_miss_thu_restaurant/video_v1.mp4" type="video/mp4" />
</video>
    <video
  autoPlay
  muted
  loop
  playsInline
  className="w-full h-full object-cover"
>
  <source src="/project_miss_thu_restaurant/video_v2.mp4" type="video/mp4" />
</video>

  {/* <div className="grid grid-cols-2">
<img 
src="/project_miss_thu_restaurant/1.jpg"
className="w-full h-full object-cover"
alt="XXX"
/>
      <div className="flex justify-center items-center ml-20">
        <p className="font-inter text-[20px] leading-sugn">
          Ngày nay, nhịp sống tất bật và những tòa nhà cao ngút trở thành biểu tượng của Sài Gòn. 
          Sự hòa quyện của truyền thống và hiện đại có ở mọi nơi. Tuy vậy, Sài Gòn vẫn giữ được tinh thần riêng. 
          Đó là một thành phố năng động, dễ mến và thân thiện.
        </p>
      </div>

</div> */}
<img 
src="/project_miss_thu_restaurant/2.jpg"
className="w-full h-full object-cover"
alt="XXX"
/>
  {/* <div className="grid grid-cols-2 mt-6">
<div>
    <p className="font-inter text-[28px] leading-sugn max-w-[320px]">
    Câu chuyện về sắc độ quý phái và sang trọng
    </p>
</div>
      <div>
        <p className="font-inter text-[20px] leading-sugn">
          Lấy cảm hứng từ hình ảnh quý cô thành thị vào thập niên 90 với nét kiều diễm và đài cát, logo của nhà hàng 
          Miss Thu được hợp thành từ hai màu là đỏ thắm và đen huyền bí. Qua đó, chúng tôi muốn truyền tải thông điệp của 
          nhà hàng về việc tôn vinh di sản của Sài Gòn, mang đến những trải nghiệm ẩm thực đẳng cấp.
        </p>
      </div>

</div> */}
  <div className="grid grid-cols-2 gap-2 mt-8">

      <img
        src="/project_miss_thu_restaurant/3.jpg"
        alt="Phones UI"
        className="w-full h-full object-cover"
      />

      <img
        src="/project_miss_thu_restaurant/4.svg"
        alt="Pattern"
        className="w-full h-full object-cover"
      />

  </div>
  <img 
  className="w-full h-full object-cover"
  alt="XXX"
  src="/project_miss_thu_restaurant/5.svg"
  />
    <img 
  className="w-full h-full object-cover"
  alt="XXX"
  src="/project_miss_thu_restaurant/6.svg"
  />
    <video
  autoPlay
  muted
  loop
  playsInline
  className="w-full h-full object-cover"
>
  <source src="/project_miss_thu_restaurant/video_v3.mp4" type="video/mp4" />
</video>

    <video
  autoPlay
  muted
  loop
  playsInline
  className="w-full h-full object-cover"
>
  <source src="/project_miss_thu_restaurant/7.mp4" type="video/mp4" />
</video>
  <div className="grid grid-cols-2 gap-2">

      <img
        src="/project_miss_thu_restaurant/8.jpg"
        alt="Phones UI"
        className="w-full h-full object-cover"
      />

      <img
        src="/project_miss_thu_restaurant/9.jpg"
        alt="Pattern"
        className="w-full h-full object-cover"
      />
  </div>
  <img 
  className="w-full h-full object-cover"
  alt="XXX"
  src="/project_miss_thu_restaurant/10.jpg"
  />
    <img 
  className="w-full h-full object-cover"
  alt="XXX"
  src="/project_miss_thu_restaurant/11.jpg"
  />
      <img 
  className="w-full h-full object-cover"
  alt="XXX"
  src="/project_miss_thu_restaurant/12.jpg"
  />
      <img 
  className="w-full h-full object-cover"
  alt="XXX"
  src="/project_miss_thu_restaurant/13.jpg"
  />
    <div className="grid grid-cols-2 gap-2">

      <img
        src="/project_miss_thu_restaurant/14.jpg"
        alt="Phones UI"
        className="w-full h-full object-cover"
      />

      <img
        src="/project_miss_thu_restaurant/15.jpg"
        alt="Pattern"
        className="w-full h-full object-cover"
      />
  </div>
        <img 
  className="w-full h-full object-cover"
  alt="XXX"
  src="/project_miss_thu_restaurant/16.jpg"
  />
        <img 
  className="w-full h-full object-cover"
  alt="XXX"
  src="/project_miss_thu_restaurant/17.jpg"
  />
        <img 
  className="w-full h-full object-cover"
  alt="XXX"
  src="/project_miss_thu_restaurant/18.jpg"
  />
      <div className="grid grid-cols-2 gap-2">

    <video
  autoPlay
  muted
  loop
  playsInline
  className="w-full h-full object-cover"
>
  <source src="/project_miss_thu_restaurant/video_v4.mp4" type="video/mp4" />
</video>

      <img
        src="/project_miss_thu_restaurant/19.jpg"
        alt="Pattern"
        className="w-full h-full object-cover"
      />
  </div>
        <video
  autoPlay
  muted
  loop
  playsInline
  className="w-full h-full object-cover"
>
  <source src="/project_miss_thu_restaurant/video_v5.mp4" type="video/mp4" />
</video>
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
    href={"/projects/Beer-Club-Z70#top"} className="relative overflow-hidden h-[320px]">
      <img
        src="/project_beer_club_z70/beer_club_z70.avif"
        className="w-full h-full object-cover transition-transform duration-500 cursor-none"
      />
      <span className="absolute bottom-2 left-3 text-white text-[24px] mix-blend-difference">
        Beer Club Z70
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
    href={"/projects/Sunneva-Island-Da-Nang#top"} className="relative overflow-hidden h-[320px]">
      <img
        src="/project_sunneva_island_da_nang/sunneva_island_da_nang.avif"
        className="w-full h-full object-cover transition-transform duration-500 cursor-none"
      />
      <span className="absolute bottom-2 left-3 text-white text-[24px] mix-blend-difference">
        Sunneva Island Da Nang
      </span>
    </Link>

  </div>

</div>
    </div>
  );
}