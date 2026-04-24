import { useState, useEffect, useRef } from 'react';
import { messagesAPI } from '../api/client.js';
import { useSocket, sendMessage, joinConversation, markRead, typingStart, typingStop } from '../hooks/useSocket.js';
import useAuthStore from '../store/authStore.js';

export default function Messages() {
  const { user } = useAuthStore();
  const [convos, setConvos] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typingUsers, setTypingUsers] = useState({});
  const bottomRef = useRef();
  const typingTimer = useRef();

  useSocket({
    onMessage: ({ convId, message }) => {
      if (convId === activeConv) {
        setMessages((m) => [...m, message]);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      }
    },
    onTyping: ({ convId, userId, typing }) => {
      if (convId === activeConv) setTypingUsers((t) => ({ ...t, [userId]: typing }));
    },
  });

  useEffect(() => {
    messagesAPI.conversations().then((r) => setConvos(r.data)).catch(() => {});
  }, []);

  function selectConvo(convId) {
    setActiveConv(convId);
    joinConversation(convId);
    markRead(convId);
    messagesAPI.getMessages(convId).then((r) => {
      setMessages(r.data);
      setTimeout(() => bottomRef.current?.scrollIntoView(), 50);
    }).catch(() => {});
  }

  function handleSend(e) {
    e.preventDefault();
    if (!text.trim() || !activeConv) return;
    sendMessage(activeConv, text.trim());
    setText('');
    typingStop(activeConv);
  }

  function handleTyping(e) {
    setText(e.target.value);
    if (!activeConv) return;
    typingStart(activeConv);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => typingStop(activeConv), 2000);
  }

  const isTyping = Object.entries(typingUsers).some(([uid, t]) => t && uid !== user?._id);

  return (
    <div style={{ height: 'calc(100vh - 64px)', display: 'grid', gridTemplateColumns: '300px 1fr' }}>
      {/* Conversation list */}
      <div style={{ borderRight: '1px solid var(--border)', overflow: 'auto', padding: '1rem 0' }}>
        <div style={{ padding: '0 1rem 1rem', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif' }}>Mesajlar</h3>
        </div>
        {convos.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem' }}>
            <div className="icon">💬</div>
            <p style={{ fontSize: '.85rem' }}>Henüz mesaj yok</p>
          </div>
        ) : (
          convos.map((c) => (
            <div
              key={c.conversationId}
              onClick={() => selectConvo(c.conversationId)}
              style={{
                padding: '1rem', cursor: 'pointer', borderBottom: '1px solid var(--border)',
                background: activeConv === c.conversationId ? '#eef2ff' : 'transparent',
                transition: 'background .1s',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '.9rem', marginBottom: '.25rem' }}>{c.conversationId}</div>
              <div style={{ fontSize: '.8rem', color: 'var(--muted)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{c.text}</div>
            </div>
          ))
        )}
      </div>

      {/* Chat area */}
      {activeConv ? (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
            {activeConv}
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
            {messages.map((m) => {
              const isMine = m.sender?._id === user?._id || m.sender === user?._id;
              return (
                <div key={m._id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                  <div className={`bubble ${isMine ? 'bubble-sent' : 'bubble-recv'}`}>{m.text}</div>
                </div>
              );
            })}
            {isTyping && (
              <div style={{ display: 'flex' }}>
                <div className="bubble bubble-recv" style={{ color: 'var(--muted)', fontStyle: 'italic', fontSize: '.85rem' }}>yazıyor…</div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={handleSend} style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '1rem' }}>
            <input
              className="form-control"
              value={text}
              onChange={handleTyping}
              placeholder="Mesaj yazın…"
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary" type="submit">Gönder</button>
          </form>
        </div>
      ) : (
        <div className="empty-state" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div>
            <div className="icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
            <h3>Bir konuşma seçin</h3>
          </div>
        </div>
      )}
    </div>
  );
}
