"use client";
import { useEffect, useState } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface CardProject {
  _id: string;
  slug: string;
  homeImage?: string;
  projectsPageImage?: string;
}

export default function CardFooter() {
  const [allCards, setAllCards] = useState<CardProject[]>([]);
  const [displayedCards, setDisplayedCards] = useState<CardProject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const ROTATION_SPEED = 5000;

  const cardVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { duration: 0.8, ease: "linear" },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.8, ease: "linear" },
    },
  };

  const getRandomCards = (arr: CardProject[], count: number): CardProject[] => {
    if (arr.length <= count) return arr;
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  useEffect(() => {
    const fetchFooterCards = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${baseUrl}/api/cards`);
        const resData = await res.json();

        if (resData.success && resData.data.length > 0) {
          setAllCards(resData.data);
          setDisplayedCards(getRandomCards(resData.data, 4));
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu ảnh footer:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFooterCards();
  }, []);

  useEffect(() => {
    if (allCards.length <= 4) return;

    const interval = setInterval(() => {
      setDisplayedCards(getRandomCards(allCards, 4));
    }, ROTATION_SPEED);

    return () => clearInterval(interval);
  }, [allCards]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-[140px] sm:h-[180px] md:h-[220px] bg-slate-800/40 animate-pulse rounded-xl"
          />
        ))}
      </div>
    );
  }

  if (displayedCards.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
      <AnimatePresence mode="popLayout">
        {displayedCards.map((item, index) => {
          const imageUrl =
            item.homeImage ||
            item.projectsPageImage ||
            "https://placehold.co/400x300";

          return (
            <Link
              href={`/projects/${item.slug}`}
              key={`${item._id}-${index}`}
              className="block group relative h-[140px] sm:h-[180px] md:h-[220px] overflow-hidden bg-slate-950 transition-all duration-300"
            >
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="show"
                exit="exit"
                className="w-full h-full absolute inset-0"
              >
                <div className="absolute inset-0 z-10 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

                <img
                  src={imageUrl}
                  alt="Dự án ngẫu nhiên"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </motion.div>
            </Link>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
