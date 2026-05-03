export type JournalPost = {
  company: string;
  timeline: string;
  role: string;

  title: string;
  date: string;
  category: string;

  overview: string;
  challenges: string;
  results: string;

  images: {
    hero: string;
    two: [string, string]; 
    bottom: string;
  };
};

export const journalPosts: Record<string, JournalPost> = {
  "brigding-the-gap-between-design-development": {
    company: "Lightspeed",
    timeline: "2024 — 2025",
    role: "Product Designer",

    title: "Bridging The Gap Between Design & Development",
    date: "Sep 3, 2025",
    category: "Web Design",

    overview: "Designers and developers often speak different languages.",
    challenges: "Bridging the gap requires mindset, not just tools.",
    results: "Collaboration leads to better digital products.",

    images: {
      hero:
        "https://framerusercontent.com/images/YxeYtGJD5UmXSqrfSBacGGEHQ0.png",

      // 👇 2 ảnh KHÁC hero hoàn toàn
      two: [
        "https://images.unsplash.com/photo-1555066931",
        "https://images.unsplash.com/photo-1522542550221-31fd19575a2d"
      ],

      bottom:
        "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",
    },
  },

  "why-minimalism-still-works-in-2025": {
    company: "Studio X",
    timeline: "2023 — 2024",
    role: "UI Designer",

    title: "Why Minimalism Still Works in 2025",
    date: "Jun 12, 2026",
    category: "Design",

    overview: "Minimalism improves clarity.",
    challenges: "Balance is key.",
    results: "Better UX and trust.",

    images: {
      hero:
        "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",

      two: [
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
        "https://images.unsplash.com/photo-1507149833265-60c372daea22"
      ],

      bottom:
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
    },
  },

  "the-beauty-of-subtle-interactions": {
    company: "Nova",
    timeline: "2025 — 2026",
    role: "Designer",

    title: "The Beauty of Subtle Interactions",
    date: "Jan 10, 2027",
    category: "UX",

    overview: "Small details matter.",
    challenges: "Consistency is hard.",
    results: "Better engagement.",

    images: {
      hero:
        "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",

      two: [
        "https://images.unsplash.com/photo-1518770660439-4636190af475",
        "https://images.unsplash.com/photo-1527689368864-3a821dbccc34"
      ],

      bottom:
        "https://images.unsplash.com/photo-1522199710521-72d69614c702",
    },
  },
    "why-constraints-make-us-more-creative": {
    company: "Nova",
    timeline: "2025 — 2026",
    role: "Designer",

    title: "The Beauty of Subtle Interactions",
    date: "Jan 10, 2027",
    category: "UX",

    overview: "Small details matter.",
    challenges: "Consistency is hard.",
    results: "Better engagement.",

    images: {
      hero:
        "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",

      two: [
        "https://images.unsplash.com/photo-1518770660439-4636190af475",
        "https://images.unsplash.com/photo-1527689368864-3a821dbccc34"
      ],

      bottom:
        "https://images.unsplash.com/photo-1522199710521-72d69614c702",
    },
  },
    "finding-balance-in-a-creative-career": {
    company: "Nova",
    timeline: "2025 — 2026",
    role: "Designer",

    title: "The Beauty of Subtle Interactions",
    date: "Jan 10, 2027",
    category: "UX",

    overview: "Small details matter.",
    challenges: "Consistency is hard.",
    results: "Better engagement.",

    images: {
      hero:
        "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",

      two: [
        "https://images.unsplash.com/photo-1518770660439-4636190af475",
        "https://images.unsplash.com/photo-1527689368864-3a821dbccc34"
      ],

      bottom:
        "https://images.unsplash.com/photo-1522199710521-72d69614c702",
    },
  },
    "why-personal-projects-matter": {
    company: "Nova",
    timeline: "2025 — 2026",
    role: "Designer",

    title: "The Beauty of Subtle Interactions",
    date: "Jan 10, 2027",
    category: "UX",

    overview: "Small details matter.",
    challenges: "Consistency is hard.",
    results: "Better engagement.",

    images: {
      hero:
        "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",

      two: [
        "https://images.unsplash.com/photo-1518770660439-4636190af475",
        "https://images.unsplash.com/photo-1527689368864-3a821dbccc34"
      ],

      bottom:
        "https://images.unsplash.com/photo-1522199710521-72d69614c702",
    },
  },
    "the-challenge-of-balancing-design-and-development": {
    company: "Nova",
    timeline: "2025 — 2026",
    role: "Designer",

    title: "The Beauty of Subtle Interactions",
    date: "Jan 10, 2027",
    category: "UX",

    overview: "Small details matter.",
    challenges: "Consistency is hard.",
    results: "Better engagement.",

    images: {
      hero:
        "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",

      two: [ 
        "https://images.unsplash.com/photo-1518770660439-4636190af475",
        "https://images.unsplash.com/photo-1527689368864-3a821dbccc34"
      ],

      bottom:
        "https://images.unsplash.com/photo-1522199710521-72d69614c702",
    },
  },
    "from-sketchbook-to-screen-my-design-process": {
    company: "Nova",
    timeline: "2025 — 2026",
    role: "Designer",

    title: "The Beauty of Subtle Interactions",
    date: "Jan 10, 2027",
    category: "UX",

    overview: "Small details matter.",
    challenges: "Consistency is hard.",
    results: "Better engagement.",

    images: {
      hero:
        "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",

      two: [
        "https://images.unsplash.com/photo-1518770660439-4636190af475",
        "https://images.unsplash.com/photo-1527689368864-3a821dbccc34"
      ],

      bottom:
        "https://images.unsplash.com/photo-1522199710521-72d69614c702",
    },
  },
};