import Link from "next/link";

export default function NotFound() {
  return (
    <div className="blog-page center-content" style={{ minHeight: "calc(100vh - 423px)", paddingTop: 40 }}>
      <h1>404 Page Not Found!</h1>
      <p>The page you requested does not exist, or the blog post is no longer available.</p>
      <p>
        <Link className="link" href="/">
          Return Home
        </Link>
      </p>
    </div>
  );
}