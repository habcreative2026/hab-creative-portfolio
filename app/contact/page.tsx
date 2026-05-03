"use client";

import { useState } from "react";

export default function ContactPage() {
  const [selected, setSelected] = useState("");
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

          {/* Name */}
          <div>
            <label className="text-sm text-gray-500">Name *</label>
            <input
              type="text"
              placeholder="Enter name"
              className="w-full border-b border-gray-300 focus:border-gray-500 outline-none py-2 text-xl" 
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm text-gray-500">Email *</label>
            <input
              type="email"
              placeholder="Enter email"
              className="w-full border-b border-gray-300 focus:border-gray-500 outline-none py-2 text-xl"
            />
          </div>

          {/* Budget */}
          <div>
            <p className="text-sm text-gray-500 mb-3">Budget *</p>

            <div className="flex flex-col gap-2 text-[20px]">
      <label
        className={`flex items-center gap-2 cursor-pointer ${
          selected === "under" ? "text-gray-700" : "text-gray-400"
        }`}
      >
        <input
          type="radio"
          name="budget"
          value="under"
          checked={selected === "under"}
          onChange={(e) => setSelected(e.target.value)}
          className="appearance-none
              w-5 h-5
              border-1 border-black
              rounded-full
              checked:bg-black
              checked:border-black
              transition"
        />
        Under $5,000
      </label>

      <label
        className={`flex items-center gap-2 cursor-pointer ${
          selected === "5-10" ? "text-gray-700" : "text-gray-400"
        }`}
      >
        <input
          type="radio"
          name="budget"
          value="5-10"
          checked={selected === "5-10"}
          onChange={(e) => setSelected(e.target.value)}
          className="appearance-none
              w-5 h-5
              border-1 border-black
              rounded-full
              checked:bg-black
              checked:border-black
              transition"
        />
        $5,000 — $10,000
      </label>

      <label
        className={`flex items-center gap-2 cursor-pointer ${
          selected === "10-25" ? "text-gray-700" : "text-gray-400"
        }`}
      >
        <input
          type="radio"
          name="budget"
          value="10-25"
          checked={selected === "10-25"}
          onChange={(e) => setSelected(e.target.value)}
          className="appearance-none
              w-5 h-5
              border-1 border-black
              rounded-full
              checked:bg-black
              checked:border-black
              transition"
        />
        $10,000 — $25,000
      </label>

      <label
        className={`flex items-center gap-2 cursor-pointer ${
          selected === "25-50" ? "text-gray-700" : "text-gray-400"
        }`}
      >
        <input
          type="radio"
          name="budget"
          value="25-50"
          checked={selected === "25-50"}
          onChange={(e) => setSelected(e.target.value)}
          className="appearance-none
              w-5 h-5
              border-1 border-black
              rounded-full
              checked:bg-black
              checked:border-black
              transition"
        />
        $25,000 — $50,000
      </label>
    </div>
          </div>

          {/* Details */}
          <div>
            <label className="text-xs text-gray-500">Project details</label>
            <textarea
              placeholder="Enter details"
              className="w-full border-b border-gray-300 focus:border-gray-500 outline-none py-2 text-lg h-50 "
            />
          </div>

          {/* Button */}
          <button className="bg-black text-white rounded-full px-20 py-2.5 w-fit">
            Get in touch
          </button>

        </div>

        {/* RIGHT - PROFILE */}
        <div className="flex flex-col items-end gap-1">

          <p className="text-xs text-gray-500">(Designer & Creative developer)</p>

          <img
            src="https://framerusercontent.com/images/HJPj99RmXiLIxX1HUuCfHYDwAEs.jpg?scale-down-to=1024&width=904&height=1200"
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
        buihaitrong.dev@gmail.com
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
        +83973112480
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

    </div>
  );
}