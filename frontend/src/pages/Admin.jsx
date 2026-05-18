import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI, reportsAPI } from '../api/client.js';

/* ── Basit CSS bar chart bileşeni ── */
function BarChart({ data, color }) {
  if (!data?.length) return <p style={{ color: 'var(--muted)', fontSize: '.85rem' }}>Veri yok</p>;
  const max = Math.max(...data.map((d) => d.count));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
      {data.map((d) => (
        <div key={d._id} style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          <div style={{ width: 110, fontSize: '.78rem', color: 'var(--muted)', textAlign: 'right', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {d._id}
          </div>
          <div style={{ flex: 1, background: 'var(--bg)', borderRadius: 4, height: 18, overflow: 'hidden' }}>
            <div style={{ width: `${(d.count / max) * 100}%`, background: color, height: '100%', borderRadius: 4, transition: 'width .4s' }} />
          </div>
          <div style={{ fontSize: '.78rem', fontWeight: 700, color, width: 24, textAlign: 'right', flexShrink: 0 }}>{d.count}</div>
        </div>
      ))}
    </div>
  );
}

export default function Admin() {
  const [tab, setTab] = useState('pending');

  /* Liste state'leri */
  const [users, setUsers]       = useState([]);
  const [services, setServices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [needs, setNeeds]       = useState([]);
  const [reports, setReports]   = useState([]);
  const [pending, setPending]   = useState({ services: [], projects: [], needs: [] });
  const [logs, setLogs]         = useState([]);
  const [catStats, setCatStats] = useState(null);
  const [topUsers, setTopUsers] = useState(null);

  const [loading, setLoading]   = useState(true);

  /* Onay reddet modal */
  const [rejectModal, setRejectModal]   = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  /* Kullanıcı arama + detay modal */
  const [userSearch, setUserSearch]         = useState('');
  const [userDetail, setUserDetail]         = useState(null);
  const [userDetailLoading, setUserDetailLoading] = useState(false);

  /* Şikayet filtreleri */
  const [reportFilter, setReportFilter]   = useState('all');
  const [reportNotes, setReportNotes]     = useState({});
  const [reportUpdating, setReportUpdating] = useState(null);

  /* Duyuru formu */
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceBody, setAnnounceBody]   = useState('');
  const [announceLoading, setAnnounceLoading] = useState(false);
  const [announceResult, setAnnounceResult]   = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      adminAPI.users(),
      adminAPI.services(),
      adminAPI.projects(),
      adminAPI.needs(),
      reportsAPI.adminList(),
      adminAPI.pending(),
      adminAPI.logs(),
      adminAPI.categoryStats().catch(() => ({ data: null })),
      adminAPI.topUsers().catch(() => ({ data: null })),
    ]).then(([u, s, p, n, r, pend, l, cats, top]) => {
      setUsers(u.data);
      setServices(s.data);
      setProjects(p.data);
      setNeeds(n.data);
      setReports(r.data);
      setPending(pend.data);
      setLogs(l.data);
      if (cats.data) setCatStats(cats.data);
      if (top.data) setTopUsers(top.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const pendingTotal = (pending.services?.length || 0) + (pending.projects?.length || 0) + (pending.needs?.length || 0);
  const pendingReportsCount = reports.filter((r) => r.status === 'pending').length;

  /* ── Aksiyonlar ── */
  async function toggleBan(user) {
    try {
      const fn = user.isBanned ? adminAPI.unbanUser : adminAPI.banUser;
      const { data } = await fn(user._id);
      setUsers((u) => u.map((x) => x._id === data._id ? data : x));
      if (userDetail?.user?._id === data._id) setUserDetail((d) => ({ ...d, user: data }));
    } catch (err) { alert(err.response?.data?.error || 'Hata'); }
  }

  async function removeService(id) {
    if (!confirm('Bu hizmeti silmek istediğinize emin misiniz?')) return;
    try { await adminAPI.removeService(id); setServices((s) => s.filter((x) => x._id !== id)); }
    catch (err) { alert(err.response?.data?.error || 'Hata'); }
  }

  async function removeProject(id) {
    if (!confirm('Bu proje ilanını silmek istediğinize emin misiniz?')) return;
    try { await adminAPI.removeProject(id); setProjects((list) => list.filter((x) => x._id !== id)); }
    catch (err) { alert(err.response?.data?.error || 'Hata'); }
  }

  async function removeNeed(id) {
    if (!confirm('Bu ihtiyaç ilanını silmek istediğinize emin misiniz?')) return;
    try { await adminAPI.removeNeed(id); setNeeds((list) => list.filter((x) => x._id !== id)); }
    catch (err) { alert(err.response?.data?.error || 'Hata'); }
  }

  async function handleApproveAll() {
    if (!confirm('Tüm bekleyen ilanlar onaylanacak. Emin misiniz?')) return;
    try {
      const all = [
        ...pending.services.map((x) => ({ type: 'service', id: x._id })),
        ...pending.projects.map((x) => ({ type: 'project', id: x._id })),
        ...pending.needs.map((x) => ({ type: 'need', id: x._id })),
      ];
      await Promise.all(all.map(({ type, id }) => adminAPI.approve(type, id)));
      setPending({ services: [], projects: [], needs: [] });
    } catch { alert('Hata oluştu'); }
  }

  async function handleApprove(type, id) {
    try {
      await adminAPI.approve(type, id);
      setPending((prev) => ({ ...prev, [`${type}s`]: prev[`${type}s`].filter((x) => x._id !== id) }));
    } catch (err) { alert(err.response?.data?.error || 'Hata'); }
  }

  async function handleReject() {
    if (!rejectModal) return;
    try {
      await adminAPI.reject(rejectModal.type, rejectModal.id, rejectReason || 'İlan uygun bulunmadı.');
      const key = `${rejectModal.type}s`;
      setPending((prev) => ({ ...prev, [key]: prev[key].filter((x) => x._id !== rejectModal.id) }));
      setRejectModal(null); setRejectReason('');
    } catch (err) { alert(err.response?.data?.error || 'Hata'); }
  }

  async function handleReportStatus(id, status) {
    setReportUpdating(id);
    try {
      const { data } = await reportsAPI.updateStatus(id, status, reportNotes[id] || '');
      setReports((prev) => prev.map((r) => r._id === id ? { ...r, ...data } : r));
    } catch { alert('Güncelleme başarısız'); }
    finally { setReportUpdating(null); }
  }

  async function openUserDetail(userId) {
    setUserDetail(null);
    setUserDetailLoading(true);
    try {
      const { data } = await adminAPI.userDetail(userId);
      setUserDetail(data);
    } catch { alert('Kullanıcı detayı yüklenemedi'); }
    finally { setUserDetailLoading(false); }
  }

  async function sendAnnounce(e) {
    e.preventDefault();
    if (!announceTitle || !announceBody) return;
    setAnnounceLoading(true); setAnnounceResult('');
    try {
      const { data } = await adminAPI.announce(announceTitle, announceBody);
      setAnnounceResult(data.message);
      setAnnounceTitle(''); setAnnounceBody('');
    } catch (err) { setAnnounceResult('Hata: ' + (err.response?.data?.error || 'Gönderilemedi')); }
    finally { setAnnounceLoading(false); }
  }

  /* ── Yardımcı ── */
  const filteredUsers = users.filter((u) =>
    !userSearch || `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(userSearch.toLowerCase())
  );
  const filteredReports = reportFilter === 'all' ? reports : reports.filter((r) => r.status === reportFilter);

  const CONTENT_TYPE_LABEL = { service: 'Hizmet', project: 'Proje', need: 'İhtiyaç', user: 'Kullanıcı' };
  const CONTENT_TYPE_CHIP  = { service: 'chip-indigo', project: 'chip-lime', need: 'chip-amber', user: 'chip-coral' };
  const CONTENT_TYPE_PATH  = { service: '/detail/service', project: '/detail/project', need: '/detail/need', user: '/profile' };

  const actionLabels = {
    banUser: '🚫 Kullanıcı askıya alındı', unbanUser: '✅ Kullanıcı aktif edildi',
    approve: '✅ İlan onaylandı', reject: '❌ İlan reddedildi',
    removeService: '🗑 Hizmet silindi', removeProject: '🗑 Proje silindi', removeNeed: '🗑 İhtiyaç silindi',
    unauthorized_access: '⚠️ Yetkisiz erişim', announce: '📢 Duyuru gönderildi',
    reviewReport: '✅ Şikayet incelendi', dismissReport: '❌ Şikayet reddedildi',
  };

  const tabs = [
    { key: 'pending',  label: '⏳ Onay Bekleyenler', count: pendingTotal, highlight: pendingTotal > 0 },
    { key: 'users',    label: '👥 Kullanıcılar',     count: users.length },
    { key: 'stats',    label: '📊 İstatistikler',    count: null },
    { key: 'reports',  label: '🚨 Şikayetler',       count: pendingReportsCount, highlight: pendingReportsCount > 0 },
    { key: 'announce', label: '📢 Duyurular',         count: null },
    { key: 'services', label: 'Hizmetler',            count: services.length },
    { key: 'projects', label: 'Projeler',             count: projects.length },
    { key: 'needs',    label: 'İhtiyaçlar',           count: needs.length },
    { key: 'logs',     label: '📋 İşlem Geçmişi',    count: logs.length },
  ];

  /* ── PendingCard ── */
  function PendingCard({ item, type }) {
    const owner = item.owner || {};
    return (
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', marginBottom: '.4rem', flexWrap: 'wrap' }}>
              <span className={`chip ${type === 'service' ? 'chip-teal' : type === 'project' ? 'chip-indigo' : 'chip-amber'}`} style={{ fontSize: '.7rem' }}>
                {type === 'service' ? 'Hizmet' : type === 'project' ? 'Proje' : 'İhtiyaç'}
              </span>
              <span className="chip chip-slate" style={{ fontSize: '.7rem' }}>{item.category}</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '.25rem' }}>{item.title}</div>
            <div style={{ color: 'var(--muted)', fontSize: '.85rem', marginBottom: '.5rem' }}>
              {owner.firstName} {owner.lastName} · {owner.email}
            </div>
            <div style={{ color: 'var(--muted)', fontSize: '.85rem', lineHeight: 1.5 }}>
              {item.description?.slice(0, 150)}{item.description?.length > 150 ? '…' : ''}
            </div>
            {item.price && <div style={{ marginTop: '.5rem', fontWeight: 700, color: 'var(--accent)' }}>₺{item.price}</div>}
          </div>
          <div style={{ display: 'flex', gap: '.5rem', flexShrink: 0 }}>
            <button className="btn btn-sm" style={{ background: 'var(--teal)', color: '#fff' }} onClick={() => handleApprove(type, item._id)}>✓ Onayla</button>
            <button className="btn btn-sm btn-secondary" style={{ color: 'var(--coral)' }} onClick={() => setRejectModal({ type, id: item._id, title: item.title })}>✕ Reddet</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>

      <div style={{ marginBottom: '2rem' }}>
        <div className="chip chip-coral" style={{ marginBottom: '.75rem' }}>Admin Paneli</div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.75rem' }}>Platform Yönetimi</h1>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '.15rem', overflowX: 'auto' }}>
        {tabs.map((t) => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)} style={{
            padding: '.65rem 1.1rem', background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'Syne, sans-serif', fontWeight: 600, whiteSpace: 'nowrap',
            color: tab === t.key ? (t.highlight ? 'var(--coral)' : 'var(--accent)') : 'var(--muted)',
            borderBottom: tab === t.key ? `2px solid ${t.highlight ? 'var(--coral)' : 'var(--accent)'}` : '2px solid transparent',
            marginBottom: -1,
          }}>
            {t.label}
            {t.count != null && (
              <span className={`chip ${t.highlight ? 'chip-coral' : 'chip-slate'}`} style={{ fontSize: '.7rem', marginLeft: '.35rem' }}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty-state"><p>Yükleniyor…</p></div>

      ) : tab === 'pending' ? (
        /* ── Onay Bekleyenler ── */
        <div>
          {pendingTotal === 0 ? (
            <div className="empty-state">
              <p style={{ fontSize: '2rem', marginBottom: '.5rem' }}>✅</p>
              <p>Onay bekleyen ilan yok</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button className="btn btn-sm" style={{ background: 'var(--teal)', color: '#fff' }} onClick={handleApproveAll}>
                  ✓ Tümünü Onayla ({pendingTotal})
                </button>
              </div>
              {pending.services?.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontFamily: 'Syne, sans-serif', marginBottom: '1rem', color: 'var(--muted)', fontSize: '.9rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>Hizmetler ({pending.services.length})</h3>
                  {pending.services.map((s) => <PendingCard key={s._id} item={s} type="service" />)}
                </div>
              )}
              {pending.projects?.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontFamily: 'Syne, sans-serif', marginBottom: '1rem', color: 'var(--muted)', fontSize: '.9rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>Projeler ({pending.projects.length})</h3>
                  {pending.projects.map((p) => <PendingCard key={p._id} item={p} type="project" />)}
                </div>
              )}
              {pending.needs?.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontFamily: 'Syne, sans-serif', marginBottom: '1rem', color: 'var(--muted)', fontSize: '.9rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>İhtiyaçlar ({pending.needs.length})</h3>
                  {pending.needs.map((n) => <PendingCard key={n._id} item={n} type="need" />)}
                </div>
              )}
            </>
          )}
        </div>

      ) : tab === 'users' ? (
        /* ── Kullanıcılar ── */
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <input className="form-control" placeholder="🔍 İsim veya e-posta ile ara…" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} style={{ maxWidth: 360 }} />
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="table">
              <thead>
                <tr><th>Kullanıcı</th><th>E-posta</th><th>Kayıt</th><th>Rol</th><th>Durum</th><th>İşlem</th></tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem' }}>Kullanıcı bulunamadı</td></tr>
                ) : filteredUsers.map((u) => (
                  <tr key={u._id}>
                    <td style={{ fontWeight: 600 }}>{u.firstName} {u.lastName}</td>
                    <td style={{ color: 'var(--muted)', fontSize: '.85rem' }}>{u.email}</td>
                    <td style={{ color: 'var(--muted)', fontSize: '.85rem' }}>{new Date(u.createdAt).toLocaleDateString('tr-TR')}</td>
                    <td><span className={`chip ${u.role === 'admin' ? 'chip-violet' : 'chip-slate'}`}>{u.role}</span></td>
                    <td><span className={`status-badge ${u.isBanned ? 'status-rejected' : 'status-active'}`}>{u.isBanned ? 'Askıda' : 'Aktif'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '.4rem' }}>
                        <button type="button" className="btn btn-sm btn-secondary" onClick={() => openUserDetail(u._id)}>Detay</button>
                        {u.role !== 'admin' && (
                          <button type="button" className="btn btn-sm btn-secondary" style={{ color: u.isBanned ? 'var(--teal)' : 'var(--coral)' }} onClick={() => toggleBan(u)}>
                            {u.isBanned ? 'Aktif Et' : 'Askıya Al'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      ) : tab === 'stats' ? (
        /* ── İstatistikler ── */
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="card">
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '.95rem', marginBottom: '1.25rem' }}>🛍 Hizmet Kategorileri</h3>
              <BarChart data={catStats?.services} color="var(--accent)" />
            </div>
            <div className="card">
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '.95rem', marginBottom: '1.25rem' }}>🤝 Proje Kategorileri</h3>
              <BarChart data={catStats?.projects} color="var(--accent2)" />
            </div>
            <div className="card">
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '.95rem', marginBottom: '1.25rem' }}>📢 İhtiyaç Kategorileri</h3>
              <BarChart data={catStats?.needs} color="var(--amber)" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div className="card">
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '.95rem', marginBottom: '1.25rem' }}>🏆 En Çok Hizmet Açanlar</h3>
              {topUsers?.byServices?.length ? topUsers.byServices.map((row, i) => (
                <div key={row._id} style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.75rem' }}>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: i === 0 ? 'var(--amber)' : 'var(--muted)', width: 20, textAlign: 'center' }}>{i + 1}</div>
                  <div className="avatar av-violet" style={{ width: '2rem', height: '2rem', fontSize: '.75rem', flexShrink: 0 }}>
                    {row.user.avatar ? <img src={row.user.avatar} alt="" /> : `${row.user.firstName?.[0] || ''}${row.user.lastName?.[0] || ''}`}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.user.firstName} {row.user.lastName}</div>
                    <div style={{ color: 'var(--muted)', fontSize: '.75rem' }}>{row.user.email}</div>
                  </div>
                  <span className="chip chip-teal" style={{ fontSize: '.75rem' }}>{row.count} ilan</span>
                </div>
              )) : <p style={{ color: 'var(--muted)', fontSize: '.85rem' }}>Veri yok</p>}
            </div>

            <div className="card">
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '.95rem', marginBottom: '1.25rem' }}>🏆 En Çok Proje Açanlar</h3>
              {topUsers?.byProjects?.length ? topUsers.byProjects.map((row, i) => (
                <div key={row._id} style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.75rem' }}>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: i === 0 ? 'var(--amber)' : 'var(--muted)', width: 20, textAlign: 'center' }}>{i + 1}</div>
                  <div className="avatar av-violet" style={{ width: '2rem', height: '2rem', fontSize: '.75rem', flexShrink: 0 }}>
                    {row.user.avatar ? <img src={row.user.avatar} alt="" /> : `${row.user.firstName?.[0] || ''}${row.user.lastName?.[0] || ''}`}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.user.firstName} {row.user.lastName}</div>
                    <div style={{ color: 'var(--muted)', fontSize: '.75rem' }}>{row.user.email}</div>
                  </div>
                  <span className="chip chip-indigo" style={{ fontSize: '.75rem' }}>{row.count} proje</span>
                </div>
              )) : <p style={{ color: 'var(--muted)', fontSize: '.85rem' }}>Veri yok</p>}
            </div>
          </div>
        </div>

      ) : tab === 'reports' ? (
        /* ── Şikayetler ── */
        <div>
          <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            {[
              { key: 'all',       label: `Tümü (${reports.length})` },
              { key: 'pending',   label: `⏳ Bekliyor (${reports.filter(r => r.status === 'pending').length})` },
              { key: 'reviewed',  label: `✅ İncelendi (${reports.filter(r => r.status === 'reviewed').length})` },
              { key: 'dismissed', label: `❌ Reddedildi (${reports.filter(r => r.status === 'dismissed').length})` },
            ].map((f) => (
              <button key={f.key} type="button" onClick={() => setReportFilter(f.key)}
                className={reportFilter === f.key ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-secondary'}>
                {f.label}
              </button>
            ))}
          </div>

          {filteredReports.length === 0 ? (
            <div className="empty-state">
              <p style={{ fontSize: '2rem', marginBottom: '.5rem' }}>🚨</p>
              <p>{reportFilter === 'all' ? 'Henüz şikayet yok' : 'Bu filtrede şikayet yok'}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredReports.map((r) => {
                const reporter = r.reportedBy || {};
                const statusClass = r.status === 'reviewed' ? 'status-active' : r.status === 'dismissed' ? 'status-rejected' : 'status-pending';
                const statusLabel = r.status === 'reviewed' ? '✅ İncelendi' : r.status === 'dismissed' ? '❌ Reddedildi' : '⏳ Bekliyor';
                const contentPath = r.contentType === 'user' ? `/profile/${r.contentId}` : `${CONTENT_TYPE_PATH[r.contentType]}/${r.contentId}`;
                const isPending = r.status === 'pending';
                const isUpdating = reportUpdating === r._id;
                return (
                  <div key={r._id} className="card" style={{ borderLeft: `4px solid ${r.status === 'pending' ? 'var(--coral)' : r.status === 'reviewed' ? 'var(--teal)' : 'var(--border)'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.75rem', flexWrap: 'wrap', gap: '.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                        <div className="avatar av-violet" style={{ width: '2rem', height: '2rem', fontSize: '.75rem', flexShrink: 0 }}>
                          {reporter.firstName ? `${reporter.firstName[0]}${reporter.lastName?.[0] || ''}` : '?'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '.9rem' }}>{reporter.firstName} {reporter.lastName}</div>
                          <div style={{ color: 'var(--muted)', fontSize: '.78rem' }}>{reporter.email}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                        <span className={`status-badge ${statusClass}`}>{statusLabel}</span>
                        <span style={{ color: 'var(--muted)', fontSize: '.78rem' }}>
                          {new Date(r.createdAt).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.75rem', padding: '.6rem .75rem', background: 'var(--bg)', borderRadius: '.5rem', border: '1px solid var(--border)' }}>
                      <span className={`chip ${CONTENT_TYPE_CHIP[r.contentType] || 'chip-slate'}`} style={{ fontSize: '.7rem', flexShrink: 0 }}>{CONTENT_TYPE_LABEL[r.contentType] || r.contentType}</span>
                      {r.contentTitle ? (
                        <Link to={contentPath} style={{ fontWeight: 600, color: 'var(--accent)', textDecoration: 'none', fontSize: '.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} target="_blank">{r.contentTitle} ↗</Link>
                      ) : (
                        <span style={{ color: 'var(--muted)', fontSize: '.85rem', fontStyle: 'italic' }}>İçerik bulunamadı (silinmiş olabilir)</span>
                      )}
                      {r.contentOwner && <span style={{ color: 'var(--muted)', fontSize: '.78rem', marginLeft: 'auto', flexShrink: 0 }}>Sahibi: {r.contentOwner}</span>}
                    </div>
                    <div style={{ marginBottom: '.75rem' }}>
                      <div style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: '.3rem' }}>Şikayet Sebebi</div>
                      <p style={{ color: 'var(--ink)', fontSize: '.9rem', lineHeight: 1.55, margin: 0 }}>{r.reason}</p>
                    </div>
                    {r.adminNote && !isPending && (
                      <div style={{ marginBottom: '.75rem', padding: '.5rem .75rem', background: 'rgba(99,102,241,.06)', borderRadius: '.4rem', border: '1px solid rgba(99,102,241,.15)' }}>
                        <div style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--accent)', marginBottom: '.2rem' }}>Admin Notu</div>
                        <p style={{ color: 'var(--ink)', fontSize: '.85rem', margin: 0 }}>{r.adminNote}</p>
                      </div>
                    )}
                    {isPending && (
                      <div style={{ display: 'flex', gap: '.75rem', alignItems: 'flex-end', flexWrap: 'wrap', paddingTop: '.75rem', borderTop: '1px solid var(--border)', marginTop: '.25rem' }}>
                        <div style={{ flex: 1, minWidth: 200 }}>
                          <div style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '.3rem' }}>Admin Notu (opsiyonel)</div>
                          <input className="form-control" style={{ fontSize: '.85rem', padding: '.4rem .6rem' }} placeholder="İşlem notunuzu yazın…" value={reportNotes[r._id] || ''} onChange={(e) => setReportNotes((prev) => ({ ...prev, [r._id]: e.target.value }))} />
                        </div>
                        <div style={{ display: 'flex', gap: '.5rem', flexShrink: 0 }}>
                          <button type="button" className="btn btn-sm" style={{ background: 'var(--teal)', color: '#fff' }} disabled={isUpdating} onClick={() => handleReportStatus(r._id, 'reviewed')}>{isUpdating ? '…' : '✓ İncelendi'}</button>
                          <button type="button" className="btn btn-sm btn-secondary" style={{ color: 'var(--coral)' }} disabled={isUpdating} onClick={() => handleReportStatus(r._id, 'dismissed')}>{isUpdating ? '…' : '✕ Reddet'}</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      ) : tab === 'announce' ? (
        /* ── Duyurular ── */
        <div style={{ maxWidth: 640 }}>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: '.35rem' }}>📢 Tüm Kullanıcılara Duyuru Gönder</h3>
            <p style={{ color: 'var(--muted)', fontSize: '.875rem', marginBottom: '1.25rem' }}>
              Gönderilen duyuru, aktif tüm kullanıcıların bildirim kutusunda görünür.
            </p>
            <form onSubmit={sendAnnounce}>
              <div className="form-group">
                <label className="form-label">Duyuru Başlığı *</label>
                <input className="form-control" placeholder="örn. Yeni özellik: AI proje önerileri!" value={announceTitle} onChange={(e) => setAnnounceTitle(e.target.value)} maxLength={100} />
                <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: '.25rem', textAlign: 'right' }}>{announceTitle.length}/100</div>
              </div>
              <div className="form-group">
                <label className="form-label">Mesaj *</label>
                <textarea className="form-control" rows={4} placeholder="Kullanıcılara iletmek istediğiniz mesajı yazın…" value={announceBody} onChange={(e) => setAnnounceBody(e.target.value)} maxLength={500} />
                <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: '.25rem', textAlign: 'right' }}>{announceBody.length}/500</div>
              </div>
              {announceResult && (
                <div style={{ padding: '.75rem 1rem', borderRadius: '.5rem', marginBottom: '1rem', background: announceResult.startsWith('Hata') ? '#fff1f2' : '#f0fdf4', border: `1px solid ${announceResult.startsWith('Hata') ? '#fecdd3' : '#bbf7d0'}`, color: announceResult.startsWith('Hata') ? 'var(--coral)' : 'var(--teal)', fontSize: '.875rem' }}>
                  {announceResult}
                </div>
              )}
              <button type="submit" className="btn btn-primary" disabled={announceLoading || !announceTitle || !announceBody}>
                {announceLoading ? 'Gönderiliyor…' : `📢 ${users.length} Kullanıcıya Gönder`}
              </button>
            </form>
          </div>

          <div className="card">
            <h4 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: '1rem', fontSize: '.95rem' }}>Son Gönderilen Duyurular</h4>
            {logs.filter((l) => l.action === 'announce').length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: '.875rem' }}>Henüz duyuru gönderilmedi.</p>
            ) : logs.filter((l) => l.action === 'announce').slice(0, 5).map((l) => (
              <div key={l._id} style={{ paddingBottom: '.75rem', marginBottom: '.75rem', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, fontSize: '.9rem', marginBottom: '.2rem' }}>{l.details?.title}</div>
                <div style={{ color: 'var(--muted)', fontSize: '.78rem' }}>
                  {l.details?.userCount} kullanıcıya gönderildi · {new Date(l.createdAt).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>

      ) : tab === 'services' ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead><tr><th>Hizmet</th><th>Satıcı</th><th>Kategori</th><th>Fiyat</th><th>Satış</th><th>İşlem</th></tr></thead>
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
                    <td><button type="button" className="btn btn-sm btn-secondary" style={{ color: 'var(--coral)' }} onClick={() => removeService(s._id)}>Kaldır</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      ) : tab === 'projects' ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead><tr><th>Proje</th><th>Sahibi</th><th>Kategori</th><th>Durum</th><th>İşlem</th></tr></thead>
            <tbody>
              {projects.map((p) => {
                const owner = p.owner || {};
                return (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 600 }}>{p.title}</td>
                    <td style={{ color: 'var(--muted)' }}>{owner.firstName} {owner.lastName}</td>
                    <td>{p.category}</td>
                    <td><span className="chip chip-slate">{p.status}</span></td>
                    <td><button type="button" className="btn btn-sm btn-secondary" style={{ color: 'var(--coral)' }} onClick={() => removeProject(p._id)}>Sil</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      ) : tab === 'needs' ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead><tr><th>İhtiyaç</th><th>Oluşturan</th><th>Kategori</th><th>Bütçe</th><th>Durum</th><th>İşlem</th></tr></thead>
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
                    <td><button type="button" className="btn btn-sm btn-secondary" style={{ color: 'var(--coral)' }} onClick={() => removeNeed(n._id)}>Sil</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      ) : (
        /* ── İşlem Geçmişi ── */
        <div>
          {logs.length === 0 ? (
            <div className="empty-state"><p>Henüz işlem kaydı yok</p></div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="table">
                <thead><tr><th>Admin</th><th>İşlem</th><th>Hedef</th><th>Detay</th><th>Tarih</th></tr></thead>
                <tbody>
                  {logs.map((log) => {
                    const admin = log.admin || {};
                    return (
                      <tr key={log._id}>
                        <td style={{ fontWeight: 600 }}>{admin.firstName} {admin.lastName}</td>
                        <td><span className="chip chip-slate" style={{ fontSize: '.75rem' }}>{actionLabels[log.action] || log.action}</span></td>
                        <td style={{ color: 'var(--muted)', fontSize: '.85rem' }}>{log.targetType}</td>
                        <td style={{ color: 'var(--muted)', fontSize: '.85rem', maxWidth: 200 }}>{log.details?.title || log.details?.email || log.details?.reason || '—'}</td>
                        <td style={{ color: 'var(--muted)', fontSize: '.85rem', whiteSpace: 'nowrap' }}>
                          {new Date(log.createdAt).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Onay red modal ── */}
      {rejectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card" style={{ maxWidth: 480, width: '100%' }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: '.5rem' }}>İlanı Reddet</h3>
            <p style={{ color: 'var(--muted)', fontSize: '.9rem', marginBottom: '1rem' }}><strong>"{rejectModal.title}"</strong> ilanı reddedilecek.</p>
            <textarea className="form-input" rows={3} placeholder="Red sebebi (opsiyonel)" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} style={{ marginBottom: '1rem', resize: 'vertical', width: '100%' }} />
            <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => { setRejectModal(null); setRejectReason(''); }}>Vazgeç</button>
              <button className="btn" style={{ background: 'var(--coral)', color: '#fff' }} onClick={handleReject}>Reddet</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Kullanıcı detay modal ── */}
      {(userDetailLoading || userDetail) && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setUserDetail(null)}>
          <div className="card" style={{ maxWidth: 620, width: '100%', maxHeight: '85vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            {userDetailLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>Yükleniyor…</div>
            ) : (
              <>
                {/* Kullanıcı başlık */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div className="avatar av-violet" style={{ width: '3.5rem', height: '3.5rem', fontSize: '1.1rem', flexShrink: 0 }}>
                    {userDetail.user.avatar ? <img src={userDetail.user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : `${userDetail.user.firstName?.[0] || ''}${userDetail.user.lastName?.[0] || ''}`}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.1rem' }}>{userDetail.user.firstName} {userDetail.user.lastName}</div>
                    <div style={{ color: 'var(--muted)', fontSize: '.85rem' }}>{userDetail.user.email}</div>
                    <div style={{ display: 'flex', gap: '.5rem', marginTop: '.4rem' }}>
                      <span className={`chip ${userDetail.user.role === 'admin' ? 'chip-violet' : 'chip-slate'}`}>{userDetail.user.role}</span>
                      <span className={`status-badge ${userDetail.user.isBanned ? 'status-rejected' : 'status-active'}`}>{userDetail.user.isBanned ? 'Askıda' : 'Aktif'}</span>
                      <span style={{ color: 'var(--muted)', fontSize: '.78rem' }}>Kayıt: {new Date(userDetail.user.createdAt).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>
                  {userDetail.user.role !== 'admin' && (
                    <button className="btn btn-sm btn-secondary" style={{ color: userDetail.user.isBanned ? 'var(--teal)' : 'var(--coral)', flexShrink: 0 }} onClick={() => toggleBan(userDetail.user)}>
                      {userDetail.user.isBanned ? 'Aktif Et' : 'Askıya Al'}
                    </button>
                  )}
                </div>

                {/* İlan özeti */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '.75rem', marginBottom: '1.25rem' }}>
                  {[
                    { label: 'Hizmet', count: userDetail.services.length, color: 'var(--accent)' },
                    { label: 'Proje', count: userDetail.projects.length, color: 'var(--accent2)' },
                    { label: 'İhtiyaç', count: userDetail.needs.length, color: 'var(--amber)' },
                  ].map((s) => (
                    <div key={s.label} style={{ textAlign: 'center', padding: '.75rem', background: 'var(--bg)', borderRadius: '.5rem', border: '1px solid var(--border)' }}>
                      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: s.color }}>{s.count}</div>
                      <div style={{ color: 'var(--muted)', fontSize: '.8rem' }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Son ilanlar */}
                {[
                  { label: 'Son Hizmetler', items: userDetail.services, chip: 'chip-teal' },
                  { label: 'Son Projeler', items: userDetail.projects, chip: 'chip-indigo' },
                  { label: 'Son İhtiyaçlar', items: userDetail.needs, chip: 'chip-amber' },
                ].map(({ label, items, chip }) => items.length > 0 && (
                  <div key={label} style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: '.5rem' }}>{label}</div>
                    {items.slice(0, 3).map((item) => (
                      <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.4rem 0', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{item.title}</span>
                        <span className={`chip ${chip} ${item.isApproved ? '' : 'chip-coral'}`} style={{ fontSize: '.65rem', marginLeft: '.5rem', flexShrink: 0 }}>{item.isApproved ? 'Onaylı' : 'Bekliyor'}</span>
                      </div>
                    ))}
                  </div>
                ))}

                {/* Admin geçmişi */}
                {userDetail.logs.length > 0 && (
                  <div>
                    <div style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: '.5rem' }}>Admin İşlem Geçmişi</div>
                    {userDetail.logs.map((l) => (
                      <div key={l._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '.8rem', padding: '.35rem 0', borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                        <span>{actionLabels[l.action] || l.action}</span>
                        <span>{new Date(l.createdAt).toLocaleDateString('tr-TR')}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ marginTop: '1.25rem', textAlign: 'right' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setUserDetail(null)}>Kapat</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
