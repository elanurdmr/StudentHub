import { useState, useEffect } from 'react';
import { servicesAPI } from '../api/client.js';
import ServiceCard from '../components/cards/ServiceCard.jsx';
import FilterSidebar from '../components/forms/FilterSidebar.jsx';

const CATEGORIES = ['Tasarım', 'Yazılım', 'Akademik', 'Çeviri', 'Fotoğraf', 'Video', 'Müzik', 'Diğer'];

export default function Market() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    setLoading(true);
    servicesAPI.list({
      category: category || undefined,
      q: q || undefined,
      sort: sort || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
    })
      .then((r) => setServices(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category, q, sort, minPrice, maxPrice]);

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

      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          className="form-control"
          type="number"
          min="0"
          placeholder="Min ₺"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          style={{ width: '90px' }}
        />
        <input
          className="form-control"
          type="number"
          min="0"
          placeholder="Max ₺"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          style={{ width: '90px' }}
        />
        <select className="form-control" style={{ width: 'auto' }} value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="">Sırala: Yeni</option>
          <option value="price_asc">Fiyat: Artan</option>
          <option value="price_desc">Fiyat: Azalan</option>
          <option value="rating">Puan</option>
        </select>
      </div>

      <div className="layout-with-sidebar">
        <FilterSidebar categories={CATEGORIES} selected={category} onSelect={setCategory} onSearch={setQ} searchPlaceholder="Hizmet ara..." />

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
            <div className="grid-3">
              {services.map((s) => <ServiceCard key={s._id} service={s} />)}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
