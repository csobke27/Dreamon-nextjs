"use client";

import { useRouter } from "next/navigation";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import { useAuth } from "../../context/auth-context";

export default function AccountPageClient({ email, role }) {
  const router = useRouter();
  const { signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <Container fluid className="auth-page">
      <div className="auth-card">
        <h1>My account</h1>
        <p>Logged in as {email}</p>
        <p>Role: {role}</p>
        <Button variant="primary" onClick={handleSignOut}>
          Log out
        </Button>
      </div>
    </Container>
  );
}
