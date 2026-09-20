"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import { useAuth } from "../../context/auth-context";

export default function LoginPageClient() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await signIn(email, password, rememberMe);

    setLoading(false);

    if (signInError) {
      if (signInError.code === "email_not_confirmed") {
        setError("Please confirm your email address using the link we sent you.");
      } else {
        setError("Email address or password is incorrect.");
      }
      return;
    }

    router.push("/");
  }

  return (
    <Container fluid className="auth-page">
      <div className="auth-card">
        <h1>Log in</h1>

        <Form onSubmit={handleSubmit}>
          {error && (
            <Alert variant="danger" className="auth-error">
              {error}
            </Alert>
          )}

          <Form.Group className="mb-3" controlId="loginEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="loginPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="loginRememberMe">
            <Form.Check
              type="checkbox"
              label="Stay signed in"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
          </Form.Group>

          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Working..." : "Log in"}
          </Button>
        </Form>

        <div className="auth-links">
          <Link href="/forgot-password">Forgot password?</Link>
          <br />
          Don&apos;t have an account? <Link href="/register">Register</Link>
        </div>
      </div>
    </Container>
  );
}
