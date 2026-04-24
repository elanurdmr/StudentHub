import { Link, NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore.js';
import { notificationsAPI } from '../../api/client.js';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!token) return;
    notificationsAPI.list().then((r) => {
      setUnread(r.data.filter((n) => !n.isRead).length);
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
        {user && <NavLink to="/dashboard">Panel</NavLink>}
      </div>

      <div className="navbar-actions">
        {user ? (
          <>
            <Link to="/create" className="btn btn-primary btn-sm">+ İlan Oluştur</Link>
            <Link to="/notifications" className="notif-icon-wrapper" style={{ fontSize: '1.25rem' }}>
              🔔
              {unread > 0 && <span className="notif-dot" />}
            </Link>
            <Link to={`/profile/${user._id}`}>
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
