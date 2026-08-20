"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Collapse from "react-bootstrap/Collapse";
import Form from "react-bootstrap/Form";
import Pagination from "react-bootstrap/Pagination";

import Animation from "../../components/animation-section/animation-section.component";
import BlogCard from "../../components/blog-card/blog-card.component";

function getLayout() {
  if (typeof window === "undefined") {
    return "horizontal";
  }

  return window.innerWidth >= 1144 ? "horizontal" : "vertical";
}

export default function BlogPageClient({
  categories,
  posts,
  totalPages,
  currentPage,
  selectedCategory,
  sortOrder,
}) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [cardLayout, setCardLayout] = useState(getLayout());

  useEffect(() => {
    const handleResize = () => setCardLayout(getLayout());
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const updateRoute = (changes) => {
    const params = new URLSearchParams();
    const nextCategory = changes.category ?? selectedCategory;
    const nextSort = changes.sort ?? sortOrder;
    const nextPage = changes.page ?? currentPage;

    if (nextCategory) {
      params.set("category", nextCategory);
    }

    if (nextSort && nextSort !== "date") {
      params.set("sort", nextSort);
    }

    if (nextPage > 1) {
      params.set("page", String(nextPage));
    }

    const query = params.toString();
    startTransition(() => {
      router.push(query ? `/blog?${query}` : "/blog");
    });
  };

  return (
    <Container fluid className="blog-page">
      <Row>
        <Col>
          <div className="text-center">
            <h1 className="blog-header">Blog</h1>
            <span>Updates on our progress, thoughts on game development, and more.</span>
          </div>
        </Col>
      </Row>
      <div className="center-content" style={{ marginTop: 20 }}>
        <div className="blog-filter-form">
          <Button
            onClick={() => setFormOpen((open) => !open)}
            aria-controls="subscribe-form-collapse"
            aria-expanded={formOpen}
            className="blog-filter-button"
          >
            {formOpen ? "Close" : "Filter / Sort"}
          </Button>
          <Collapse in={formOpen}>
            <div id="subscribe-form-collapse">
              <div>
                <span style={{ marginRight: 10 }}>Filter by Category:</span>
                <Form.Select
                  size="md"
                  onChange={(event) => updateRoute({ category: event.target.value, page: 1 })}
                  value={selectedCategory}
                >
                  <option value="">All Posts</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category.count})
                    </option>
                  ))}
                </Form.Select>
              </div>
              <div style={{ marginTop: 20 }}>
                <span style={{ marginRight: 10, marginTop: 10 }}>Sort by:</span>
                <Form.Select
                  size="md"
                  onChange={(event) => updateRoute({ sort: event.target.value, page: 1 })}
                  value={sortOrder}
                >
                  <option value="date">Newest-Oldest</option>
                  <option value="date-reverse">Oldest-Newest</option>
                  <option value="title">Title (A-Z)</option>
                  <option value="title-reverse">Title (Z-A)</option>
                </Form.Select>
              </div>
            </div>
          </Collapse>
        </div>
      </div>

      <div className="center-content" style={{ marginTop: 20 }}>
        {posts.length === 0 ? (
          <Col className="no-padding text-center" style={{ marginTop: 50, marginBottom: 50 }}>
            <h3>No posts found.</h3>
          </Col>
        ) : (
          <>
            {posts.map((post) => (
              <Row key={post.id} className="blog-card-row">
                <Col className="blog-card-zoom">
                  <Animation type="fade-in">
                    <BlogCard
                      slug={post.slug}
                      title={post.title}
                      thumbnail={post.jetpack_featured_media_url}
                      content={post.excerpt}
                      layout={cardLayout}
                    />
                  </Animation>
                </Col>
              </Row>
            ))}
          </>
        )}
        <div className="pagination-container">
          <Pagination>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNum) => (
              <Pagination.Item
                key={pageNum}
                active={pageNum === currentPage}
                onClick={() => updateRoute({ page: pageNum })}
              >
                {pageNum}
              </Pagination.Item>
            ))}
          </Pagination>
        </div>
      </div>
    </Container>
  );
}