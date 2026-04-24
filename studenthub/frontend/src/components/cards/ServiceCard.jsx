import { Link } from 'react-router-dom';

const COLORS = ['av-indigo', 'av-violet', 'av-teal', 'av-coral', 'av-amber'];

export default function ServiceCard({ service }) {
  const owner = service.owner || {};
  const initials = owner.firstName ? `${owner.firstName[0]}${owner.lastName?.[0] || ''}`.toUpperCase() : '?';
  const colorClass = COLORS[(owner.firstName?.charCodeAt(0) || 0) % COLORS.length];

  return (
    <Link to={`/detail/service/${service._id}`} style={{ textDecoration: 'none' }}>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', height: '100%' }}>
        {service.image && (
          <img src={service.image} alt={service.title} style={{ borderRadius: '.5rem', height: 140, objectFit: 'cover', width: '100%' }} />
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span className="chip chip-indigo">{service.category}</span>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.05rem', color: 'var(--accent)' }}>
            ₺{service.price}
          </span>
        </div>
        <h3 style={{ fontSize: '1rem', fontFamily: 'Syne, sans-serif', color: 'var(--ink)' }}>{service.title}</h3>
        <p style={{ fontSize: '.85rem', color: 'var(--muted)', flexGrow: 1 }}>
          {service.description?.substring(0, 100)}{service.description?.length > 100 ? '...' : ''}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginTop: 'auto' }}>
          <div className={`avatar ${colorClass}`} style={{ width: '1.75rem', height: '1.75rem', fontSize: '.7rem' }}>
            {owner.avatar ? <img src={owner.avatar} alt="" /> : initials}
          </div>
          <span style={{ fontSize: '.8rem', color: 'var(--muted)' }}>
            {owner.firstName} {owner.lastName}
          </span>
          {service.rating > 0 && (
            <span style={{ marginLeft: 'auto', fontSize: '.8rem', color: 'var(--amber)' }}>
              ★ {service.rating}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
