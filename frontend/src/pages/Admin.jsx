import { useState, useEffect } from 'react';
import { adminAPI, reportsAPI } from '../api/client.js';

export default function Admin() {
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [needs, setNeeds] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([adminAPI.users(), adminAPI.services(), adminAPI.projects(), adminAPI.needs(), reportsAPI.adminList()])
      .then(([u, s, p, n, r]) => {
        setUsers(u.data);
        setServices(s.data);
        setProjects(p.data);
        setNeeds(n.data);
        setReports(r.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function toggleBan(user) {
    try {
      const fn = user.isBanned ? adminAPI.unbanUser : adminAPI.banUser;
      const { data } = await fn(user._id);
      setUsers((u) => u.map((x) => x._id === data._id ? data : x));
    } catch (err) {
      alert(err.response?.data?.error || 'Hata');
    }
  }

  async function removeService(id) {
    if (!confirm('Bu hizmeti silmek istediğinize emin misiniz?')) return;
    try {
      await adminAPI.removeService(id);
      setServices((s) => s.filter((x) => x._id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Hata');
    }
  }

  async function removeProject(id) {
    if (!confirm('Bu proje ilanını silmek istediğinize emin misiniz?')) return;
    try {
      await adminAPI.removeProject(id);
      setProjects((list) => list.filter((x) => x._id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Hata');
    }
  }

  async function removeNeed(id) {
    if (!confirm('Bu ihtiyaç ilanını silmek istediğinize emin misiniz?')) return;
    try {
      await adminAPI.removeNeed(id);
      setNeeds((list) => list.filter((x) => x._id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Hata');
    }
  }

  const tabs = [
    { key: 'users', label: 'Kullanıcılar', count: users.length },
    { key: 'services', label: 'Hizmetler', count: services.length },
    { key: 'projects', label: 'Projeler', count: projects.length },
    { key: 'needs', label: 'İhtiyaçlar', count: needs.length },
    { key: 'reports', label: 'Şikayetler', count: reports.length },
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
          <div style={{ color: 'var(--muted)', fontSize: '.85rem' }}>Hizmet ilanı</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '2rem', color: 'var(--amber)' }}>
            {projects.length + needs.length}
          </div>
          <div style={{ color: 'var(--muted)', fontSize: '.85rem' }}>Proje + İhtiyaç</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '.25rem' }}>
        {tabs.map((t) => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)} style={{
            padding: '.75rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer',
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
                      <button type="button" className={`btn btn-sm btn-secondary ${u.isBanned ? '' : ''}`} style={{ color: u.isBanned ? 'var(--teal)' : 'var(--coral)' }} onClick={() => toggleBan(u)}>
                        {u.isBanned ? 'Aktif Et' : 'Askıya Al'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : tab === 'services' ? (
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
                      <button type="button" className="btn btn-sm btn-secondary" style={{ color: 'var(--coral)' }} onClick={() => removeService(s._id)}>
                        Kaldır
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : tab === 'projects' ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Proje</th>
                <th>Sahibi</th>
                <th>Kategori</th>
                <th>Durum</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => {
                const owner = p.owner || {};
                return (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 600 }}>{p.title}</td>
                    <td style={{ color: 'var(--muted)' }}>{owner.firstName} {owner.lastName}</td>
                    <td>{p.category}</td>
                    <td><span className="chip chip-slate">{p.status}</span></td>
                    <td>
                      <button type="button" className="btn btn-sm btn-secondary" style={{ color: 'var(--coral)' }} onClick={() => removeProject(p._id)}>
                        Sil
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : tab === 'needs' ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>İhtiyaç</th>
                <th>Oluşturan</th>
                <th>Kategori</th>
                <th>Bütçe</th>
                <th>Durum</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {needs.map((n) => {
                const owner = n.owner || {};
                return (
                  <tr key={n._id}>
                    <td style={{ fontWeight: 600 }}>{n.title}</td>
                    <td style={{ color: 'var(--muted)' }}>{owner.firstName} {owner.lastName}</td>
                    <td>{n.category}</td>
                    <td style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>₺{n.budget}</td>
                    <td><span className="chip chip-slate">{n.status}</span></td>
                    <td>
                      <button type="button" className="btn btn-sm btn-secondary" style={{ color: 'var(--coral)' }} onClick={() => removeNeed(n._id)}>
                        Sil
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Şikayet Eden</th>
                <th>İçerik Türü</th>
                <th>Sebep</th>
                <th>Durum</th>
                <th>Tarih</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem' }}>Henüz şikayet yok</td></tr>
              ) : reports.map((r) => {
                const reporter = r.reportedBy;
                const reporterName = reporter
                  ? `${reporter.firstName} ${reporter.lastName}`
                  : 'Mock Kullanıcı';
                const statusClass = r.status === 'reviewed' ? 'status-active' : r.status === 'dismissed' ? 'status-rejected' : 'status-pending';
                const statusLabel = r.status === 'reviewed' ? 'İncelendi' : r.status === 'dismissed' ? 'Reddedildi' : 'Bekliyor';
                return (
                  <tr key={r._id}>
                    <td style={{ fontWeight: 600 }}>{reporterName}</td>
                    <td><span className="chip chip-slate" style={{ fontSize: '.7rem' }}>{r.contentType}</span></td>
                    <td style={{ color: 'var(--muted)', fontSize: '.85rem' }}>{(r.reason || '').slice(0, 60)}</td>
                    <td><span className={`status-badge ${statusClass}`}>{statusLabel}</span></td>
                    <td style={{ color: 'var(--muted)', fontSize: '.85rem' }}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString('tr-TR') : '—'}</td>
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
