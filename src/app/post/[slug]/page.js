import { notFound } from "next/navigation";

import BlogPostPageClient from "./page-client";
import { getPostBySlug, getRelatedPosts } from "../../../lib/wordpress";

function formatTitle(title) {
  return title.replace(/&nbsp;/g, " ");
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const post = await getPostBySlug(resolvedParams.slug);

  if (!post) {
    return {
      title: "Dreamon | Post Not Found",
    };
  }

  return {
    title: `Dreamon | Blog Post: ${formatTitle(post.title.rendered)}`,
    description: post.excerpt?.rendered?.replace(/<[^>]+>/g, " ").trim(),
  };
}

export default async function BlogPostPage({ params }) {
  const resolvedParams = await params;
  const post = await getPostBySlug(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(post.categories, post.id);

  return <BlogPostPageClient post={post} relatedPosts={relatedPosts} />;
}