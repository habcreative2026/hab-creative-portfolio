"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export default function ContactPage() {

const dropdownRef = useRef<HTMLDivElement | null>(null);

useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setOpen(false);
    }
  }

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener(
      "mousedown",
      handleClickOutside
    );
  };
}, []);
  const services = [
  "Web Design & Development",
  "Branding Establishment",
  "Imagery Production",
  "Marketing",
];

  const [selected, setSelected] = useState("");
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen px-4 pt-40">

      {/* Header text */}
      <div className="max-w-3xl">
        <p className="max-w-auto leading-snug font-bold text-[24px]">
          I’m open to new ideas, whether it’s a full project, a collaboration, or just an early concept. 
          Let’s bring it to life together.
        </p>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-20 mt-10">

{/* LEFT - FORM */}
<div className="flex flex-col gap-6">

  {/* 2 cột - 2 hàng */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

    {/* Họ tên */}
    <div>
      <input
        type="text"
        placeholder="Họ tên*"
        className="w-full border-b border-gray-300 focus:border-gray-500 outline-none py-0.5 text-lg"
      />
    </div>

    {/* Email */}
    <div>
      <input
        type="email"
        placeholder="Email*"
        className="w-full border-b border-gray-300 focus:border-gray-500 outline-none py-0.5 text-lg"
      />
    </div>

    {/* Số điện thoại */}
    <div>
      <input
        type="tel"
        placeholder="Số điện thoại*"
        className="w-full border-b border-gray-300 focus:border-gray-500 outline-none py-0.5 text-lg"
      />
    </div>

    {/* Công ty */}
    <div>
      <input
        type="text"
        placeholder="Công ty*"
        className="w-full border-b border-gray-300 focus:border-gray-500 outline-none py-0.5 text-lg"
      />
    </div>
  </div>

  {/* Dropdown dịch vụ */}
<div ref={dropdownRef} className="relative w-full">

  {/* Trigger */}
  <button
    type="button"
    onClick={() => setOpen(!open)}
    className="w-full border border-gray-300 focus:border-gray-900 rounded-md px-2 py-2 text-left text-lg bg-white text-black"
  >
    {selected || "Bạn cần tư vấn về dịch vụ nào?"}

    <ChevronDown
      size={20}
      className={`absolute right-3 top-1/2 -translate-y-1/2 transition-transform duration-300
      ${open ? "rotate-180" : "rotate-0"}
      `}
    />
  </button>

  {/* Dropdown */}
  {open && (
    <div className="absolute left-0 mt-1 w-full rounded bg-[#DFDFDF] overflow-hidden z-50 py-2">

      {services.map((service, index) => (
        <button
          key={index}
          type="button"
          onClick={() => {
            setSelected(service);
            setOpen(false);
          }}
          className="w-full px-2 py-2 text-left transition-colors duration-300 group"
        >
          <span className="relative inline-block text-black">
            {service}

            <span
              className="
                absolute left-0 bottom-0 h-[2px] w-full bg-gray-500
                scale-x-0 origin-right
                transition-transform duration-300
                group-hover:scale-x-100 group-hover:origin-left
              "
            />
          </span>
        </button>
      ))}
    </div>
  )}
</div>

  {/* Project details */}
  <div>
    <label className="text-xs text-gray-500">Project details</label>
    <textarea
      placeholder="Enter details"
      className="w-full border-b border-gray-300 focus:border-gray-500 outline-none py-2 text-lg h-40"
    />
  </div>

  {/* Button */}
  <button onMouseEnter={() =>
  window.dispatchEvent(
    new CustomEvent("cursor-change", { detail: "userdefault" })
  )
}
  onMouseLeave={() =>
  window.dispatchEvent(
    new CustomEvent("cursor-change", { detail: "default" })
  ) } className="bg-black text-white rounded-full px-20 py-3 w-fit hover:bg-white
    hover:text-black
    hover:border-black border border-black">
    Get in touch
  </button>

</div>

        {/* RIGHT - PROFILE */}
        <div className="flex flex-col items-end gap-1">

          <p className="text-xs text-gray-500">(Creative Designer)</p>

          <img
            src="/avt_bhq.jpg"
            className="w-[340px] h-[440px] object-cover"
          />

<div className="w-[340px] text-sm flex flex-col">

  {/* Email */}
  <a
    href="mailto:buihaitrong.dev@gmail.com"
    className="relative group border-b border-gray-400 pb-1 pt-1 cursor-pointer overflow-hidden block"
  >
    <span
      className="
        absolute left-0 top-0 h-full w-full bg-black
        scale-x-0 origin-right
        transition-transform duration-300
        group-hover:scale-x-100 group-hover:origin-left
        z-0
      "
    ></span>

    <span className="relative z-10 block">
      <span className="block group-hover:hidden text-black">
        Email
      </span>
      <span className="hidden group-hover:block text-white">
        buihaiqui@gmail.com
      </span>
    </span>
  </a> 

  {/* Phone */}
  <a
    href="tel:+84973112480"
    className="relative group border-b border-gray-400 pb-1 pt-1 cursor-pointer overflow-hidden block"
  >
    <span
      className="
        absolute left-0 top-0 h-full w-full bg-black
        scale-x-0 origin-right
        transition-transform duration-300
        group-hover:scale-x-100 group-hover:origin-left
        z-0
      "
    ></span>

    <span className="relative z-10 block">
      <span className="block group-hover:hidden text-black">
        Phone number
      </span>
      <span className="hidden group-hover:block text-white">
        +84925555958 
      </span>
    </span>
  </a>

<a
  href="https://www.google.com/maps/search/?api=1&query=Ho+Chi+Minh+City"
  target="_blank"
  rel="noopener noreferrer"
  className="relative group border-b border-gray-400 pb-1 pt-1 cursor-pointer overflow-hidden block"
>
  <span
    className="
      absolute left-0 top-0 h-full w-full bg-black
      scale-x-0 origin-right
      transition-transform duration-300
      group-hover:scale-x-100 group-hover:origin-left
      z-0
    "
  ></span>

  <span className="relative z-10 block">
    <span className="block group-hover:hidden text-black">
      Based in
    </span>
    <span className="hidden group-hover:block text-white">
      TpHcm, Vietnamese
    </span>
  </span>
</a>
</div>
        </div>
      </div>
<h1 
className=" text-7xl font-light leading-tight 
tracking-[-0.03em] bg-gradient-to-r from-[#8b6b2f] 
via-[#f3deb0] to-[#8b6b2f] bg-[length:200%_100%] bg-clip-text 
text-transparent animate-shimmer " > 
{/* BÙI HẢI TRỌNG <br /> 
BACKEND DEVELOPER <br /> 
TRƯỜNG ĐẠI HỌC NGUYỄN TẤT THÀNH  */}
</h1>
    </div>
  );
}