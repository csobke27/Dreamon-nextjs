import { notFound } from "next/navigation";

import BlogPostPageClient from "./page-client";
import { sanityFetch } from "../../../sanity/lib/live";

const POST_QUERY = `*[_type == "post" && slug.current == $slug][0]{
  "id": _id,
  title,
  "slug": slug.current,
  "thumbnail": mainImage.asset->url,
  "thumbnailAlt": mainImage.alt,
  "date": publishedAt,
  body,
  "categoryIds": categories[]._ref
}`;

const RELATED_POSTS_QUERY = `*[_type == "post" && _id != $postId && count(categories[@._ref in $categoryIds]) > 0]
  | order(publishedAt desc)[0...2]{
    "id": _id,
    title,
    "slug": slug.current,
    "thumbnail": mainImage.asset->url,
    "excerpt": excerpt
  }`; //"excerpt": pt::text(body)

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const { data: post } = await sanityFetch({
    query: POST_QUERY,
    params: { slug: resolvedParams.slug },
  });

  if (!post) {
    return {
      title: "Dreamon | Post Not Found",
    };
  }

  return {
    title: `Dreamon | Blog Post: ${post.title}`,
    description: post.body ? post.body.map((block) => block.children?.map((child) => child.text).join(" ")).join(" ") : "",
  };
}

export default async function BlogPostPage({ params }) {
  const resolvedParams = await params;
  const { data: post } = await sanityFetch({
    query: POST_QUERY,
    params: { slug: resolvedParams.slug },
  });

  if (!post) {
    notFound();
  }

  const { data: relatedPosts } = await sanityFetch({
    query: RELATED_POSTS_QUERY,
    params: {
      postId: post.id,
      categoryIds: post.categoryIds ?? [],
    },
  });

  return <BlogPostPageClient post={post} relatedPosts={relatedPosts} />;
}