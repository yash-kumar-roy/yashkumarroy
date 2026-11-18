import { useState } from 'react';

const SUGGESTIONS = [
  'What projects has Yash built?',
  'Tell me about Telecom Churn Prediction',
  'What is his full tech stack?',
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);

  async function handleSend(textToSend) {
    const text = (textToSend || message).trim();
    if (!text || busy) return;

    setMessages((items) => [...items, { role: 'user', text }]);
    setMessage('');
    setBusy(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json().catch(() => ({}));
      setMessages((items) => [
        ...items,
        { role: 'bot', text: data.reply || data.message || 'I am unable to answer right now.' },
      ]);
    } catch {
      setMessages((items) => [
        ...items,
        {
          role: 'bot',
          text: 'Yash Kumar Roy is a Data Science Associate and Developer with expertise in Python, React, Node.js, Express, MongoDB, and Machine Learning. Check out his 19 projects in the Projects section!',
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function submit(e) {
    e.preventDefault();
    handleSend();
  }

  return (
    <aside className="chat">
      <button
        className="chat-toggle"
        onClick={() => setOpen(!open)}
        aria-label="Toggle AI assistant"
      >
        {open ? 'Close' : 'Ask about my work'}
      </button>

      {open && (
        <section className="chat-panel" role="complementary" aria-label="AI Portfolio Assistant">
          <div className="chat-header">
            <strong>Portfolio assistant</strong>
            <small>Ask anything about Yash’s projects, skills or experience</small>
          </div>

          <div className="messages">
            <p className="bot">
              Hi! What would you like to know about Yash?
            </p>
            {messages.map((item, i) => (
              <p key={i} className={item.role}>
                {item.text}
              </p>
            ))}
          </div>

          {messages.length === 0 && (
            <div className="chat-suggestions">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="chip-suggestion"
                  onClick={() => handleSend(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={submit}>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask a question..."
              aria-label="Chat message"
              disabled={busy}
            />
            <button type="submit" disabled={busy || !message.trim()}>
              {busy ? '…' : 'Send'}
            </button>
          </form>
        </section>
      )}
    </aside>
  );
}
