import NyxLegacyPageClient from "./page-client";
import { sanityFetch } from "../../sanity/lib/live";

export const metadata = {
  title: "Dreamon | Nyx Legacy",
};

const NYX_LEGACY_POSTS_QUERY = `*[_type == "post" && "Nyx Legacy" in categories[]->title]
  | order(publishedAt desc)[0...3]{
    "id": _id,
    title,
    "slug": slug.current,
    "thumbnail": mainImage,
    "excerpt": excerpt
  }`;

export default async function NyxLegacyPage() {
  const { data: posts } = await sanityFetch({
    query: NYX_LEGACY_POSTS_QUERY,
  });

  return <NyxLegacyPageClient blogPosts={posts} />;
}