"use client";

import { useEffect, useRef, useState } from "react";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import { useAuth } from "../../context/auth-context";
import { parseMessageBody } from "../../lib/chat/parse-message";

function channelLabel(channel, profileMap, userId) {
  if (channel.type === "team") return "Team chat";
  if (channel.type === "admin") return "Admin only";
  const partner = channel.memberIds?.find((id) => id !== userId);
  return profileMap[partner]?.email ?? "Gesprek";
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function MessageBody({ body }) {
  const segments = parseMessageBody(body || "");
  return segments.map((seg, i) =>
    seg.type === "code" ? (
      <div className="chat-code-block" key={i}>
        <Button
          size="sm"
          variant="outline-light"
          className="chat-code-copy"
          onClick={() => navigator.clipboard.writeText(seg.content)}
        >
          Kopieer
        </Button>
        <pre style={{ margin: 0 }}>
          <code>{seg.content}</code>
        </pre>
      </div>
    ) : (
      <span key={i}>{seg.content}</span>
    )
  );
}

export default function ChatPageClient({ userId }) {
  const { supabase } = useAuth();
  const [channels, setChannels] = useState([]);
  const [profileMap, setProfileMap] = useState({});
  const [roster, setRoster] = useState([]);
  const [activeChannelId, setActiveChannelId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const messageListRef = useRef(null);

  async function loadChannelsAndRoster() {
    const [{ data: channelRows }, { data: memberRows }, { data: profileRows }] =
      await Promise.all([
        supabase.from("channels").select("id, type, slug"),
        supabase.from("channel_members").select("channel_id, user_id"),
        supabase.from("profiles").select("id, email, role"),
      ]);

    const nextProfileMap = Object.fromEntries((profileRows ?? []).map((p) => [p.id, p]));
    setProfileMap(nextProfileMap);
    setRoster((profileRows ?? []).filter((p) => p.id !== userId));

    const withMembers = (channelRows ?? []).map((c) => ({
      ...c,
      memberIds: (memberRows ?? [])
        .filter((m) => m.channel_id === c.id)
        .map((m) => m.user_id),
    }));
    withMembers.sort((a, b) => a.type.localeCompare(b.type));
    setChannels(withMembers);

    if (!activeChannelId && withMembers.length > 0) {
      const team = withMembers.find((c) => c.type === "team");
      setActiveChannelId(team?.id ?? withMembers[0].id);
    }
  }

  useEffect(() => {
    loadChannelsAndRoster();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadMessages(channelId) {
    const { data } = await supabase
      .from("messages")
      .select("id, body, sender_id, created_at, attachments(id, file_name, file_size, storage_path)")
      .eq("channel_id", channelId)
      .order("created_at", { ascending: true });
    setMessages(data ?? []);
    requestAnimationFrame(() => {
      messageListRef.current?.scrollTo({ top: messageListRef.current.scrollHeight });
    });
  }

  useEffect(() => {
    if (!activeChannelId) return;
    loadMessages(activeChannelId);

    // Poll instead of relying solely on Realtime, so new messages from
    // others show up reliably without needing a manual refresh.
    const interval = setInterval(() => loadMessages(activeChannelId), 4000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChannelId]);

  async function startDm(partnerId) {
    const existing = channels.find(
      (c) => c.type === "dm" && c.memberIds.includes(partnerId) && c.memberIds.includes(userId)
    );
    if (existing) {
      setActiveChannelId(existing.id);
      return;
    }

    // Geen .select() na deze insert: je bent nog geen lid van dit kanaal, dus
    // de select-policy zou de net aangemaakte rij nog niet aan je willen teruggeven.
    const newChannelId = crypto.randomUUID();
    const { error } = await supabase.from("channels").insert({ id: newChannelId, type: "dm" });
    if (error) {
      console.error("create dm channel error", error);
      return;
    }

    // Los van elkaar (niet als 1 insert met 2 rijen): de tweede rij mag alleen
    // toegevoegd worden als de eerste (jijzelf) al zichtbaar/aanwezig is.
    const { error: selfError } = await supabase
      .from("channel_members")
      .insert({ channel_id: newChannelId, user_id: userId });
    if (selfError) console.error("add self to dm error", selfError);

    const { error: partnerError } = await supabase
      .from("channel_members")
      .insert({ channel_id: newChannelId, user_id: partnerId });
    if (partnerError) console.error("add partner to dm error", partnerError);

    await loadChannelsAndRoster();
    setActiveChannelId(newChannelId);
  }

  function insertCodeBlock() {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = text.slice(start, end) || "jouw code hier";
    const before = text.slice(0, start);
    const after = text.slice(end);
    const insertion = "```\n" + selected + "\n```";
    const newText = before + insertion + after;
    setText(newText);
    requestAnimationFrame(() => {
      textarea.focus();
      const cursorPos = before.length + insertion.length;
      textarea.setSelectionRange(cursorPos, cursorPos);
    });
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!text.trim() || !activeChannelId) return;
    setSending(true);
    const body = text;
    setText("");

    const { data, error } = await supabase
      .from("messages")
      .insert({ channel_id: activeChannelId, sender_id: userId, body })
      .select("id, body, sender_id, created_at")
      .single();

    if (!error) {
      setMessages((prev) => [...prev, { ...data, attachments: [] }]);
      requestAnimationFrame(() => {
        messageListRef.current?.scrollTo({ top: messageListRef.current.scrollHeight });
      });
    }
    setSending(false);
  }

  async function handleFilePicked(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !activeChannelId) return;

    setSending(true);
    const path = `${activeChannelId}/${crypto.randomUUID()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("chat-files").upload(path, file);
    if (uploadError) {
      setSending(false);
      return;
    }

    const { data: messageRow, error: msgError } = await supabase
      .from("messages")
      .insert({ channel_id: activeChannelId, sender_id: userId, body: "" })
      .select()
      .single();

    if (!msgError) {
      await supabase.from("attachments").insert({
        message_id: messageRow.id,
        storage_path: path,
        file_name: file.name,
        file_size: file.size,
        content_type: file.type,
      });
    }
    setSending(false);
  }

  async function downloadAttachment(attachment) {
    const { data } = await supabase.storage.from("chat-files").createSignedUrl(attachment.storage_path, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  const teamChannels = channels.filter((c) => c.type === "team" || c.type === "admin");
  const dmChannels = channels.filter((c) => c.type === "dm");
  const activeChannel = channels.find((c) => c.id === activeChannelId);

  return (
    <Container fluid className="chat-page px-0">
      <div className="chat-sidebar">
        <div className="chat-sidebar-section-title">Kanalen</div>
        {teamChannels.map((c) => (
          <div
            key={c.id}
            className={`chat-channel-item ${c.id === activeChannelId ? "active" : ""}`}
            onClick={() => setActiveChannelId(c.id)}
          >
            # {channelLabel(c, profileMap, userId)}
          </div>
        ))}

        <div className="chat-sidebar-section-title">Directe berichten</div>
        {dmChannels.map((c) => (
          <div
            key={c.id}
            className={`chat-channel-item ${c.id === activeChannelId ? "active" : ""}`}
            onClick={() => setActiveChannelId(c.id)}
          >
            {channelLabel(c, profileMap, userId)}
          </div>
        ))}

        {roster.length > 0 && (
          <Dropdown className="px-3 mt-2">
            <Dropdown.Toggle size="sm" variant="outline-light">
              Nieuw gesprek
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {roster.map((p) => (
                <Dropdown.Item key={p.id} onClick={() => startDm(p.id)}>
                  {p.email}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        )}
      </div>

      <div className="chat-main">
        {!activeChannel ? (
          <div className="chat-empty-state">Kies een kanaal om te beginnen.</div>
        ) : (
          <>
            <div className="chat-message-list" ref={messageListRef}>
              {messages.map((m) => (
                <div key={m.id} className={`chat-message ${m.sender_id === userId ? "own" : ""}`}>
                  <div className="chat-message-meta">
                    {profileMap[m.sender_id]?.email ?? "Onbekend"} ·{" "}
                    {new Date(m.created_at).toLocaleString("nl-NL")}
                  </div>
                  {m.body && (
                    <div className="chat-message-bubble">
                      <MessageBody body={m.body} />
                    </div>
                  )}
                  {(m.attachments ?? []).map((a) => (
                    <div className="chat-attachment" key={a.id}>
                      <span>📎 {a.file_name}</span>
                      <span className="opacity-75">({formatFileSize(a.file_size)})</span>
                      <Button size="sm" variant="outline-light" onClick={() => downloadAttachment(a)}>
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <Form className="chat-composer" onSubmit={handleSend}>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFilePicked}
              />
              <Button
                type="button"
                variant="outline-light"
                onClick={() => fileInputRef.current?.click()}
                disabled={sending}
                title="Bestand versturen"
              >
                📎
              </Button>
              <Button
                type="button"
                variant="outline-light"
                onClick={insertCodeBlock}
                title="Code-blok invoegen"
              >
                {"</>"}
              </Button>
              <Form.Control
                as="textarea"
                rows={1}
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                placeholder="Typ een bericht..."
              />
              <Button type="submit" variant="primary" disabled={sending || !text.trim()}>
                Versturen
              </Button>
            </Form>
          </>
        )}
      </div>
    </Container>
  );
}
