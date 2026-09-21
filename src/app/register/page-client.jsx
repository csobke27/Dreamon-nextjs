"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import { createClient } from "../../lib/supabase/client";
import { useAuth } from "../../context/auth-context";

export default function RegisterPageClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { authLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
      if (!authLoading && user) {
        router.replace("/");
      }
    }, [authLoading, router, user]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Wachtwoord moet minimaal 8 tekens lang zijn.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Wachtwoorden komen niet overeen.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);

    if (signUpError) {
      setError("Er ging iets mis. Probeer het later opnieuw.");
      return;
    }

    setSuccess(true);
  }

  if (authLoading || user) return null;

  return (
    <Container fluid className="auth-page">
      <div className="auth-card">
        <h1>Account maken</h1>

        {success ? (
          <Alert variant="success" className="auth-success">
            Check je e-mail om je account te bevestigen.
          </Alert>
        ) : (
          <Form onSubmit={handleSubmit}>
            {error && (
              <Alert variant="danger" className="auth-error">
                {error}
              </Alert>
            )}

            <Form.Group className="mb-3" controlId="registerEmail">
              <Form.Label>E-mailadres</Form.Label>
              <Form.Control
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="registerPassword">
              <Form.Label>Wachtwoord</Form.Label>
              <Form.Control
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="registerConfirmPassword">
              <Form.Label>Bevestig wachtwoord</Form.Label>
              <Form.Control
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </Form.Group>

            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Bezig..." : "Account maken"}
            </Button>
          </Form>
        )}

        <div className="auth-links">
          Heb je al een account? <Link href="/login">Log in</Link>
        </div>
      </div>
    </Container>
  );
}
