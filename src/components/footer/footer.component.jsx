import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Animation from '../animation-section/animation-section.component';

const Footer = () => {
    return (
        <Container className="footer-container" fluid>
            <Animation type="fade-in">
            <Row>
                <div className="d-md-none footer-divider"></div>
                <Col className="social-col" md={12}>
                    <div className="footer-sub-container">
                        <h5 className="footer-header-5">Follow us on:</h5>
                        <div className="d-inline-flex align-items-center footer-social-link">
                            {/* <img alt="Discord" src="/images/discord-circle.png" width="30" height="30" className="me-2" /> */}
                            <a className="footer-link" href="https://discord.gg/dzW8VxDh4a" target="_blank" rel="noopener noreferrer">
                                <img alt="Discord" src="/images/discord-circle.png" width="30" height="30" className="me-2" />
                                Discord
                            </a>
                        </div>
                        <br></br>
                        <div className="d-inline-flex align-items-center footer-social-link">
                            {/* <img alt="Twitch" src="/images/twitch-circle.png" width="30" height="30" className="me-2" /> */}
                            <a className="footer-link" href="https://www.twitch.tv/rattacookie" target="_blank" rel="noopener noreferrer">
                                <img alt="Twitch" src="/images/twitch-circle.png" width="30" height="30" className="me-2" />
                                Twitch
                            </a>
                        </div>
                        <br></br>
                        <div className="d-inline-flex align-items-center footer-social-link">
                            {/* <img alt="YouTube" src="/images/youtube-circle.png" width="30" height="30" className="me-2" /> */}
                            <a className="footer-link" href="https://www.youtube.com/@DreamonInteractive" target="_blank" rel="noopener noreferrer">
                                <img alt="YouTube" src="/images/youtube-circle.png" width="30" height="30" className="me-2" />
                                YouTube
                            </a>
                        </div>
                        <br></br>
                        <div className="d-inline-flex align-items-center footer-social-link">
                            {/* <img alt="Facebook" src="/images/facebook-circle.png" width="30" height="30" className="me-2" /> */}
                            <a className="footer-link" href="https://www.facebook.com/profile.php?id=61573985252362" target="_blank" rel="noopener noreferrer">
                                <img alt="Facebook" src="/images/facebook-circle.png" width="30" height="30" className="me-2" />
                                Facebook
                            </a>
                        </div>
                        <br></br>
                        <div className="d-inline-flex align-items-center footer-social-link">
                            {/* <img alt="TikTok" src="/images/tiktok-circle.png" width="30" height="30" className="me-2" /> */}
                            <a className="footer-link" href="https://www.tiktok.com/@dreamonsocial" target="_blank" rel="noopener noreferrer">
                                <img alt="TikTok" src="/images/tiktok-circle.png" width="30" height="30" className="me-2" />
                                TikTok
                            </a>
                        </div>
                    </div>
                </Col>
                <div className="d-md-none footer-divider"></div>
                {/* <Col className="social-col" md={6}>
                    <div className="footer-sub-container">
                        <h5 className="footer-header-5">Help us out on our journey:</h5>
                        <div className="">
                            <a className="footer-link" href="https://www.gofundme.com/f/nyx-legacy-a-story-to-be-told" target="_blank" rel="noopener noreferrer">GoFundMe</a>
                        </div>
                    </div>
                </Col> */}
                {/* <div className="d-md-none footer-divider"></div> */}
            </Row>
            </Animation>
            <Row>
                <Col className="text-center py-3">
                    <p>© 2026 Dreamon Interactive. All rights reserved.</p>
                </Col>
            </Row>
            
        </Container>
    )
}

export default Footer;