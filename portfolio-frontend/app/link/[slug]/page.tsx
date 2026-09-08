import { notFound } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

async function getGeneratedLink(slug: string) {
  if (!slug) return null;
  try {
    const res = await fetch(`${API_URL}/api/generated-links/${slug}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  } catch (error) {
    return null;
  }
}

export default async function GeneratedLinkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const link = await getGeneratedLink(slug);

  if (!link) {
    notFound();
  }

  return (
    <div className="min-h-screen w-full bg-[#DDDDDD] px-4 py-3 sm:px-8 lg:px-[60px]">
      <div className="mx-auto w-fit max-w-full overflow-hidden rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.25)]">
        <img
          src={link.imageUrl}
          alt={link.title || "Generated Link"}
          className="block h-auto max-w-full"
        />
      </div>
    </div>
  );
}
