import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectsAPI } from '../api/client.js';

const STATUS_LABELS = { pending: 'Bekliyor', accepted: 'Kabul Edildi', rejected: 'Reddedildi' };
const STATUS_CLASS = { pending: 'status-pending', accepted: 'status-active', rejected: 'status-rejected' };

export default function Applications() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      projectsAPI.get(projectId),
      projectsAPI.applications(projectId),
    ]).then(([p, a]) => {
      setProject(p.data);
      setApps(a.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [projectId]);

  async function updateStatus(appId, status) {
    try {
      const { data } = await projectsAPI.updateApplication(projectId, appId, status);
      setApps((a) => a.map((x) => x._id === appId ? { ...x, status: data.status } : x));
    } catch (err) {
      alert(err.response?.data?.error || 'Hata');
    }
  }

  if (loading) return <div className="empty-state" style={{ marginTop: '4rem' }}><p>Yükleniyor…</p></div>;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link to={`/detail/project/${projectId}`} style={{ color: 'var(--muted)', fontSize: '.875rem' }}>← Projeye dön</Link>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.75rem', marginTop: '.5rem' }}>
          Başvurular — {project?.title}
        </h1>
        <p style={{ color: 'var(--muted)', marginTop: '.25rem' }}>{apps.length} başvuru alındı</p>
      </div>

      {apps.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📋</div>
          <h3>Henüz başvuru yok</h3>
          <p>Proje ilanınıza başvurular burada görünecek</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {apps.map((app) => {
            const a = app.applicant || {};
            const initials = a.firstName ? `${a.firstName[0]}${a.lastName?.[0] || ''}`.toUpperCase() : '?';
            return (
              <div key={app._id} className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center' }}>
                    <div className="avatar av-violet">{a.avatar ? <img src={a.avatar} alt="" /> : initials}</div>
                    <div>
                      <Link to={`/profile/${a._id}`} style={{ fontWeight: 700, color: 'var(--ink)' }}>{a.firstName} {a.lastName}</Link>
                      {a.rating > 0 && <div style={{ fontSize: '.8rem', color: 'var(--amber)' }}>★ {a.rating}</div>}
                    </div>
                  </div>
                  <span className={`status-badge ${STATUS_CLASS[app.status]}`}>{STATUS_LABELS[app.status]}</span>
                </div>

                {a.skills?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.35rem', marginBottom: '.75rem' }}>
                    {a.skills.slice(0, 5).map((s) => <span key={s} className="chip chip-indigo" style={{ fontSize: '.7rem' }}>{s}</span>)}
                  </div>
                )}

                {app.coverLetter && (
                  <p style={{ fontSize: '.875rem', color: 'var(--muted)', marginBottom: '1rem', lineHeight: 1.6, background: 'var(--card)', padding: '.75rem', borderRadius: '.5rem', border: '1px solid var(--border)' }}>
                    {app.coverLetter}
                  </p>
                )}

                {app.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '.5rem' }}>
                    <button className="btn btn-teal btn-sm" onClick={() => updateStatus(app._id, 'accepted')}>Kabul Et</button>
                    <button className="btn btn-secondary btn-sm" style={{ color: 'var(--coral)' }} onClick={() => updateStatus(app._id, 'rejected')}>Reddet</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
