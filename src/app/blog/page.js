import BlogPageClient from "./page-client";
import { sanityFetch } from "../../sanity/lib/live";


export const metadata = {
  title: "Dreamon | Blog",
};

const POSTS_PER_PAGE = 5;

const SORT_ORDER = {
  date: "publishedAt desc",
  "date-reverse": "publishedAt asc",
  title: "title asc",
  "title-reverse": "title desc",
};

export default async function BlogPage({ searchParams }) {
  const params = await searchParams;
  const currentPage = Number.parseInt(params?.page ?? "1", 10);
  const page = Number.isNaN(currentPage) || currentPage < 1 ? 1 : currentPage;
  const selectedCategory = params?.category ?? "";
  const sortOrder = SORT_ORDER[params?.sort] ? params.sort : "date";
  const start = (page - 1) * POSTS_PER_PAGE;
  const end = start + POSTS_PER_PAGE;

  const { data } = await sanityFetch({
    query: `{
      "categories": *[_type == "category"]{
        "id": _id, title,
        "count": count(*[_type == "post" && references(^._id)])
      },
      "posts": *[_type == "post" && ($categoryName == "" || $categoryName in categories[]->title)]
        | order(${SORT_ORDER[sortOrder]})[$start...$end]{
          "id": _id,
          title,
          "slug": slug.current,
          "thumbnail": mainImage.asset->url,
          "excerpt": excerpt,
          "date": publishedAt
        },
      "totalCount": count(*[_type == "post" && ($categoryName == "" || $categoryName in categories[]->title)])
    }`, // "excerpt": pt::text(body),
    params: {
      categoryName: selectedCategory,
      start,
      end,
    },
  });

  return (
    <BlogPageClient
      categories={data.categories}
      posts={data.posts}
      totalPages={Math.ceil(data.totalCount / POSTS_PER_PAGE)}
      currentPage={page}
      selectedCategory={selectedCategory}
      sortOrder={sortOrder}
    />
  );
}