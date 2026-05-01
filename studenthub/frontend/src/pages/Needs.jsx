import { useState, useEffect } from 'react';
import { needsAPI } from '../api/client.js';
import NeedCard from '../components/cards/NeedCard.jsx';
import FilterSidebar from '../components/forms/FilterSidebar.jsx';

const CATEGORIES = ['Tasarım', 'Yazılım', 'Akademik', 'Çeviri', 'Fotoğraf', 'Video', 'Müzik', 'Diğer'];

export default function Needs() {
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [q, setQ] = useState('');

  useEffect(() => {
    setLoading(true);
    needsAPI.list({ category: category || undefined, q: q || undefined })
      .then((r) => setNeeds(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category, q]);

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div className="page-header" style={{ textAlign: 'left', paddingTop: '1rem' }}>
        <h1>İhtiyaç İlanları</h1>
        <p style={{ color: 'var(--muted)' }}>Ters pazar: ilanları gör, teklifini ver</p>
      </div>

      {/* Mobil arama — sidebar gizlenince görünür */}
      <div className="mobile-search-bar">
        <div className="search-bar">
          <span>🔍</span>
          <input type="text" placeholder="İhtiyaç ara..." onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      <div className="layout-with-sidebar">
        <FilterSidebar categories={CATEGORIES} selected={category} onSelect={setCategory} onSearch={setQ} searchPlaceholder="İhtiyaç ara..." />

        <main>
          {loading ? (
            <div className="empty-state"><p>Yükleniyor…</p></div>
          ) : needs.length === 0 ? (
            <div className="empty-state">
              <div className="icon">📢</div>
              <h3>İhtiyaç ilanı bulunamadı</h3>
              <p>Farklı filtreler deneyin</p>
            </div>
          ) : (
            <div className="grid-3">
              {needs.map((n) => <NeedCard key={n._id} need={n} />)}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
