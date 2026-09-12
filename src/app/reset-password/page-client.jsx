"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import { createClient } from "../../lib/supabase/client";

export default function ResetPasswordPageClient() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError("Deze link is verlopen of al gebruikt. Vraag een nieuwe aan.");
      return;
    }

    router.push("/login");
  }

  return (
    <Container fluid className="auth-page">
      <div className="auth-card">
        <h1>Nieuw wachtwoord instellen</h1>

        <Form onSubmit={handleSubmit}>
          {error && (
            <Alert variant="danger" className="auth-error">
              {error}
            </Alert>
          )}

          <Form.Group className="mb-3" controlId="newPassword">
            <Form.Label>Nieuw wachtwoord</Form.Label>
            <Form.Control
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="confirmNewPassword">
            <Form.Label>Bevestig nieuw wachtwoord</Form.Label>
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
            {loading ? "Bezig..." : "Wachtwoord opslaan"}
          </Button>
        </Form>
      </div>
    </Container>
  );
}
