import { useState } from 'react';
import { Link } from 'react-router-dom';
import { favoritesAPI } from '../../api/client.js';
import useAuthStore from '../../store/authStore.js';

export default function NeedCard({ need }) {
  const owner = need.owner || {};
  const initials = owner.firstName ? `${owner.firstName[0]}${owner.lastName?.[0] || ''}`.toUpperCase() : '?';

  const deadline = need.deadline ? new Date(need.deadline).toLocaleDateString('tr-TR') : null;

  const { token } = useAuthStore();
  const [favorited, setFavorited] = useState(false);

  async function toggleFav(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!token) return;
    const { data } = await favoritesAPI.toggle('need', need._id);
    setFavorited(data.favorited);
  }

  return (
    <Link to={`/detail/need/${need._id}`} style={{ textDecoration: 'none' }}>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span className="chip chip-coral">{need.category}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.25rem' }}>
            <button
              onClick={toggleFav}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '1.1rem', color: favorited ? '#f43f5e' : '#cbd5e1',
                padding: '0 .25rem', lineHeight: 1,
                display: token ? 'inline' : 'none',
              }}
              title={favorited ? 'Favoriden çıkar' : 'Favoriye ekle'}
            >
              {favorited ? '♥' : '♡'}
            </button>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.05rem', color: 'var(--teal)' }}>
              ₺{need.budget}
            </span>
          </div>
        </div>
        <h3 style={{ fontSize: '1rem', fontFamily: 'Syne, sans-serif', color: 'var(--ink)' }}>{need.title}</h3>
        <p style={{ fontSize: '.85rem', color: 'var(--muted)', flexGrow: 1 }}>
          {need.description?.substring(0, 100)}{need.description?.length > 100 ? '...' : ''}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginTop: 'auto' }}>
          <div className="avatar av-coral" style={{ width: '1.75rem', height: '1.75rem', fontSize: '.7rem' }}>
            {owner.avatar ? <img src={owner.avatar} alt="" /> : initials}
          </div>
          <span style={{ fontSize: '.8rem', color: 'var(--muted)' }}>{owner.firstName} {owner.lastName}</span>
          {deadline && (
            <span style={{ marginLeft: 'auto', fontSize: '.75rem', color: 'var(--muted)' }}>
              Son: {deadline}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
