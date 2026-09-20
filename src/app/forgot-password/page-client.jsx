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
        <h1>Forgot password</h1>

        {submitted ? (
          <Alert variant="success" className="auth-success">
            If this email address is known to us, we&apos;ve sent a link to
            reset your password.
          </Alert>
        ) : (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="forgotEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </Form.Group>

            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Working..." : "Send link"}
            </Button>
          </Form>
        )}

        <div className="auth-links">
          <Link href="/login">Back to log in</Link>
        </div>
      </div>
    </Container>
  );
}
