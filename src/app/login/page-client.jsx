"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import { useAuth } from "../../context/auth-context";

export default function LoginPageClient() {
  const router = useRouter();
  const { signIn, user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/");
    }
  }, [authLoading, router, user]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await signIn(email, password, rememberMe);

    setLoading(false);

    if (signInError) {
      if (signInError.code === "email_not_confirmed") {
        setError("Bevestig eerst je e-mailadres via de link die we je stuurden.");
      } else {
        setError("E-mailadres of wachtwoord is onjuist.");
      }
      return;
    }

    router.push("/");
  }

  if (authLoading || user) return null;

  return (
    <Container fluid className="auth-page">
      <div className="auth-card">
        <h1>Inloggen</h1>

        <Form onSubmit={handleSubmit}>
          {error && (
            <Alert variant="danger" className="auth-error">
              {error}
            </Alert>
          )}

          <Form.Group className="mb-3" controlId="loginEmail">
            <Form.Label>E-mailadres</Form.Label>
            <Form.Control
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="loginPassword">
            <Form.Label>Wachtwoord</Form.Label>
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
              label="Ingelogd blijven"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
          </Form.Group>

          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Bezig..." : "Inloggen"}
          </Button>
        </Form>

        <div className="auth-links">
          <Link href="/forgot-password">Wachtwoord vergeten?</Link>
          <br />
          Nog geen account? <Link href="/register">Registreer</Link>
        </div>
      </div>
    </Container>
  );
}
