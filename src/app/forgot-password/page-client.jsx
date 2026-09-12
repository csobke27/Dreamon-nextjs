"use client";

import { useState } from "react";
import Link from "next/link";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import { createClient } from "../../lib/supabase/client";

export default function ForgotPasswordPageClient() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    setLoading(false);
    // Always show the same message, whether or not the account exists.
    setSubmitted(true);
  }

  return (
    <Container fluid className="auth-page">
      <div className="auth-card">
        <h1>Wachtwoord vergeten</h1>

        {submitted ? (
          <Alert variant="success" className="auth-success">
            Als dit e-mailadres bij ons bekend is, hebben we een link
            gestuurd om je wachtwoord opnieuw in te stellen.
          </Alert>
        ) : (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="forgotEmail">
              <Form.Label>E-mailadres</Form.Label>
              <Form.Control
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </Form.Group>

            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Bezig..." : "Verstuur link"}
            </Button>
          </Form>
        )}

        <div className="auth-links">
          <Link href="/login">Terug naar inloggen</Link>
        </div>
      </div>
    </Container>
  );
}
