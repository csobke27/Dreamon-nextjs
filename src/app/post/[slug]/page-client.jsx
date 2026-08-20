"use client";

import Link from "next/link";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Image from "react-bootstrap/Image";
import Carousel from "react-bootstrap/Carousel";

import Animation from "../../../components/animation-section/animation-section.component";
import BlogCard from "../../../components/blog-card/blog-card.component";

function formatTitle(title) {
  return title.replace(/&nbsp;/g, " ");
}

export default function BlogPostPageClient({ post, relatedPosts }) {
  return (
    <Container fluid className="blog-post-page">
      <Row>
        <Col className="related-posts-section" lg={2}></Col>
        <Col lg={8} className="no-padding">
          <Animation type="fade-in">
            <div>
              <Link href="/blog" className="back-link">
                &larr; Back to Blog
              </Link>
              {post.jetpack_featured_media_url && (
                <Image
                  className="blog-post-image"
                  src={post.jetpack_featured_media_url}
                  alt={formatTitle(post.title.rendered)}
                  fluid
                />
              )}
              <div className="blog-post-content center-content">
                <h1 className="blog-post-title">
                  {formatTitle(post.title.rendered)}{" "}
                  <span className="publish-date">
                    - published on {new Date(post.date).toLocaleDateString()}
                  </span>
                </h1>
                <div className="blog-post-insert" dangerouslySetInnerHTML={{ __html: post.content.rendered }} />
              </div>
            </div>
          </Animation>
        </Col>
        <Col lg={2}>
          {relatedPosts.length > 0 && (
            <div className="related-posts-container center-content">
              <h3 className="related-posts-title text-center">Related Posts</h3>
              <div className="d-none d-lg-flex w-100">
                <Row>
                  {relatedPosts.map((relatedPost) => (
                    <Col key={relatedPost.id}>
                      <BlogCard
                        slug={relatedPost.slug}
                        title={relatedPost.title}
                        thumbnail={relatedPost.jetpack_featured_media_url}
                        content={relatedPost.excerpt}
                      />
                    </Col>
                  ))}
                </Row>
              </div>
              <div className="d-lg-none w-100">
                <Carousel style={{ minHeight: "540px" }} interval={null} indicators={false}>
                  {relatedPosts.map((relatedPost) => (
                    <Carousel.Item key={relatedPost.id}>
                      <Animation type="fade-in">
                        <BlogCard
                          slug={relatedPost.slug}
                          title={relatedPost.title}
                          thumbnail={relatedPost.jetpack_featured_media_url}
                          content={relatedPost.excerpt}
                        />
                      </Animation>
                    </Carousel.Item>
                  ))}
                </Carousel>
              </div>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
}
