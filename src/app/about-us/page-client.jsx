"use client";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Accordion from "react-bootstrap/Accordion";

import Animation from "../../components/animation-section/animation-section.component";

const questionList = [
  {
    question: "What is Dreamon Interactive?",
    answer: "Dreamon Interactive is an independent game studio built on honesty, creativity, and collaboration.",
  },
  {
    question: "Who is behind Dreamon?",
    answer: "Dreamon was founded by Michael Huigen and is supported by a small, dedicated team of colleagues.",
  },
  {
    question: "What kind of games do you make?",
    answer: "We create the games we would love to play ourselves. The focus is always on fun, creativity, and fair pricing.",
  },
  {
    question: "What is Dreamon’s vision?",
    answer: "We want to create games that are fun, interesting, and tell a story without cash shops or paywalls.",
  },
  {
    question: "How is Dreamon funded?",
    answer: "Dreamon is independent. We work without fixed investors and finance our projects in our own way.",
  },
  {
    question: "How can I support Dreamon?",
    answer: "By following us, sharing feedback, and in the future, playing or purchasing our games. Every form of support helps us grow.",
  },
  {
    question: "Where can I stay up to date with your work?",
    answer: "On our website, devlogs, and social media channels, where we share updates about our projects and the studio.",
  },
];

export default function AboutUsPageClient() {
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
            {questionList.map((item, index) => (
              <Accordion.Item eventKey={index.toString()} key={item.question} className="qa-accordion-item">
                <Accordion.Header>
                  <h3 className="question-header">
                    <b>{item.question}</b>
                  </h3>
                </Accordion.Header>
                <Accordion.Body>
                  <p className="question-answer">{item.answer}</p>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </Animation>
      </Row>
    </Container>
  );
}