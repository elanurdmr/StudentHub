import { Link, NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore.js';
import { notificationsAPI, messagesAPI } from '../../api/client.js';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    if (!token) { setUnread(0); setUnreadMessages(0); return; }
    notificationsAPI.list().then((r) => {
      setUnread(r.data.filter((n) => !n.isRead).length);
    }).catch(() => {});
    messagesAPI.conversations().then((r) => {
      const total = r.data.reduce((sum, c) => sum + (c.unread || 0), 0);
      setUnreadMessages(total);
    }).catch(() => {});
  }, [token]);

  function handleLogout() {
    logout();
    navigate('/');
  }

  const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : '';

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">StudentHub</Link>

      <div className="navbar-links">
        <NavLink to="/market">Hizmetler</NavLink>
        <NavLink to="/projects">Projeler</NavLink>
        <NavLink to="/needs">İhtiyaçlar</NavLink>
        {user && user.role !== 'admin' && <NavLink to="/favorites">Favoriler</NavLink>}
        {user && <NavLink to="/dashboard">Panel</NavLink>}
        {user?.role === 'admin' && <NavLink to="/admin" style={{ color: 'var(--coral)', fontWeight: 700 }}>⚙ Admin</NavLink>}
      </div>

      <div className="navbar-actions">
        <button
          onClick={() => setDark((d) => !d)}
          style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', padding: '.25rem', lineHeight: 1 }}
          title={dark ? 'Açık mod' : 'Koyu mod'}
        >
          {dark ? '☀️' : '🌙'}
        </button>
        {user ? (
          <>
            <Link to="/create" className="btn btn-primary btn-sm">+ İlan Oluştur</Link>
            <Link to="/messages" className="notif-icon-wrapper" style={{ fontSize: '1.25rem' }}>
              💬
              {unreadMessages > 0 && <span className="notif-dot" />}
            </Link>
            <Link to="/notifications" className="notif-icon-wrapper" style={{ fontSize: '1.25rem' }}>
              🔔
              {unread > 0 && <span className="notif-dot" />}
            </Link>
            <Link to={`/profile/${user._id || user.id}`}>
              <div className="avatar av-indigo" style={{ width: '2rem', height: '2rem', fontSize: '.8rem' }}>
                {user.avatar ? <img src={user.avatar} alt="" /> : initials}
              </div>
            </Link>
            <button onClick={handleLogout} className="btn btn-secondary btn-sm">Çıkış</button>
          </>
        ) : (
          <>
            <Link to="/auth" className="btn btn-ghost btn-sm">Giriş Yap</Link>
            <Link to="/auth?tab=register" className="btn btn-primary btn-sm">Ücretsiz Kaydol</Link>
          </>
        )}
      </div>
    </nav>
  );
}
