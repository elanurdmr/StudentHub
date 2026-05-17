import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectsAPI } from '../api/client.js';

const STATUS_LABEL = { pending: 'Beklemede', accepted: 'Kabul Edildi', rejected: 'Reddedildi' };
const STATUS_CLASS = { pending: 'status-pending', accepted: 'status-active', rejected: 'status-rejected' };

export default function MyApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectsAPI.myApplications()
      .then((r) => setApps(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div className="page-header" style={{ textAlign: 'left', paddingTop: '1rem' }}>
        <h1>Başvurularım</h1>
        <p style={{ color: 'var(--muted)' }}>Proje başvurularının durumunu buradan takip edebilirsin</p>
      </div>

      {loading ? (
        <div className="empty-state"><p>Yükleniyor…</p></div>
      ) : apps.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📋</div>
          <h3>Henüz başvuru yapmadın</h3>
          <p>Projelere başvurarak ekiplere katıl</p>
          <Link to="/projects" className="btn btn-primary" style={{ marginTop: '1rem' }}>Projelere Göz At</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {apps.map((app) => (
            <div key={app._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.5rem' }}>
                  <span className={`status-badge ${STATUS_CLASS[app.status]}`}>
                    {app.status === 'pending' && '⏳'}
                    {app.status === 'accepted' && '✅'}
                    {app.status === 'rejected' && '❌'}
                    {' '}{STATUS_LABEL[app.status]}
                  </span>
                  <span className="chip chip-slate">{app.project?.category}</span>
                </div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.05rem', marginBottom: '.35rem' }}>
                  {app.project?.title ?? 'Proje silindi'}
                </h3>
                {app.coverLetter && (
                  <p style={{ color: 'var(--muted)', fontSize: '.875rem' }}>
                    "{app.coverLetter.slice(0, 120)}{app.coverLetter.length > 120 ? '…' : ''}"
                  </p>
                )}
                <p style={{ color: 'var(--muted)', fontSize: '.78rem', marginTop: '.4rem' }}>
                  Başvuru tarihi: {new Date(app.createdAt).toLocaleDateString('tr-TR')}
                </p>
              </div>

              {app.project?._id && (
                <Link to={`/detail/project/${app.project._id}`} className="btn btn-secondary btn-sm">
                  Projeye Git →
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
