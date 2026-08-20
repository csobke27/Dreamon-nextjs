import Link from 'next/link';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const BlogCard = ({ slug, title, thumbnail, content, layout = "vertical" }) => {
    const resolvedTitle = typeof title === 'string' ? title : title?.rendered ?? '';
    const resolvedContent = typeof content === 'string' ? content : content?.rendered ?? '';

    return (
        <Container className="blog-card-container">
            <Link href={`/post/${slug}`} className="blog-card-link">
                <Row>
                    {layout === "horizontal" ? (
                        <>
                                {thumbnail && (
                                    <>
                                    <Col sm={4}>
                                        <img className="blog-card-image" src={thumbnail} alt="Blog Post" />
                                    </Col>
                                    </>
                                )}
                            <Col>
                                <div className="blog-card-title" style={{marginTop: '10px'}}>{resolvedTitle.replace(/&nbsp;/g, " ")}</div>
                                <div className="blog-card-content" dangerouslySetInnerHTML={{ __html: resolvedContent }} /> {/*style={{ height: '50px', overflow: 'hidden' }} */}
                            </Col>
                        </>
                    ) : (
                        <>
                            <Col>
                                {thumbnail && (
                                    <img className="blog-card-image" src={thumbnail} alt="Blog Post" />
                                )}
                                <div className="blog-card-title">{resolvedTitle.replace(/&nbsp;/g, " ")}</div>
                                <div className="blog-card-content" dangerouslySetInnerHTML={{ __html: resolvedContent }} /> {/*style={{ height: '50px', overflow: 'hidden' }} */}
                            </Col>
                        </>
                    )}
                </Row>
            </Link>
        </Container>
    );
};

export default BlogCard;