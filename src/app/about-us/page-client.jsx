"use client";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Accordion from "react-bootstrap/Accordion";
import { PortableText } from "@portabletext/react";
import Animation from "../../components/animation-section/animation-section.component";

export default function AboutUsPageClient({ faqList }) {
  return (
    <Container fluid className="about-us-page">
      <Row className="center-content" style={{ marginTop: 50 }}>
        <Col className="no-padding">
          <Animation>
            <h1 className="text-center about-us-title">
              <b>About Us</b>
            </h1>
            <h4 className="text-center">Turning Gaming Dreams Into Reality</h4>
          </Animation>
        </Col>
      </Row>
      <Row className="center-content">
        <Col className="no-padding">
          <Animation>
            <div className="text-center">
              <img className="about-us-banner" src="/images/dreamon - about us header.jpg" alt="About Us" />
            </div>
          </Animation>
        </Col>
      </Row>
      <Row className="center-content">
        <Animation type="fade-in">
          <Accordion defaultActiveKey={["0"]} alwaysOpen>
            {faqList.map((item, index) => (
              <Accordion.Item eventKey={index.toString()} key={item.title} className="qa-accordion-item">
                <Accordion.Header>
                  <h3 className="question-header">
                    <b>{item.title}</b>
                  </h3>
                </Accordion.Header>
                <Accordion.Body>
                  <div className="question-answer">
                    <PortableText value={item.body} />
                  </div>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </Animation>
      </Row>
    </Container>
  );
}