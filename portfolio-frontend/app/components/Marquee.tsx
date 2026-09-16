// "use client";

// import { useEffect, useState } from "react";

// interface LogoItem {
//   _id: string;
//   url: string;
// }

// const Marquee = () => {
//   const [logos, setLogos] = useState<string[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let isMounted = true;

//     const fetchLogos = async () => {
//       try {
//         const res = await fetch(
//           `${process.env.NEXT_PUBLIC_API_URL}/api/marquee`,
//         );
//         const data = await res.json();
//         if (
//           isMounted &&
//           data.success &&
//           Array.isArray(data.data) &&
//           data.data.length > 0
//         ) {
//           setLogos(data.data.map((item: LogoItem) => item.url));
//         }
//       } catch (err) {
//         console.error("Lỗi đồng bộ dữ liệu Marquee:", err);
//       } finally {
//         if (isMounted) setLoading(false);
//       }
//     };

//     fetchLogos();

//     return () => {
//       isMounted = false;
//     };
//   }, []);

//   if (loading || logos.length === 0) return null;

//   const tripleLogos = [...logos, ...logos, ...logos];

//   return (
//     <div className="w-full overflow-hidden mt-12 pt-12 mb-18 hidden sm:block">
//       <div className="flex [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
//         {/* Dải animation CSS: Dừng khi hover chuột hoặc chạm giữ trên mobile */}
//         <div className="flex flex-nowrap min-w-max animate-marquee hover:[animation-play-state:paused] active:[animation-play-state:paused]">
//           {tripleLogos.map((logo, index) => (
//             <div
//               key={`${logo}-${index}`}
//               className="
//                 flex-shrink-0
//                 px-4 sm:px-6 md:px-8
//                 w-[140px] sm:w-[170px] md:w-[200px] lg:w-[220px]
//                 cursor-pointer
//                 transition-transform duration-200
//                 hover:opacity-60 hover:scale-105
//               "
//             >
//               <img
//                 src={logo}
//                 alt={`Marquee logo ${index + 1}`}
//                 loading="lazy"
//                 decoding="async"
//                 className="
//                   h-36 sm:h-40 md:h-44
//                   w-auto
//                   object-contain
//                   mx-auto
//                   pointer-events-none
//                 "
//               />
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Marquee;

"use client";

import { useEffect, useState } from "react";

interface LogoItem {
  _id: string;
  url: string;
}

const Marquee = () => {
  const [logos, setLogos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchLogos = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/marquee`,
        );
        const data = await res.json();
        if (
          isMounted &&
          data.success &&
          Array.isArray(data.data) &&
          data.data.length > 0
        ) {
          setLogos(data.data.map((item: LogoItem) => item.url));
        }
      } catch (err) {
        console.error("Lỗi đồng bộ dữ liệu Marquee:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLogos();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading || logos.length === 0) return null;

  const tripleLogos = [...logos, ...logos, ...logos];

  return (
    <div className="w-full overflow-hidden mt-12 pt-12 mb-18 hidden sm:block">
      {/* Đặt class `marquee-container` ở wrapper ngoài */}
      <div className="marquee-container flex [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
        <div className="flex flex-nowrap min-w-max animate-marquee">
          {tripleLogos.map((logo, index) => (
            <div
              key={`${logo}-${index}`}
              className="
            flex-shrink-0
            px-4 sm:px-6 md:px-8
            w-[140px] sm:w-[170px] md:w-[200px] lg:w-[220px]
            cursor-pointer
            transition-all duration-200
            hover:opacity-75 hover:scale-105
          "
            >
              <img
                src={logo}
                alt={`Marquee logo ${index + 1}`}
                loading="lazy"
                decoding="async"
                className="
              h-36 sm:h-40 md:h-44
              w-auto
              object-contain
              mx-auto
              pointer-events-none
            "
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Marquee;
