import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { favoritesAPI, servicesAPI, projectsAPI, needsAPI } from '../api/client.js';

const TYPE_LABEL = { service: 'Hizmet', project: 'Proje', need: 'İhtiyaç' };
const TYPE_CHIP = { service: 'chip-indigo', project: 'chip-lime', need: 'chip-coral' };
const TYPE_PATH = { service: 'service', project: 'project', need: 'need' };

export default function Favorites() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    favoritesAPI.list()
      .then((r) => setItems(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function removeFav(fav) {
    await favoritesAPI.toggle(fav.contentType, fav.contentId);
    setItems((prev) => prev.filter((f) => f._id !== fav._id));
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: 720 }}>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.75rem', marginBottom: '2rem' }}>
        ♥ Favorilerim
      </h1>

      {loading ? (
        <div className="empty-state"><p>Yükleniyor…</p></div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <div className="icon">♡</div>
          <h3>Henüz favori yok</h3>
          <p>Hizmet, proje veya ihtiyaç kartlarındaki kalp ikonuna tıklayarak favorine ekleyebilirsin.</p>
          <Link to="/market" className="btn btn-primary" style={{ marginTop: '1rem' }}>Hizmetlere Göz At</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          {items.map((fav) => (
            <div key={fav._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--card)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', minWidth: 0 }}>
                <span className={`chip ${TYPE_CHIP[fav.contentType]}`} style={{ flexShrink: 0 }}>{TYPE_LABEL[fav.contentType]}</span>
                <Link to={`/detail/${TYPE_PATH[fav.contentType]}/${fav.contentId}`} style={{ color: 'var(--ink)', fontWeight: 600, textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {fav.contentTitle || 'İçeriği Görüntüle'} →
                </Link>
              </div>
              <button
                onClick={() => removeFav(fav)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#f43f5e' }}
                title="Favoriden çıkar"
              >
                ♥
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
