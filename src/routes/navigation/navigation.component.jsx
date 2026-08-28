"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Offcanvas from 'react-bootstrap/Offcanvas';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const Navigation = () => {
    const pathname = usePathname();
    const [hideNavbar, setHideNavbar] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const lastScrollY = useRef(0);
    const scrollTriggerAmount = 106; // Adjust this value as needed

    useEffect(() => {
        const handleScroll = () => {
            const currentScroll = window.scrollY;
            const lastScroll = lastScrollY.current;
            if (Math.abs(currentScroll - lastScroll) > scrollTriggerAmount) {
                if (currentScroll > lastScroll) {
                    setHideNavbar(true); // scrolling down
                } else {
                    setHideNavbar(false); // scrolling up
                }
                lastScrollY.current = currentScroll;
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    return (
        <>
            <Navbar
                fixed="top"
                expand={false}
                expanded={isMenuOpen}
                onToggle={(nextExpanded) => setIsMenuOpen(Boolean(nextExpanded))}
                className={`bg-body-tertiary mb-3 navigation-container ${hideNavbar ? "navbar-hidden" : "navbar-show"}`}
            >
                <Container fluid>
                    <Navbar.Brand as={Link} href="/" className="logo">
                        <img alt="Logo" src="/images/Dreamonbrandmerk-no-background.png" width="80" height="80" className="d-inline-block align-top nav-logo" />
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="offcanvasNavbar" className="menu-toggle" />
                    <Navbar.Offcanvas
                        id="offcanvasNavbar"
                        aria-labelledby="offcanvasNavbarLabel"
                        placement="end"
                        show={isMenuOpen}
                        onHide={() => setIsMenuOpen(false)}
                    >
                        <Offcanvas.Header closeButton>
                            <Offcanvas.Title width="50%" id="offcanvasNavbarLabel">
                                <img alt="brand" src="/images/dreamonlogo-new.png" width="100%" />
                                {/* Dreamon Interactive */}
                            </Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body>
                            <Nav className="justify-content-end flex-grow-1 pe-3">
                                <Nav.Link as={Link} href="/">Home</Nav.Link>
                                <Nav.Link as={Link} href="/about-us">About Us</Nav.Link>
                                <Nav.Link as={Link} href="/nyx-legacy">Nyx Legacy</Nav.Link>
                                <Nav.Link as={Link} href="/blog">Blog</Nav.Link>
                                {/* <Nav.Link href="https://www.gofundme.com/f/nyx-legacy-a-story-to-be-told">GoFundMe</Nav.Link> */}
                                <Row>
                                    <Col className="text-center">
                                        <Nav.Link href="https://discord.gg/dzW8VxDh4a" target="_blank" rel="noopener noreferrer">
                                            <img alt="Discord" src="/images/discord-circle.png" width="30" height="30" className="me-2" />
                                        </Nav.Link>
                                    </Col>
                                    <Col className="text-center">
                                        <Nav.Link href="https://www.twitch.tv/rattacookie" target="_blank" rel="noopener noreferrer">
                                            <img alt="Twitch" src="/images/twitch-circle.png" width="30" height="30" className="me-2" />
                                        </Nav.Link>
                                    </Col>
                                    <Col className="text-center">
                                        <Nav.Link href="https://www.youtube.com/@DreamonInteractive" target="_blank" rel="noopener noreferrer">
                                            <img alt="YouTube" src="/images/youtube-circle.png" width="30" height="30" className="me-2" />
                                        </Nav.Link>
                                    </Col>
                                    <Col className="text-center">
                                        <Nav.Link href="https://www.facebook.com/profile.php?id=61573985252362" target="_blank" rel="noopener noreferrer">
                                            <img alt="Facebook" src="/images/facebook-circle.png" width="30" height="30" className="me-2" />
                                        </Nav.Link>
                                    </Col>
                                    <Col className="text-center">
                                        <Nav.Link href="https://www.tiktok.com/@dreamonsocial" target="_blank" rel="noopener noreferrer">
                                            <img alt="TikTok" src="/images/tiktok-circle.png" width="30" height="30" className="me-2" />
                                        </Nav.Link>
                                    </Col>
                                </Row>
                            </Nav>
                        </Offcanvas.Body>
                    </Navbar.Offcanvas>
                </Container>
            </Navbar>
            {/* <Navbar className="footer-nav">
                <Container>
                    <Navbar.Text className="footer-text justify-content-center">© 2025 CoreyInDaHouse27. All rights reserved.</Navbar.Text>
                </Container>
            </Navbar> */}
        </>
    )
}

export default Navigation;