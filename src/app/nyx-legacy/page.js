import NyxLegacyPageClient from "./page-client";
import { getNyxLegacyPosts } from "../../lib/wordpress";

export const metadata = {
  title: "Dreamon | Nyx Legacy",
};

export default async function NyxLegacyPage() {
  const posts = await getNyxLegacyPosts();

  return <NyxLegacyPageClient blogPosts={posts} />;
}