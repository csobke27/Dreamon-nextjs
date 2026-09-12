"use client";

import Container from "react-bootstrap/Container";
import Table from "react-bootstrap/Table";

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileLogPageClient({ entries }) {
  return (
    <Container fluid className="auth-page" style={{ alignItems: "flex-start", paddingTop: 40 }}>
      <div className="auth-card" style={{ maxWidth: 900 }}>
        <h1>Bestanden-logboek</h1>
        <p>Wie deelde welk bestand, in welk gesprek. Berichtinhoud is niet zichtbaar.</p>

        {entries.length === 0 ? (
          <p>Nog geen bestanden gedeeld.</p>
        ) : (
          <Table striped bordered hover variant="dark" responsive>
            <thead>
              <tr>
                <th>Bestand</th>
                <th>Grootte</th>
                <th>Gedeeld door</th>
                <th>In</th>
                <th>Wanneer</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.attachment_id}>
                  <td>{entry.file_name}</td>
                  <td>{formatFileSize(entry.file_size)}</td>
                  <td>{entry.sender_email}</td>
                  <td>{entry.channel_type === "dm" ? entry.channel_label : `#${entry.channel_label}`}</td>
                  <td>{new Date(entry.shared_at).toLocaleString("nl-NL")}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </Container>
  );
}
