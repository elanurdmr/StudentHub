import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI, servicesAPI } from '../api/client.js';
import useAuthStore from '../store/authStore.js';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [summary, setSummary] = useState(null);
  const [progress, setProgress] = useState([]);
  const [myServices, setMyServices] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    dashboardAPI.summary().then((r) => setSummary(r.data)).catch(() => {});
    dashboardAPI.progress().then((r) => setProgress(r.data)).catch(() => {});
    servicesAPI.mine().then((r) => setMyServices(r.data)).catch(() => {});
    dashboardAPI.stats().then((r) => setStats(r.data)).catch(() => {});
  }, []);

  const kpis = [
    { label: 'Aktif Hizmetlerim', value: summary?.services ?? '—', color: 'var(--accent)', link: '/market' },
    { label: 'Projelerim', value: summary?.projects ?? '—', color: 'var(--accent2)', link: '/projects' },
    { label: 'Başvurularım', value: summary?.applications ?? '—', color: 'var(--teal)', link: '/projects' },
    { label: 'Okunmamış Bildirim', value: summary?.unreadNotifs ?? '—', color: 'var(--coral)', link: '/notifications' },
  ];

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.75rem' }}>
          Hoş geldin, {user?.firstName} 👋
        </h1>
        <p style={{ color: 'var(--muted)', marginTop: '.35rem' }}>Hesap özetini ve aktiviteni buradan takip edebilirsin</p>
      </div>

      {/* KPI cards */}
      <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
        {kpis.map((k) => (
          <Link to={k.link} key={k.label} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '2.25rem', color: k.color }}>{k.value}</div>
              <div style={{ color: 'var(--muted)', fontSize: '.85rem', marginTop: '.25rem' }}>{k.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {stats && (
        <>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.2rem', marginBottom: '1rem' }}>
            Kazanç ve harcama
          </h2>
          <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
            <div className="card">
              <div style={{ color: 'var(--muted)', fontSize: '.8rem', marginBottom: '.35rem' }}>Satıcı kazancı</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.85rem', color: 'var(--teal)' }}>
                ₺{stats.earnings?.total ?? 0}
              </div>
              <div style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: '.35rem' }}>
                {stats.earnings?.orderCount ?? 0} tamamlanan satış siparişi
              </div>
            </div>
            <div className="card">
              <div style={{ color: 'var(--muted)', fontSize: '.8rem', marginBottom: '.35rem' }}>Alışveriş toplamı</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.85rem', color: 'var(--coral)' }}>
                ₺{stats.spending?.total ?? 0}
              </div>
              <div style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: '.35rem' }}>
                {stats.spending?.orderCount ?? 0} satın alma
              </div>
            </div>
            <div className="card">
              <div style={{ color: 'var(--muted)', fontSize: '.8rem', marginBottom: '.35rem' }}>Tamamlanan projeler</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.85rem', color: 'var(--accent)' }}>
                {stats.completedProjectsOwned ?? 0}
              </div>
              <div style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: '.35rem' }}>
                Listeleyen olarak tamamlanan
              </div>
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: '2.5rem' }}>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                <h3 style={{ fontFamily: 'Syne, sans-serif' }}>Son satın almalarım</h3>
                <Link to="/market" className="btn btn-secondary btn-sm">Pazar</Link>
              </div>
              {!stats.recentPurchases?.length ? (
                <p style={{ fontSize: '.875rem', color: 'var(--muted)' }}>Henüz satın alma kaydı yok.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
                  {stats.recentPurchases.map((row) => {
                    const s = row.service || {};
                    const sel = row.seller || {};
                    return (
                      <Link
                        key={row._id}
                        to={`/detail/service/${s._id || ''}`}
                        style={{ display: 'flex', justifyContent: 'space-between', gap: '.75rem', padding: '.65rem .75rem', background: 'var(--card)', borderRadius: '.5rem', border: '1px solid var(--border)', textDecoration: 'none', color: 'inherit' }}
                      >
                        <span style={{ fontWeight: 600, fontSize: '.88rem', flex: 1 }}>{s.title || 'Hizmet'}</span>
                        <span style={{ fontSize: '.75rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{sel.firstName} {sel.lastName}</span>
                        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--accent)' }}>₺{row.amount}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="card">
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontFamily: 'Syne, sans-serif' }}>Tamamlanan işler (kabullü başvurular)</h3>
              </div>
              {!stats.acceptedApplications?.length ? (
                <p style={{ fontSize: '.875rem', color: 'var(--muted)' }}>Henüz kabul edilmiş başvurunuz görünmüyor.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
                  {stats.acceptedApplications.map((app) => {
                    const pj = app.project || {};
                    return (
                      <Link
                        key={app._id}
                        to={`/detail/project/${pj._id}`}
                        style={{ padding: '.65rem .75rem', background: 'var(--card)', borderRadius: '.5rem', border: '1px solid var(--border)', textDecoration: 'none', color: 'inherit' }}
                      >
                        <span style={{ fontWeight: 600, fontSize: '.88rem' }}>{pj.title}</span>
                        <span style={{ fontSize: '.75rem', color: 'var(--muted)', marginLeft: '.75rem' }}>{pj.category}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <div className="grid-2">
        {/* My Services */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif' }}>Hizmetlerim</h3>
            <Link to="/create" className="btn btn-primary btn-sm">+ Yeni</Link>
          </div>
          {myServices.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div className="icon">🛍</div>
              <p>Henüz hizmet oluşturmadınız</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
              {myServices.slice(0, 4).map((s) => (
                <Link to={`/detail/service/${s._id}`} key={s._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.75rem', background: 'var(--card)', borderRadius: '.5rem', textDecoration: 'none', color: 'inherit' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '.9rem' }}>{s.title}</div>
                    <div style={{ fontSize: '.8rem', color: 'var(--muted)' }}>{s.purchaseCount} satış</div>
                  </div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--accent)' }}>₺{s.price}</div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Project progress */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif' }}>Projelerim</h3>
            <Link to="/create" className="btn btn-secondary btn-sm">+ Yeni</Link>
          </div>
          {progress.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div className="icon">🤝</div>
              <p>Henüz proje oluşturmadınız</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {progress.slice(0, 4).map((p) => {
                const pct = Math.min(100, Math.round((p.applicationCount / (p.teamSize || 3)) * 100));
                return (
                  <div key={p._id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.875rem', marginBottom: '.4rem' }}>
                      <span style={{ fontWeight: 600 }}>{p.title}</span>
                      <Link to={`/applications/${p._id}`} style={{ color: 'var(--accent)', fontSize: '.8rem' }}>Başvurular →</Link>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: '.25rem' }}>
                      {p.applicationCount} / {p.teamSize} üye
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
