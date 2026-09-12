const CODE_FENCE = /```(\w*)\n?([\s\S]*?)```/g;

// Splits a message body into plain-text and code-block segments so the
// UI can render fenced code (```like this```) in a monospace block.
export function parseMessageBody(body) {
  const segments = [];
  let lastIndex = 0;
  let match;

  CODE_FENCE.lastIndex = 0;
  while ((match = CODE_FENCE.exec(body)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", content: body.slice(lastIndex, match.index) });
    }
    segments.push({ type: "code", lang: match[1], content: match[2].replace(/\n$/, "") });
    lastIndex = CODE_FENCE.lastIndex;
  }

  if (lastIndex < body.length) {
    segments.push({ type: "text", content: body.slice(lastIndex) });
  }

  return segments;
}
