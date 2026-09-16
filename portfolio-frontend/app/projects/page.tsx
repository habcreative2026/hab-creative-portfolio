// // "use client";
// // import { useEffect, useState } from "react";
// // import { motion, type Transition } from "framer-motion";
// // import Link from "next/link";
// // import { useLanguage } from "../i18n/LanguageContext";

// // interface CardProject {
// //   _id: string;
// //   title: string;
// //   location: string;
// //   client: string;
// //   slug: string;
// //   projectsPageImage: string;
// // }

// // export default function ProjectPage() {
// //   const { t } = useLanguage();
// //   const [projects, setProjects] = useState<CardProject[]>([]);
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     const fetchProjects = async () => {
// //       try {
// //         const apiUrl = process.env.NEXT_PUBLIC_API_URL;
// //         const res = await fetch(`${apiUrl}/api/cards?type=projects`);
// //         const resData = await res.json();
// //         if (resData.success) {
// //           setProjects(resData.data);
// //         }
// //       } catch (error) {
// //         console.error("Lỗi khi fetch danh sách dự án:", error);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };
// //     fetchProjects();
// //   }, []);

// //   const text2Variants = {
// //     rest: { opacity: 0, y: 0 },
// //     hover: { opacity: 1, y: 0 },
// //   };

// //   const smooth: Transition = { duration: 0.6, ease: [0.16, 1, 0.3, 1] };

// //   if (loading) {
// //     return (
// //       <div className="min-h-screen flex items-center justify-center font-mono text-xs text-white">
// //         ...
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="min-h-screen pt-28 md:pt-40 px-4">
// //       <div className="flex flex-col md:flex-row justify-between gap-4 md:gap-0 mb-8">
// //         <p className="max-w-[600px] leading-snug font-bold text-[18px] md:text-[24px]">
// //           {t("project666")}
// //         </p>
// //         <p className="text-[18px] md:text-[24px] font-bold">{t("numberpj")}</p>
// //       </div>
// //       <div className="grid grid-cols-1 md:grid-cols-2 gap-3 gap-y-6">
// //         {projects.map((project) => (
// //           <motion.div
// //             key={project._id}
// //             initial="rest"
// //             whileHover="hover"
// //             animate="rest"
// //             className="cursor-pointer"
// //           >
// //             <Link
// //               href={`/projects/${project.slug}#top`}
// //               className="relative overflow-hidden"
// //             >
// //               <motion.img
// //                 onMouseEnter={() =>
// //                   window.dispatchEvent(
// //                     new CustomEvent("cursor-change", { detail: "image" }),
// //                   )
// //                 }
// //                 onMouseLeave={() =>
// //                   window.dispatchEvent(
// //                     new CustomEvent("cursor-change", { detail: "default" }),
// //                   )
// //                 }
// //                 src={project.projectsPageImage}
// //                 className="w-full h-[300px] sm:h-[420px] md:h-[520px] object-cover cursor-none"
// //                 alt="Project Cover Image"
// //               />
// //             </Link>
// //             <div className="mt-3 px-2 md:px-4">
// //               <p className="text-base md:text-lg">{t(project.title)}</p>
// //               <motion.p
// //                 variants={text2Variants}
// //                 transition={smooth}
// //                 className="text-sm text-gray-500"
// //               >
// //                 {t(project.client)}
// //               </motion.p>
// //             </div>
// //           </motion.div>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // }

// "use client";
// import { useEffect, useState } from "react";
// import { motion, type Transition } from "framer-motion";
// import Link from "next/link";
// import { useLanguage } from "../i18n/LanguageContext";
// import { useTranslationStyle } from "../context/TextStyleContext";

// interface CardProject {
//   _id: string;
//   title: string;
//   location: string;
//   client: string;
//   slug: string;
//   projectsPageImage: string;
// }

// export default function ProjectPage() {
//   const { t } = useLanguage();
//   const [projects, setProjects] = useState<CardProject[]>([]);
//   const [loading, setLoading] = useState(true);

//   // 🆕 Text styles
//   const styleProject666 = useTranslationStyle("project666");
//   const styleNumberPj = useTranslationStyle("numberpj");

//   useEffect(() => {
//     const fetchProjects = async () => {
//       try {
//         const apiUrl = process.env.NEXT_PUBLIC_API_URL;
//         const res = await fetch(`${apiUrl}/api/cards?type=projects`);
//         const resData = await res.json();
//         if (resData.success) {
//           setProjects(resData.data);
//         }
//       } catch (error) {
//         console.error("Lỗi khi fetch danh sách dự án:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchProjects();
//   }, []);

//   const text2Variants = {
//     rest: { opacity: 0, y: 0 },
//     hover: { opacity: 1, y: 0 },
//   };

//   const smooth: Transition = { duration: 0.6, ease: [0.16, 1, 0.3, 1] };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center font-mono text-xs text-white">
//         ...
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen pt-28 md:pt-40 px-4">
//       <div className="flex flex-col md:flex-row justify-between gap-4 md:gap-0 mb-8">
//         <p
//           className="max-w-[600px] leading-snug font-bold text-[18px] md:text-[24px]"
//           style={styleProject666}
//         >
//           {t("project666")}
//         </p>
//         <p
//           className="text-[18px] md:text-[24px] font-bold"
//           style={styleNumberPj}
//         >
//           {t("numberpj")}
//         </p>
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-3 gap-y-6">
//         {projects.map((project) => (
//           <motion.div
//             key={project._id}
//             initial="rest"
//             whileHover="hover"
//             animate="rest"
//             className="cursor-pointer"
//           >
//             <Link
//               href={`/projects/${project.slug}#top`}
//               className="relative overflow-hidden"
//             >
//               <motion.img
//                 onMouseEnter={() =>
//                   window.dispatchEvent(
//                     new CustomEvent("cursor-change", { detail: "image" }),
//                   )
//                 }
//                 onMouseLeave={() =>
//                   window.dispatchEvent(
//                     new CustomEvent("cursor-change", { detail: "default" }),
//                   )
//                 }
//                 src={project.projectsPageImage}
//                 className="w-full h-[300px] sm:h-[420px] md:h-[520px] object-cover cursor-none"
//                 alt="Project Cover Image"
//               />
//             </Link>
//             <div className="mt-3 px-2 md:px-4">
//               <p className="text-base md:text-lg">{t(project.title)}</p>
//               <motion.p
//                 variants={text2Variants}
//                 transition={smooth}
//                 className="text-sm text-gray-500"
//               >
//                 {t(project.client)}
//               </motion.p>
//             </div>
//           </motion.div>
//         ))}
//       </div>
//     </div>
//   );
// }

"use client";
import { useEffect, useState } from "react";
import { motion, type Transition } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "../i18n/LanguageContext";
import { useTranslationStyle } from "../context/TextStyleContext";

interface CardStyleData {
  font: string;
  weight: number;
  size: number;
  color: string;
}

interface CardProject {
  _id: string;
  title: string;
  location: string;
  client: string;
  slug: string;
  projectsPageImage: string;
  // 🆕
  titleStyle?: CardStyleData;
  clientStyle?: CardStyleData;
}

// 🆕 Helper
const getStyleCSS = (style?: CardStyleData): React.CSSProperties => {
  if (!style) return {};
  const css: React.CSSProperties = {};

  if (style.font) css.fontFamily = `"${style.font}", sans-serif`;
  if (style.weight && style.weight > 0) css.fontWeight = style.weight;
  if (style.size && style.size > 0) css.fontSize = `${style.size}px`;
  if (style.color) css.color = style.color;

  return css;
};

export default function ProjectPage() {
  const { t } = useLanguage();
  const [projects, setProjects] = useState<CardProject[]>([]);
  const [loading, setLoading] = useState(true);

  const styleProject666 = useTranslationStyle("project666");
  const styleNumberPj = useTranslationStyle("numberpj");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${apiUrl}/api/cards?type=projects`);
        const resData = await res.json();
        if (resData.success) {
          setProjects(resData.data);
        }
      } catch (error) {
        console.error("Lỗi khi fetch danh sách dự án:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const text2Variants = {
    rest: { opacity: 0, y: 0 },
    hover: { opacity: 1, y: 0 },
  };

  const smooth: Transition = { duration: 0.6, ease: [0.16, 1, 0.3, 1] };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-xs text-white">
        ...
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 md:pt-40 px-4">
      <div className="flex flex-col md:flex-row justify-between gap-4 md:gap-0 mb-8">
        <p
          className="max-w-[600px] leading-snug font-bold text-[18px] md:text-[24px]"
          style={styleProject666}
        >
          {t("project666")}
        </p>
        <p
          className="text-[18px] md:text-[24px] font-bold"
          style={styleNumberPj}
        >
          {t("numberpj")}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 gap-y-6">
        {projects.map((project) => (
          <motion.div
            key={project._id}
            initial="rest"
            whileHover="hover"
            animate="rest"
            className="cursor-pointer"
          >
            <Link
              href={`/projects/${project.slug}#top`}
              className="relative overflow-hidden"
            >
              <motion.img
                onMouseEnter={() =>
                  window.dispatchEvent(
                    new CustomEvent("cursor-change", { detail: "image" }),
                  )
                }
                onMouseLeave={() =>
                  window.dispatchEvent(
                    new CustomEvent("cursor-change", { detail: "default" }),
                  )
                }
                src={project.projectsPageImage}
                className="w-full h-[300px] sm:h-[420px] md:h-[520px] object-cover cursor-none"
                alt="Project Cover Image"
              />
            </Link>
            <div className="mt-3 px-2 md:px-4">
              {/* 🆕 Apply titleStyle */}
              <p
                className="text-base md:text-lg"
                style={getStyleCSS(project.titleStyle)}
              >
                {t(project.title)}
              </p>
              {/* 🆕 Apply clientStyle */}
              <motion.p
                variants={text2Variants}
                transition={smooth}
                className="text-sm text-gray-500"
                style={getStyleCSS(project.clientStyle)}
              >
                {t(project.client)}
              </motion.p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}