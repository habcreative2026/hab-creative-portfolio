"use client";
import { motion, useScroll, useSpring, useTransform, Variants, useAnimationControls } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import AboutRevealSection from "./AboutRevealSection";

export default function ContentPage( ) {
  

  // const images = [
  //   "https://framerusercontent.com/images/YtnnlG8omfkA1HIQHTazsET9Go.webp?scale-down-to=1024&width=4000&height=2668",
  //   "https://framerusercontent.com/images/hLsi61VRnXvmM7Mz9NpHzgROGc.webp?scale-down-to=1024&width=4500&height=3375",
  //   "https://framerusercontent.com/images/ZuQL0zmRgbgiuiXsjJnv48VrVY.webp?scale-down-to=1024&width=5000&height=3750",
  // ];
const controls = useAnimationControls();
  // const [index, setIndex] = useState(0);

useEffect(() => {
  controls.start({
    x: ["0%", "-50%"],
    transition: {
      duration: 50,
      ease: "linear",
      repeat: Infinity,
    },
  });
}, []);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setIndex((prev) => (prev + 1) % images.length);
  //   }, 1000);
  //   return () => clearInterval(interval);
  // }, []);

            
  const { scrollY } = useScroll();

  const titleYRaw = useTransform(scrollY, [0, 500], [0, -250]);

  const titleY = useSpring(titleYRaw, {
    stiffness: 80,
    damping: 20,
    mass: 0.5,
  });

  const contentYRaw = useTransform(scrollY, [0, 400], [40, 0]);

const contentY = useSpring(contentYRaw, {
  stiffness: 60,
  damping: 25,
  mass: 0.8,
});

  // const container : Variants = {
  //   hidden: {},
  //   show: {
  //     transition: {
  //       staggerChildren: 0.1,
  //     },
  //   },
  // };

  // const item : Variants = {
  //   hidden: { opacity: 0, y: 20 },
  //   show: {
  //     opacity: 1,
  //     y: 0,
  //     transition: { duration: 0.4, ease: "easeOut" },
  //   },
  // };

  const number : Variants = {
    hidden: { opacity: 0, y: 40, scale: 0.9 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  const card = (delay: number): Variants => ({
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      delay,
    },
  },
});
  return (
    <>
    <nav className="sticky top-0 z-0 bg-white pt-40 overflow-hidden">
<motion.h1 
  style={{ y: titleY }} 
  className="flex items-center max-w-full font-bold tracking-tight text-[48px] md:text-[120px] lg:text-[180px] leading-none uppercase px-4"
>
  <span>HAB</span>

  <span className="flex-1 mx-4 overflow-hidden">
    <motion.span
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: "100%", opacity: 1 }}
      transition={{
        duration: 1.2,
        ease: [0.22, 1, 0.36, 1], 
        delay: 0.2,
      }}
      className="block h-[20px] bg-black origin-left"
    />
  </span>

  <span>CREATIVE</span>
</motion.h1>
</nav>
    <motion.section 
      style={{ y: contentY  }}
      className="relative z-10 bg-white py-4 -mt-2 px-4"
    >
      <p
        className="text-[32px] font-bold leading-tight"
        style={{ textIndent: "170px" }}
      >
        I design and develop digital experiences that bring ideas to life,
        blending creativity and technology to craft brands, products, and
        interfaces that are intuitive, inspiring, and built to last, with a
        focus on creating meaningful connections between people and design.
      </p>


<div className="mt-4">
  {/* Header row */}
  <div className="flex items-center justify-between">
    {/* Arrow + text */}
<div className="flex items-center">
  {/* Arrow */}
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, ease: "easeOut" }}
    viewport={{ once: true, margin: "-40px" }}
  >
<svg
  width="80"
  height="80"
  viewBox="0 0 96.117 96.189"
  fill="black" 
  className="rotate-90 mb-2"
>
  <path d="M 96.117 0.005 L 96.112 96.189 L 75.656 96.175 L 75.661 34.961 L 14.529 96.083 L 0.063 81.617 L 61.219 20.461 L 0.005 20.466 L 0 0 Z" />
</svg>
  </motion.div>

  {/* Text */}
  <span
    className="text-xs text-gray-500 -mb-10 ml-4"
  >
    Product Design, Web Design, Branding
  </span>
</div>

    <span className="text-xs font-bold -mb-10">Selected work (6)</span>
  </div>

  {/* Grid images */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
    {/* Item 1 */}
    <Link href={"/projects/the-beverly#top"} className="relative overflow-hidden h-[600px]">
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
        src="/project_the_beverly/vinhomes_grand_park.avif"
        className="w-full h-full object-cover cursor-none"
      />
      <span className="absolute bottom-3 left-3 text-white text-[24px] mix-blend-difference">
        The Beverly, HCMC
      </span>
    </Link>

    {/* Item 2 */}
    <Link href={"/projects/Le-Palmier-Ho-Tram#top"} className="relative overflow-hidden h-[600px]">
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
        src="/project_le_palmier_ho_tram/avt.jpg"
        className="w-full h-full object-cover cursor-none"
      />
      <span className="absolute bottom-3 left-3 text-white text-[24px] mix-blend-difference">
        Le Palmier Ho Tram
      </span>
    </Link>

    {/* Item 3 */}
    <Link href={"/projects/Beer-Club-Z70#top"} className="relative overflow-hidden h-[600px]">
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
        src="/project_beer_club_z70/beer_club_z70.avif"
        className="w-full h-full object-cover cursor-none"
      />
            <span className="absolute bottom-3 left-3 text-white text-[24px] mix-blend-difference">
        Beer Club Z70
      </span>
    </Link>

    {/* Item 4 */}
    <Link href={"/projects/Sunneva-Island-Da-Nang#top"} className="relative overflow-hidden h-[600px]">
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
        src="/project_sunneva_island_da_nang/sunneva_island_da_nang.avif"
        className="w-full h-full object-cover cursor-none"
      />
            <span className="absolute bottom-3 left-3 text-white text-[24px] mix-blend-difference">
        Sunneva Island Da Nang
      </span>
    </Link>

        {/* Item 5 */}
    <Link href={"/projects/Miss-Thu-Restaurant#top"} className="relative overflow-hidden h-[600px]">
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
        src="/project_miss_thu_restaurant/avt.jpg"
        className="w-full h-full object-cover cursor-none"
      />
            <span className="absolute bottom-3 left-3 text-white text-[24px] mix-blend-difference">
        Miss Thu Restaurant
      </span>
    </Link>

        {/* Item 6 */}
    <Link href={"/projects/eightball#top"} className="relative overflow-hidden h-[600px]">
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
        src="/project_flora_panorama/flora_panorama.avif"
        className="w-full h-full object-cover cursor-none"
      />
            <span className="absolute bottom-3 left-3 text-white text-[24px] mix-blend-difference">
        Flora Panorama
      </span>
    </Link>
  </div>
</div>

   <div className="mt-2">

      {/* Top right link */}
      <Link href={"/projects"} className="flex justify-end mb-14 mt-4">
<span className="relative cursor-pointer text-[42px] font-bold group">
  View all projects (17)

  <span className="
    absolute left-0 bottom-0 h-[2px] w-full bg-black
    scale-x-0 origin-right
    transition-transform duration-300
    group-hover:scale-x-100 group-hover:origin-left
  "></span>
</span>
      </Link>

<div
  className="
    overflow-hidden
    w-full
    [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]
    [-webkit-mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]
    mb-16 mt-8 pt-8
  "
>
  <div className="flex w-max animate-marquee">
    {/* set 1 */}
    <div className="flex items-center gap-16 pr-16 shrink-0">
      <img src="/category_logo/category_logo_v0.png" className="h-7 w-auto" />
      <img src="/category_logo/category_logo_v1.png" className="h-7 w-auto" />
      <img src="/category_logo/category_logo_v2.png" className="h-7 w-auto" />
      <img src="/category_logo/category_logo_v3.png" className="h-7 w-auto" />
      <img src="/category_logo/category_logo_v4.png" className="h-7 w-auto" />
      <img src="/category_logo/category_logo_v5.png" className="h-7 w-auto" />
    </div>

    {/* set 2 */}
    <div className="flex items-center gap-16 pr-16 shrink-0">
      <img src="/category_logo/category_logo_v0.png" className="h-7 w-auto" />
      <img src="/category_logo/category_logo_v1.png" className="h-7 w-auto" />
      <img src="/category_logo/category_logo_v2.png" className="h-7 w-auto" />
      <img src="/category_logo/category_logo_v3.png" className="h-7 w-auto" />
      <img src="/category_logo/category_logo_v4.png" className="h-7 w-auto" />
      <img src="/category_logo/category_logo_v5.png" className="h-7 w-auto" />
    </div>
  </div>
</div>
    </div>


<AboutRevealSection  />
<motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      className="bg-white relative mt-20 pt-20 w-full flex items-center justify-center"
    >
      {/* Container trung tâm */}
      <div className="relative w-[96px] h-[96px]">

        {/* Mũi tên 1 */}
        <motion.svg
          viewBox="0 0 96.117 96.189"
          className="absolute inset-0 w-full h-full translate-y-4 -translate-x-12"
          fill="black"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <path d="M 96.117 0.005 L 96.112 96.189 L 75.656 96.175 L 75.661 34.961 L 14.529 96.083 L 0.063 81.617 L 61.219 20.461 L 0.005 20.466 L 0 0 Z" />
        </motion.svg>

        {/* Mũi tên 2 (xuất hiện trước) */}
        <motion.svg
          viewBox="0 0 96.117 96.189"
          className="absolute inset-0 w-full h-full rotate-180 -translate-y-20 translate-x-12"
          fill="black"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <path d="M 96.117 0.005 L 96.112 96.189 L 75.656 96.175 L 75.661 34.961 L 14.529 96.083 L 0.063 81.617 L 61.219 20.461 L 0.005 20.466 L 0 0 Z" />
        </motion.svg>


        {/* Layout text */}
        <div className="relative flex items-center justify-center">

          {/* Trái */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
            className="
              absolute right-1/2
              -translate-y-[25px]
              -translate-x-[15px]
              text-right whitespace-nowrap
              text-[80px] font-bold leading-none tracking-tighter
            "
          >
            HAB
          </motion.h1>

          {/* Phải */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.7, ease: "easeOut" }}
            className="
              absolute left-1/2
              translate-y-[55px]
              translate-x-[5px]
              text-left whitespace-nowrap
              text-[80px] font-bold leading-none tracking-tighter
            "
          >
            CRE
          </motion.h1>

        </div>
      </div>
    </motion.div>


 <section className="pt-10 mt-10">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start"
      >
        {/* LEFT CONTENT */}
        <div>
          <p className="text-sm text-gray-400">Clients</p>

          <h2
            className="text-[32px] font-bold leading-tight max-w-[700px] -mt-2"
            style={{ textIndent: "140px" }}
          >
            Over the years, I’ve had the privilege of collaborating with a wide
            range of clients, from startups and small businesses to established
            brands. Each partnership is an opportunity to bring a unique vision
            to life, solve complex challenges, and deliver digital experiences
            that make a lasting impact.
          </h2>
        </div>

        {/* RIGHT NUMBER */}
        <motion.div
          variants={number}
          className="flex flex-col items-end"
        >
          <h2 className="text-[120px] text-start justify-end md:text-[160px] font-bold leading-none mt-10 pt-10">
            32+
          </h2>
          <span className="text-[64px] text-gray-400 -mt-6">
            Clients
          </span>
        </motion.div>
      </motion.div>

      {/* CLIENT GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">

        {/* Card 1 */}
        <motion.div
          variants={card(0)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="relative h-[220px] overflow-hidden"
        >
          <img
            src="/project_the_beverly/vinhomes_grand_park.avif"
            className="w-full h-full object-cover"
          />
          {/* <span className="absolute inset-0 flex items-center justify-center text-white text-lg font-semibold mix-blend-difference">
            Ikigai Labs
          </span> */}
        </motion.div>

        {/* Card 2 */}
        <motion.div
          variants={card(0.15)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="relative h-[220px] overflow-hidden"
        >
          <img
            src="/project_le_palmier_ho_tram/avt.jpg"
            className="w-full h-full object-cover"
          />
          {/* <span className="absolute inset-0 flex items-center justify-center text-white text-lg font-semibold mix-blend-difference">
            Eightball
          </span> */}
        </motion.div>

        {/* Card 3 */}
        <motion.div
          variants={card(0.3)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="relative h-[220px] overflow-hidden"
        >
          <img
            src="/project_beer_club_z70/beer_club_z70.avif"
            className="w-full h-full object-cover"
          />
          {/* <span className="absolute inset-0 flex items-center justify-center text-white text-lg font-semibold mix-blend-difference">
            Lightspeed
          </span> */}
        </motion.div>

        {/* Card 4 */}
        <motion.div
          variants={card(0.45)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="relative h-[220px] overflow-hidden"
        >
          <img
            src="/project_sunneva_island_da_nang/sunneva_island_da_nang.avif"
            className="w-full h-full object-cover"
          />
          {/* <span className="absolute inset-0 flex items-center justify-center text-white text-lg font-semibold mix-blend-difference">
            CloudWatch
          </span> */}
        </motion.div>
      </div>

      {/* CTA */}
      <Link href={"/contact#top"} className="flex justify-end mt-10 mb-10">
        <span className="relative cursor-pointer text-[42px] font-bold group">
          Start a project

          <span
            className="
              absolute left-0 bottom-0 h-[2px] w-full bg-black
              scale-x-0 origin-right
              transition-transform duration-300
              group-hover:scale-x-100 group-hover:origin-left
            "
          ></span>
        </span>
      </Link>
    </section>
    </motion.section>
    </>
  );
} 

{/* <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start"
    >
      
      {/* Left */}
      // <motion.div variants={item}>
      //   <h2 className="text-[160px] font-bold leading-none">7</h2>
      //   <p className="text-[50px] text-gray-600 -mt-4">
      //     Years of Experience
      //   </p>

        {/* Image auto change */}
{/* <motion.div
  variants={item}
  className="mt-4 h-[400px] w-full overflow-hidden"
>
  <motion.img
    src={images[index]}
    initial={{ scale: 0.5, opacity: 0 }}
    whileInView={{ scale: 1, opacity: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.7, ease: "easeOut" }}
    className="w-full h-full object-cover"
  />
</motion.div> */}
      // </motion.div>

      {/* Right */}
      // <motion.div variants={item}>
      //   <p className="text-sm text-gray-400 mb-2">What I Do</p>

      //   <p
      //     className="text-[32px] font-bold mb-10 -mt-4 leading-tight"
      //     style={{ textIndent: "170px" }}
        // >
          {/* Whether it’s building a distinctive brand identity, designing
          interfaces that feel effortless, or developing websites that perform
          seamlessly, my work is about turning vision into tangible results.
          Each service is shaped to not only solve problems but to create
          opportunities for growth, clarity, and impact. */}
        {/* </p> */}

        {/* Tags */}
//         <motion.div
//           variants={container}
//           className="flex flex-wrap gap-1 justify-end max-w-[580px] ml-auto mt-38 pt-38"
//         >
//           {[
//             "Product Design",
//             "Web Design",
//             "Typography",
//             "Brand Identity",
//             "Design Systems",
//             "Interaction Design",
//             "Prototyping",
//             "Logo Design",
//             "User Interface Design (UI)",
//             "User Experience Design (UX)",
//             "Motion Design",
//             "Pitch Deck Design",
//           ].map((itemText, i) => (
//             <motion.span
//               key={i}
//               variants={item}
//         className="font-inter
//   px-6 py-4
//   rounded-full
//   text-sm
//   bg-gray-200
//   text-black
//   border border-transparent
//   transition-all duration-200 ease-out
//   hover:bg-black
//   hover:text-white
// "
//               onMouseEnter={() =>
//   window.dispatchEvent(
//     new CustomEvent("cursor-change", { detail: "userdefault" })
//   )
// }
//   onMouseLeave={() =>
//   window.dispatchEvent(
//     new CustomEvent("cursor-change", { detail: "default" })
//   ) } 
  
//             >
//               {itemText}
//                 <span className="
//     absolute left-0 bottom-0 h-[2px] w-full bg-black
//     scale-x-0 origin-right
//     transition-transform duration-300
//     group-hover:scale-x-100 group-hover:origin-left
//   "></span>
//             </motion.span>
//           ))}
//         </motion.div>
//       </motion.div>
    // </motion.div>