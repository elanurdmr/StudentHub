import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { messagesAPI } from '../api/client.js';
import { useSocket, sendMessage, joinConversation, markRead, typingStart, typingStop } from '../hooks/useSocket.js';
import useAuthStore from '../store/authStore.js';

export default function Messages() {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();

  const toId   = searchParams.get('to');
  const toName = searchParams.get('name') || 'Kullanıcı';

  const [convos, setConvos]         = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [activeName, setActiveName] = useState('');
  const [messages, setMessages]     = useState([]);
  const [text, setText]             = useState('');
  const [typingUsers, setTypingUsers] = useState({});
  const bottomRef  = useRef();
  const typingTimer = useRef();

  /* Socket olayları */
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

  /* Konuşma listesini yükle */
  useEffect(() => {
    messagesAPI.conversations().then((r) => setConvos(r.data)).catch(() => {});
  }, []);

  /* URL'den gelen ?to= varsa otomatik aç */
  useEffect(() => {
    if (!toId || !user?._id) return;
    const ids  = [user._id, toId].sort();
    const convId = `${ids[0]}-${ids[1]}`;
    openConvo(convId, toName);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toId, user?._id]);

  function openConvo(convId, name = convId) {
    setActiveConv(convId);
    setActiveName(name);
    joinConversation(convId);
    markRead(convId);
    messagesAPI.getMessages(convId).then((r) => {
      setMessages(r.data);
      setTimeout(() => bottomRef.current?.scrollIntoView(), 50);
    }).catch(() => setMessages([]));
  }

  function selectConvo(c) {
    const name = c.otherUser
      ? `${c.otherUser.firstName} ${c.otherUser.lastName}`
      : c.conversationId;
    openConvo(c.conversationId, name);
  }

  function handleSend(e) {
    e.preventDefault();
    if (!text.trim() || !activeConv) return;
    const trimmed = text.trim();

    /* Mesajı anında ekrana yansıt (mock/offline mod) */
    const localMsg = {
      _id: `local-${Date.now()}`,
      sender: user?._id,
      text: trimmed,
      createdAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, localMsg]);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

    sendMessage(activeConv, trimmed);
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

      {/* Konuşma listesi */}
      <div style={{ borderRight: '1px solid var(--border)', overflow: 'auto', padding: '1rem 0' }}>
        <div style={{ padding: '0 1rem 1rem', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif' }}>Mesajlar</h3>
        </div>

        {/* URL'den gelen kişi listeye eklenmemişse header'da göster */}
        {toId && (
          <div
            onClick={() => openConvo([user?._id, toId].sort().join('-'), toName)}
            style={{
              padding: '1rem', cursor: 'pointer', borderBottom: '1px solid var(--border)',
              background: activeConv === [user?._id, toId].sort().join('-') ? '#eef2ff' : '#f5f3ff',
              display: 'flex', alignItems: 'center', gap: '.75rem',
            }}
          >
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '.85rem', flexShrink: 0 }}>
              {toName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '.9rem' }}>{toName}</div>
              <div style={{ fontSize: '.75rem', color: 'var(--accent)' }}>Yeni konuşma</div>
            </div>
          </div>
        )}

        {convos.length === 0 && !toId ? (
          <div className="empty-state" style={{ padding: '2rem' }}>
            <div className="icon">💬</div>
            <p style={{ fontSize: '.85rem' }}>Henüz mesaj yok</p>
            <p style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: '.5rem' }}>Bir profil sayfasından mesaj göndererek başlayabilirsiniz.</p>
          </div>
        ) : (
          convos.map((c) => {
            const name = c.otherUser ? `${c.otherUser.firstName} ${c.otherUser.lastName}` : c.conversationId;
            const initials = name.charAt(0).toUpperCase();
            return (
              <div
                key={c.conversationId}
                onClick={() => selectConvo(c)}
                style={{
                  padding: '1rem', cursor: 'pointer', borderBottom: '1px solid var(--border)',
                  background: activeConv === c.conversationId ? '#eef2ff' : 'transparent',
                  transition: 'background .1s', display: 'flex', alignItems: 'center', gap: '.75rem',
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '.85rem', flexShrink: 0 }}>
                  {initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '.9rem', marginBottom: '.2rem' }}>{name}</div>
                  <div style={{ fontSize: '.8rem', color: 'var(--muted)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {c.lastMessage?.text || '…'}
                  </div>
                </div>
                {c.unread > 0 && (
                  <span style={{ background: 'var(--accent)', color: '#fff', borderRadius: '999px', fontSize: '.7rem', fontWeight: 700, padding: '.1rem .4rem', flexShrink: 0 }}>
                    {c.unread}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Sohbet alanı */}
      {activeConv ? (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', fontFamily: 'Syne, sans-serif', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            <span>{activeName}</span>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '.875rem', marginTop: '3rem' }}>
                Henüz mesaj yok. İlk mesajı sen gönder! 👋
              </div>
            )}
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
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>💬</div>
            <h3 style={{ fontFamily: 'Syne, sans-serif', marginBottom: '.5rem' }}>Bir konuşma seçin</h3>
            <p style={{ color: 'var(--muted)', fontSize: '.9rem' }}>Soldaki listeden devam etmek istediğiniz konuşmayı seçin.</p>
          </div>
        </div>
      )}
    </div>
  );
}
