import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notificationsAPI } from '../api/client.js';

const TYPE_ICON = { message: '💬', application: '📋', offer: '💼', review: '⭐', purchase: '🛍', system: '🔔' };

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationsAPI.list().then((r) => setNotifs(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function markRead(id) {
    await notificationsAPI.markRead(id).catch(() => {});
    setNotifs((n) => n.map((x) => x._id === id ? { ...x, isRead: true } : x));
  }

  async function markAll() {
    await notificationsAPI.markAllRead().catch(() => {});
    setNotifs((n) => n.map((x) => ({ ...x, isRead: true })));
  }

  const unread = notifs.filter((n) => !n.isRead).length;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: 720 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.75rem' }}>Bildirimler</h1>
          {unread > 0 && <p style={{ color: 'var(--muted)', marginTop: '.25rem' }}>{unread} okunmamış bildirim</p>}
        </div>
        {unread > 0 && (
          <button className="btn btn-secondary btn-sm" onClick={markAll}>Tümünü okundu işaretle</button>
        )}
      </div>

      {loading ? (
        <div className="empty-state"><p>Yükleniyor…</p></div>
      ) : notifs.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🔔</div>
          <h3>Bildirim yok</h3>
          <p>Yeni bildirimler burada görünecek</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          {notifs.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.isRead && markRead(n._id)}
              style={{
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius)',
                border: `1px solid ${n.isRead ? 'var(--border)' : 'var(--accent)'}`,
                background: n.isRead ? 'var(--card)' : 'rgba(99,102,241,0.08)',
                cursor: 'pointer',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start',
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>{TYPE_ICON[n.type] || '🔔'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: n.isRead ? 400 : 700, marginBottom: '.2rem' }}>{n.title}</div>
                {n.body && <p style={{ color: 'var(--muted)', fontSize: '.875rem' }}>{n.body}</p>}
                <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: '.35rem' }}>
                  {new Date(n.createdAt).toLocaleString('tr-TR')}
                </div>
              </div>
              {n.link && (
                <Link to={n.link} onClick={(e) => e.stopPropagation()} className="btn btn-secondary btn-sm">
                  Git →
                </Link>
              )}
              {!n.isRead && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', marginTop: '.35rem', flexShrink: 0 }} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
