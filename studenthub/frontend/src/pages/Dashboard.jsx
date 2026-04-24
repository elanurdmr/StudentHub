import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI, servicesAPI, projectsAPI } from '../api/client.js';
import useAuthStore from '../store/authStore.js';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [summary, setSummary] = useState(null);
  const [progress, setProgress] = useState([]);
  const [myServices, setMyServices] = useState([]);

  useEffect(() => {
    dashboardAPI.summary().then((r) => setSummary(r.data)).catch(() => {});
    dashboardAPI.progress().then((r) => setProgress(r.data)).catch(() => {});
    servicesAPI.mine().then((r) => setMyServices(r.data)).catch(() => {});
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
