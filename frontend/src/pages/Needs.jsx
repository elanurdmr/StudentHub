import { useState, useEffect } from 'react';
import { needsAPI } from '../api/client.js';
import NeedCard from '../components/cards/NeedCard.jsx';
import FilterSidebar from '../components/forms/FilterSidebar.jsx';

const CATEGORIES = ['Tasarım', 'Yazılım', 'Akademik', 'Çeviri', 'Fotoğraf', 'Video', 'Müzik', 'Araştırma', 'Sosyal Girişim', 'Mobil', 'Yapay Zeka', 'Diğer'];
const PAGE_SIZE = 20;

export default function Needs() {
  const [allNeeds, setAllNeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [q, setQ] = useState('');
  const [visible, setVisible] = useState(PAGE_SIZE);

  useEffect(() => {
    setLoading(true);
    setVisible(PAGE_SIZE);
    needsAPI.list({ category: category || undefined, q: q || undefined })
      .then((r) => setAllNeeds(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category, q]);

  const needs = allNeeds.slice(0, visible);
  const hasMore = visible < allNeeds.length;

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
        <FilterSidebar
          categories={CATEGORIES}
          selected={category}
          onSelect={setCategory}
          onSearch={setQ}
          searchPlaceholder="İhtiyaç ara..."
        />

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
            <>
              <div className="grid-3">
                {needs.map((n) => <NeedCard key={n._id} need={n} />)}
              </div>
              {hasMore && (
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  >
                    Daha Fazla Göster
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
