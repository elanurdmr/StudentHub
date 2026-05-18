import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { favoritesAPI } from '../../api/client.js';
import useAuthStore from '../../store/authStore.js';
import useFavoritesStore from '../../store/favoritesStore.js';

export default function ProjectCard({ project }) {
  const owner = project.owner || {};
  const initials = owner.firstName ? `${owner.firstName[0]}${owner.lastName?.[0] || ''}`.toUpperCase() : '?';

  const statusLabel = { recruiting: 'Ekip Arıyor', active: 'Aktif', completed: 'Tamamlandı' };
  const statusChip = { recruiting: 'chip-lime', active: 'chip-teal', completed: 'chip-slate' };

  const { token } = useAuthStore();
  const { ids, load, toggle } = useFavoritesStore();
  const favorited = ids.has(String(project._id));

  useEffect(() => { if (token) load(); }, [token]);

  async function toggleFav(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!token) return;
    const { data } = await favoritesAPI.toggle('project', project._id);
    toggle(project._id, data.favorited);
  }

  return (
    <Link to={`/detail/project/${project._id}`} style={{ textDecoration: 'none' }}>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: '.35rem', flexWrap: 'wrap' }}>
            <span className={`chip ${statusChip[project.status] || 'chip-slate'}`}>
              {statusLabel[project.status] || project.status}
            </span>
            {project.applicationDeadline && (() => {
              const days = Math.ceil((new Date(project.applicationDeadline) - new Date()) / 86400000);
              if (days < 0) return <span className="chip chip-slate">Süre Doldu</span>;
              if (days <= 3) return <span className="chip chip-coral">Son {days} gün!</span>;
              if (days <= 7) return <span className="chip chip-amber">Son {days} gün</span>;
              return null;
            })()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.25rem' }}>
            <button
              onClick={toggleFav}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '1.1rem', color: favorited ? 'var(--coral)' : '#cbd5e1',
                padding: '0 .25rem', lineHeight: 1,
                display: token ? 'inline' : 'none',
              }}
              title={favorited ? 'Favoriden çıkar' : 'Favoriye ekle'}
            >
              {favorited ? '♥' : '♡'}
            </button>
            <span className="chip chip-indigo">{project.category}</span>
          </div>
        </div>
        <h3 style={{ fontSize: '1rem', fontFamily: 'Syne, sans-serif', color: 'var(--ink)' }}>{project.title}</h3>
        <p style={{ fontSize: '.85rem', color: 'var(--muted)', flexGrow: 1 }}>
          {project.description?.substring(0, 100)}{project.description?.length > 100 ? '...' : ''}
        </p>
        {project.requiredSkills?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.35rem' }}>
            {project.requiredSkills.slice(0, 4).map((s) => (
              <span key={s} className="chip chip-violet" style={{ fontSize: '.7rem' }}>{s}</span>
            ))}
          </div>
        )}
        {project.aiReason && (
          <div style={{
            padding: '.5rem .65rem',
            borderRadius: '.5rem',
            background: 'linear-gradient(135deg, rgba(79,70,229,.08), rgba(236,254,236,.65))',
            border: '1px solid rgba(79,70,229,.18)',
          }}>
            <div style={{ fontSize: '.7rem', color: 'var(--accent)', fontWeight: 700, marginBottom: '.2rem', textTransform: 'uppercase', letterSpacing: '.03em' }}>
              AI Önerisi{project.aiMatchScore > 0 ? ` · %${project.aiMatchScore}` : ''}
            </div>
            <p style={{ fontSize: '.8rem', color: 'var(--ink)', margin: 0, lineHeight: 1.4 }}>{project.aiReason}</p>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginTop: 'auto' }}>
          <div className="avatar av-violet" style={{ width: '1.75rem', height: '1.75rem', fontSize: '.7rem' }}>
            {owner.avatar ? <img src={owner.avatar} alt="" /> : initials}
          </div>
          <span style={{ fontSize: '.8rem', color: 'var(--muted)' }}>{owner.firstName} {owner.lastName}</span>
          <span style={{ marginLeft: 'auto', fontSize: '.8rem', color: 'var(--muted)' }}>
            {project.applicationCount || 0} başvuru
          </span>
        </div>
      </div>
    </Link>
  );
}
