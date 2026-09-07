import { notFound } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

async function getGeneratedLink(slug: string) {
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
  params: { slug: string };
}) {
  const link = await getGeneratedLink(params.slug);

  if (!link) {
    notFound();
  }

  return (
    <div className="min-h-screen w-full bg-black">
      <div className="w-full h-screen">
        <img
          src={link.imageUrl}
          alt={link.title || "Generated Link"}
          className="w-full h-full object-cover object-center"
        />
      </div>
    </div>
  );
}
