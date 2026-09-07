"use client";

import Link from "next/link";
import { useEffect, useRef, useState, use } from "react";
import { journalPosts } from "../data";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default function Page({ params }: PageProps) {
  const { slug } = use(params);

  const arrowRef = useRef<HTMLDivElement | null>(null);
  const [rotateArrow, setRotateArrow] = useState(false);

  const post = journalPosts[slug];

  // lấy 2 bài liên quan (trừ bài hiện tại)
  const relatedPosts = Object.entries(journalPosts)
    .filter(([key]) => key !== slug)
    .slice(0, 2);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setRotateArrow(entry.isIntersecting);
      },
      { threshold: 0.6 }
    );

    if (arrowRef.current) observer.observe(arrowRef.current);

    return () => observer.disconnect();
  }, []);

  if (!post) return <div className="p-10">Post not found</div>;

  return (
    <div className="min-h-screen mt-30 pt-30 px-4">

      {/* TITLE */}
      <div className="grid grid-cols-3 gap-10 mb-12">
        <div className="col-span-2 max-w-2xl">
          <p className="text-[48px] leading-tight font-medium">
            {post.title}
          </p>
        </div>
      </div>

      {/* BACK + INFO */}
      <div className="flex justify-between items-end mt-2">
        <Link href="/journal" className="text-sm flex gap-1 group">
          <span>‹</span>
          <span className="group-hover:translate-x-1 transition">
            Back to journal
          </span>
        </Link>

        <div className="flex gap-8 text-sm">
          <div>
            <p className="text-xs text-gray-500">Written date</p>
            <p className="font-medium">{post.date}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Category</p>
            <p className="font-medium">{post.category}</p>
          </div>
        </div>
      </div>

      {/* HERO */}
      <div className="mt-2">
        <img
          src={post.images.hero}
          className="w-full h-[720px] object-cover"
        />
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-[minmax(500px,25%)_1fr] mt-4">
        <div />

        <div className="space-y-6 text-sm leading-relaxed">
          <p className="font-semibold">{post.overview}</p>
          <p className="font-semibold">{post.challenges}</p>
          <p className="font-semibold">{post.results}</p>
        </div>
      </div>

      {/* MORE */}
      <div className="mt-12 border-t pt-12">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[64px] font-medium leading-none">
            More from my journal
          </h2>

          <div ref={arrowRef}>
            <svg
              width="60"
              height="60"
              viewBox="0 0 96.117 96.189"
              fill="black"
              className={`transition-transform duration-500 ${
                rotateArrow ? "-rotate-180" : "-rotate-90"
              }`}
            >
              <path d="M 96.117 0.005 L 96.112 96.189 L 75.656 96.175 L 75.661 34.961 L 14.529 96.083 L 0.063 81.617 L 61.219 20.461 L 0.005 20.466 L 0 0 Z" />
            </svg>
          </div>
        </div>

        {/* CARDS */}
        <div className="grid md:grid-cols-2 gap-3">

          {relatedPosts.map(([key, item]) => (
            <Link
              key={key}
              href={`/journal/${key}`}
              className="relative h-[520px] overflow-hidden group"
            >
              <img
                src={item.images.two?.[0] || item.images.hero}
                className="w-full h-full object-cover transition"
              />

              <div className="absolute inset-0 bg-black/20" />

              <div className="absolute bottom-4 left-4 text-white">
                <p className="text-[24px] font-medium leading-tight">
                  {item.title}
                </p>
                <p className="text-sm text-gray-300">
                  {item.category}
                </p>
              </div>
            </Link>
          ))}

        </div>
      </div>

    </div>
  );
}