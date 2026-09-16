// "use client";
// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { useLanguage } from "../i18n/LanguageContext";

// interface CardProject {
//   _id: string;
//   title: string;
//   location: string;
//   slug: string;
//   homeImage: string;
//   order: number;
// }

// export default function ProjectContent() {
//   const { t } = useLanguage();
//   const pathname = usePathname();
//   const [projects, setProjects] = useState<CardProject[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchAllProjects = async () => {
//       try {
//         const apiUrl = process.env.NEXT_PUBLIC_API_URL;
//         const res = await fetch(`${apiUrl}/api/cards`);
//         const resData = await res.json();

//         if (resData.success) {
//           const sorted = resData.data.sort(
//             (a: CardProject, b: CardProject) => a.order - b.order,
//           );
//           setProjects(sorted);
//         }
//       } catch (error) {
//         console.error("Lỗi fetch danh sách dự án:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchAllProjects();
//   }, []);

//   if (loading)
//     return (
//       <div className="min-h-screen flex items-center justify-center font-mono text-xs text-white">
//         ...
//       </div>
//     );

//   const isHomePage = pathname === "/";
//   const displayedProjects = isHomePage ? projects.slice(0, 6) : projects;

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
//       {displayedProjects.map((project) => (
//         <Link
//           key={project._id}
//           href={`/projects/${project.slug}#top`}
//           className="relative overflow-hidden h-[320px] sm:h-[420px] md:h-[600px]"
//         >
//           <img
//             onMouseEnter={() =>
//               window.dispatchEvent(
//                 new CustomEvent("cursor-change", { detail: "image" }),
//               )
//             }
//             onMouseLeave={() =>
//               window.dispatchEvent(
//                 new CustomEvent("cursor-change", { detail: "default" }),
//               )
//             }
//             src={project.homeImage}
//             className="w-full h-full object-cover cursor-none"
//             alt="Project Asset"
//           />
//           <span className="absolute bottom-3 left-3 text-white text-[16px] sm:text-[20px] md:text-[24px] mix-blend-difference">
//             {t(project.title)}
//           </span>
//         </Link>
//       ))}
//     </div>
//   );
// }

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "../i18n/LanguageContext";

// 🆕 Style type
interface CardStyleData {
  font?: string;
  weight?: number;
  size?: number;
  color?: string;
}

interface CardProject {
  _id: string;
  title: string;
  location: string;
  slug: string;
  homeImage: string;
  order: number;
  titleStyle?: CardStyleData; // 🆕
}

// 🆕 Helper convert style → CSS
const getStyleCSS = (style?: CardStyleData): React.CSSProperties => {
  if (!style) return {};
  const css: React.CSSProperties = {};

  if (style.font) css.fontFamily = `"${style.font}", sans-serif`;
  if (style.weight && style.weight > 0) css.fontWeight = style.weight;
  if (style.size && style.size > 0) css.fontSize = `${style.size}px`;
  if (style.color) css.color = style.color;

  return css;
};

export default function ProjectContent() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [projects, setProjects] = useState<CardProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllProjects = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${apiUrl}/api/cards`);
        const resData = await res.json();

        if (resData.success) {
          const sorted = resData.data.sort(
            (a: CardProject, b: CardProject) => a.order - b.order,
          );
          setProjects(sorted);
        }
      } catch (error) {
        console.error("Lỗi fetch danh sách dự án:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllProjects();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-xs text-white">
        ...
      </div>
    );

  const isHomePage = pathname === "/";
  const displayedProjects = isHomePage ? projects.slice(0, 6) : projects;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
      {displayedProjects.map((project) => (
        <Link
          key={project._id}
          href={`/projects/${project.slug}#top`}
          className="relative overflow-hidden h-[320px] sm:h-[420px] md:h-[600px]"
        >
          <img
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
            src={project.homeImage}
            className="w-full h-full object-cover cursor-none"
            alt="Project Asset"
          />
          {/* 🆕 Chỉ thêm style vào span */}
          <span
            className="absolute bottom-3 left-3 text-white text-[16px] sm:text-[20px] md:text-[24px] mix-blend-difference"
            style={getStyleCSS(project.titleStyle)}
          >
            {t(project.title)}
          </span>
        </Link>
      ))}
    </div>
  );
}