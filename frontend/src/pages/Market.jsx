import { useState, useEffect } from 'react';
import { servicesAPI } from '../api/client.js';
import ServiceCard from '../components/cards/ServiceCard.jsx';
import FilterSidebar from '../components/forms/FilterSidebar.jsx';

const CATEGORIES = ['Tasarım', 'Yazılım', 'Akademik', 'Çeviri', 'Fotoğraf', 'Video', 'Müzik', 'Araştırma', 'Sosyal Girişim', 'Oyun', 'Mobil', 'Yapay Zeka', 'Diğer'];

const PAGE_SIZE = 20;

export default function Market() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [category, setCategory] = useState('');
  const [q, setQ] = useState('');
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  function buildParams(p) {
    return {
      category: category || undefined,
      q: q || undefined,
      sort: filters.sort || undefined,
      minPrice: filters.minPrice || undefined,
      maxPrice: filters.maxPrice || undefined,
      minRating: filters.minRating || undefined,
      maxDeliveryDays: filters.maxDeliveryDays || undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      skills: filters.skills || undefined,
      page: p,
      limit: PAGE_SIZE,
    };
  }

  useEffect(() => {
    setLoading(true);
    setPage(1);
    servicesAPI.list(buildParams(1))
      .then((r) => {
        const data = r.data?.data || r.data || [];
        const total = r.data?.pagination?.total ?? data.length;
        setServices(data);
        setHasMore(data.length < total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category, q, filters]);

  async function loadMore() {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const r = await servicesAPI.list(buildParams(nextPage));
      const data = r.data?.data || r.data || [];
      const total = r.data?.pagination?.total ?? 0;
      setServices((prev) => {
        const merged = [...prev, ...data];
        setHasMore(merged.length < total);
        return merged;
      });
      setPage(nextPage);
    } catch { /* skip */ } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div className="page-header" style={{ textAlign: 'left', paddingTop: '1rem' }}>
        <h1>Hizmet Pazarı</h1>
        <p style={{ color: 'var(--muted)' }}>Öğrenci hizmetlerini keşfet, satın al veya kendi hizmetini sun</p>
      </div>

      {/* Mobil arama — sidebar gizlenince görünür */}
      <div className="mobile-search-bar">
        <div className="search-bar">
          <span>🔍</span>
          <input type="text" placeholder="Hizmet ara..." onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      <div className="layout-with-sidebar">
        <FilterSidebar
          categories={CATEGORIES} selected={category} onSelect={setCategory}
          onSearch={setQ} searchPlaceholder="Hizmet ara..."
          filters={filters} onFiltersChange={setFilters}
          showRating showDelivery showDateRange showSkills showSort
          sortOptions={[
            { value: 'price_asc', label: 'Fiyat: Artan' },
            { value: 'price_desc', label: 'Fiyat: Azalan' },
            { value: 'rating', label: 'En Yüksek Puan' },
            { value: 'popular', label: 'En Popüler' },
            { value: 'newest', label: 'En Yeni' },
          ]}
        />

        <main>
          {loading ? (
            <div className="empty-state"><p>Yükleniyor…</p></div>
          ) : services.length === 0 ? (
            <div className="empty-state">
              <div className="icon">🛍</div>
              <h3>Hizmet bulunamadı</h3>
              <p>Farklı filtreler deneyin</p>
            </div>
          ) : (
            <>
              <div className="grid-3">
                {services.map((s) => <ServiceCard key={s._id} service={s} />)}
              </div>
              {hasMore && (
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={loadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? 'Yükleniyor…' : 'Daha Fazla Göster'}
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
