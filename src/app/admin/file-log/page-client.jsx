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
        <h1>File-share log</h1>
        <p>Who shared which file, in which conversation. Message content is never shown.</p>

        {entries.length === 0 ? (
          <p>No files shared yet.</p>
        ) : (
          <Table striped bordered hover variant="dark" responsive>
            <thead>
              <tr>
                <th>File</th>
                <th>Size</th>
                <th>Shared by</th>
                <th>In</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.attachment_id}>
                  <td>{entry.file_name}</td>
                  <td>{formatFileSize(entry.file_size)}</td>
                  <td>{entry.sender_email}</td>
                  <td>{entry.channel_type === "dm" ? entry.channel_label : `#${entry.channel_label}`}</td>
                  <td>{new Date(entry.shared_at).toLocaleString("en-US")}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </Container>
  );
}
