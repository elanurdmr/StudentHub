import { useState, useEffect } from 'react';
import { adminAPI } from '../api/client.js';

export default function Admin() {
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([adminAPI.users(), adminAPI.services()])
      .then(([u, s]) => { setUsers(u.data); setServices(s.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function toggleBan(user) {
    try {
      const fn = user.isBanned ? adminAPI.unbanUser : adminAPI.banUser;
      const { data } = await fn(user._id);
      setUsers((u) => u.map((x) => x._id === data._id ? data : x));
    } catch (err) { alert(err.response?.data?.error || 'Hata'); }
  }

  async function removeService(id) {
    if (!confirm('Bu hizmeti silmek istediğinize emin misiniz?')) return;
    try {
      await adminAPI.removeService(id);
      setServices((s) => s.filter((x) => x._id !== id));
    } catch (err) { alert(err.response?.data?.error || 'Hata'); }
  }

  const tabs = [
    { key: 'users', label: 'Kullanıcılar', count: users.length },
    { key: 'services', label: 'Hizmetler', count: services.length },
  ];

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div className="chip chip-coral" style={{ marginBottom: '.75rem' }}>Admin Paneli</div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.75rem' }}>Platform Yönetimi</h1>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '2rem', color: 'var(--accent)' }}>{users.length}</div>
          <div style={{ color: 'var(--muted)', fontSize: '.85rem' }}>Toplam Kullanıcı</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '2rem', color: 'var(--coral)' }}>{users.filter((u) => u.isBanned).length}</div>
          <div style={{ color: 'var(--muted)', fontSize: '.85rem' }}>Askıya Alınan</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '2rem', color: 'var(--teal)' }}>{services.length}</div>
          <div style={{ color: 'var(--muted)', fontSize: '.85rem' }}>Aktif Hizmet</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '2rem', color: 'var(--amber)' }}>
            {services.reduce((s, x) => s + (x.purchaseCount || 0), 0)}
          </div>
          <div style={{ color: 'var(--muted)', fontSize: '.85rem' }}>Toplam Satış</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '.75rem 1.5rem', background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'Syne, sans-serif', fontWeight: 600,
            color: tab === t.key ? 'var(--accent)' : 'var(--muted)',
            borderBottom: tab === t.key ? '2px solid var(--accent)' : '2px solid transparent',
            marginBottom: -1,
          }}>
            {t.label} <span className="chip chip-slate" style={{ fontSize: '.7rem', marginLeft: '.35rem' }}>{t.count}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty-state"><p>Yükleniyor…</p></div>
      ) : tab === 'users' ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Kullanıcı</th>
                <th>E-posta</th>
                <th>Kayıt Tarihi</th>
                <th>Rol</th>
                <th>Durum</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td style={{ fontWeight: 600 }}>{u.firstName} {u.lastName}</td>
                  <td style={{ color: 'var(--muted)' }}>{u.email}</td>
                  <td style={{ color: 'var(--muted)', fontSize: '.85rem' }}>{new Date(u.createdAt).toLocaleDateString('tr-TR')}</td>
                  <td><span className={`chip ${u.role === 'admin' ? 'chip-violet' : 'chip-slate'}`}>{u.role}</span></td>
                  <td>
                    <span className={`status-badge ${u.isBanned ? 'status-rejected' : 'status-active'}`}>
                      {u.isBanned ? 'Askıda' : 'Aktif'}
                    </span>
                  </td>
                  <td>
                    {u.role !== 'admin' && (
                      <button
                        className={`btn btn-sm ${u.isBanned ? 'btn-secondary' : 'btn-secondary'}`}
                        style={{ color: u.isBanned ? 'var(--teal)' : 'var(--coral)' }}
                        onClick={() => toggleBan(u)}
                      >
                        {u.isBanned ? 'Aktif Et' : 'Askıya Al'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Hizmet</th>
                <th>Satıcı</th>
                <th>Kategori</th>
                <th>Fiyat</th>
                <th>Satış</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => {
                const owner = s.owner || {};
                return (
                  <tr key={s._id}>
                    <td style={{ fontWeight: 600 }}>{s.title}</td>
                    <td style={{ color: 'var(--muted)' }}>{owner.firstName} {owner.lastName}</td>
                    <td><span className="chip chip-indigo" style={{ fontSize: '.7rem' }}>{s.category}</span></td>
                    <td style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--accent)' }}>₺{s.price}</td>
                    <td style={{ color: 'var(--muted)' }}>{s.purchaseCount}</td>
                    <td>
                      <button className="btn btn-sm btn-secondary" style={{ color: 'var(--coral)' }} onClick={() => removeService(s._id)}>
                        Kaldır
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
