import BlogPageClient from "./page-client";
import { getBlogCategories, getBlogPosts, normalizeSortOrder } from "../../lib/wordpress";

export const metadata = {
  title: "Dreamon | Blog",
};

export default async function BlogPage({ searchParams }) {
  const params = await searchParams;
  const currentPage = Number.parseInt(params?.page ?? "1", 10);
  const selectedCategory = params?.category ?? "";
  const sortOrder = normalizeSortOrder(params?.sort);

  const [categories, blogData] = await Promise.all([
    getBlogCategories(),
    getBlogPosts({
      page: Number.isNaN(currentPage) || currentPage < 1 ? 1 : currentPage,
      categoryId: selectedCategory,
      sortOrder,
    }),
  ]);

  return (
    <BlogPageClient
      categories={categories}
      posts={blogData.posts}
      totalPages={blogData.totalPages}
      currentPage={blogData.currentPage}
      selectedCategory={selectedCategory}
      sortOrder={sortOrder}
    />
  );
}