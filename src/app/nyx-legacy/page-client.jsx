"use client";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Image from "react-bootstrap/Image";
import Carousel from "react-bootstrap/Carousel";

import Animation from "../../components/animation-section/animation-section.component";
import BlogCard from "../../components/blog-card/blog-card.component";

export default function NyxLegacyPageClient({ blogPosts }) {
  return (
    <Container fluid className="nyx-legacy-page no-padding">
      <Row>
        <Col className="no-padding">
          <div className="text-center">
            <Image src="/images/Nyx-banner.jpg" alt="Logo" className="nyx-banner-logo" fluid />
          </div>
        </Col>
      </Row>
      <Row className="center-content" style={{ marginTop: 50 }}>
        <Col className="no-padding">
          <Animation type="slide-up">
            <h1 className="nyx-legacy-title">
              <b>Nyx Legacy</b>
            </h1>
          </Animation>
        </Col>
      </Row>
      <Row className="center-content">
        <div className="border-top-white no-margin-top"></div>
        <Col className="no-padding">
          <Animation type="slide-up">
            <div>
              <p>
                Immerse yourself in the captivating world of Nyx Legacy, where two sisters venture
                through a monster-filled realm on a thrilling story-driven quest. Prepare to engage
                with action-packed challenges and mysterious plot twists that will keep you on the
                edge of your seat.
              </p>
            </div>
          </Animation>
        </Col>
      </Row>
      <Row className="center-content">
        <div className="border-top-white no-margin-top"></div>
        <Col className="text-center">
          <iframe
            style={{ aspectRatio: "16 / 9" }}
            src="https://www.youtube.com/embed/M7hUM-_N3NY"
            title="Nyx Legacy Demo trailer"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
        </Col>
      </Row>
      <Row className="center-content">
        <div className="border-top-white"></div>
        <Col className="no-padding">
          <Animation type="fade-in">
            <div>
              <p>
                Nyx Legacy is an old-school RPG that offers an immersive gaming experience. Keep an
                eye on our blog for the latest updates and developments!
              </p>
            </div>
          </Animation>
        </Col>
      </Row>
      <Row className="center-content">
        <div className="border-top-white"></div>
        <Col className="no-padding">
          <Animation type="expand">
            <h1 className="nyx-legacy-title text-center">
              <b>Wishlist now on Steam!</b>
            </h1>
          </Animation>
          <Animation type="fade-in">
            <div className="text-center responsive-iframe d-none d-sm-block" style={{ marginBottom: 20, marginTop: 20 }}>
              <iframe title="Nyx Legacy Steam Widget" src="https://store.steampowered.com/widget/4016050/"></iframe>
            </div>
            <div className="text-center d-block d-sm-none" style={{ marginBottom: 20, marginTop: 20 }}>
              <a className="wishlist-button" href="https://store.steampowered.com/app/4016050/Nyx_Legacy/" target="_blank" rel="noopener noreferrer">
                Wishlist on Steam
              </a>
            </div>
          </Animation>
        </Col>
      </Row>
      <Row style={{ marginTop: 40 }}>
        <Col className="no-padding">
          <div className="blog-divider"></div>
        </Col>
      </Row>
      <div className="blog-section row" style={{ paddingTop: 50 }}>
        <Row className="center-content">
          <Col className="no-padding">
            <h1>
              <b>Blog Updates</b>
            </h1>
          </Col>
          <div className="border-top-white no-margin-top"></div>
        </Row>
        <Row className="center-content" style={{ marginTop: 20 }}>
          {blogPosts.length === 0 ? (
            <Col className="no-padding">
              <p>No blog posts available at the moment.</p>
            </Col>
          ) : (
            <>
              <Row className="d-none d-lg-flex w-100">
                {blogPosts.slice(0, 3).map((post) => (
                  <Col lg={12 / blogPosts.length} key={post.id}>
                    <Animation type="fade-in">
                      <BlogCard
                        slug={post.slug}
                        title={post.title}
                        thumbnail={post.jetpack_featured_media_url}
                        content={post.excerpt}
                      />
                    </Animation>
                  </Col>
                ))}
              </Row>
              <div className="d-lg-none w-100">
                <Carousel style={{ minHeight: "540px" }} interval={null} indicators={false}>
                  {blogPosts.slice(0, 3).map((post) => (
                    <Carousel.Item key={post.id}>
                      <Animation type="fade-in">
                        <BlogCard
                          slug={post.slug}
                          title={post.title}
                          thumbnail={post.jetpack_featured_media_url}
                          content={post.excerpt}
                        />
                      </Animation>
                    </Carousel.Item>
                  ))}
                </Carousel>
              </div>
            </>
          )}
        </Row>
      </div>
    </Container>
  );
}