export default function FilterSidebar({
  categories, selected, onSelect, onSearch, searchPlaceholder = 'Ara...',
  filters = {}, onFiltersChange,
  showRating = false, showDelivery = false, showDateRange = false,
  showSkills = false, showIsRemote = false, showCollaborationType = false,
  showSort = false, sortOptions = [],
}) {
  function set(key, val) { onFiltersChange?.({ ...filters, [key]: val }); }

  return (
    <aside className="sidebar">
      <h3>Filtreler</h3>

      {/* Arama */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div className="search-bar">
          <span>&#x1F50D;</span>
          <input type="text" placeholder={searchPlaceholder} onChange={(e) => onSearch?.(e.target.value)} />
        </div>
      </div>

      {/* Sıralama */}
      {showSort && sortOptions.length > 0 && (
        <div className="filter-group">
          <label>Sıralama</label>
          <select className="form-control" value={filters.sort || ''} onChange={(e) => set('sort', e.target.value)} style={{ fontSize: '.85rem' }}>
            <option value="">Varsayılan</option>
            {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      )}

      {/* Kategori */}
      <div className="filter-group">
        <label>Kategori</label>
        <div className="filter-options">
          <label className="filter-option">
            <input type="radio" name="category" checked={!selected} onChange={() => onSelect('')} />
            Tümü
          </label>
          {categories.map((cat) => (
            <label key={cat} className="filter-option">
              <input type="radio" name="category" checked={selected === cat} onChange={() => onSelect(cat)} />
              {cat}
            </label>
          ))}
        </div>
      </div>

      {/* Min puan */}
      {showRating && (
        <div className="filter-group">
          <label>Min. Puan</label>
          <div style={{ display: 'flex', gap: '.35rem', flexWrap: 'wrap' }}>
            {[0, 3, 4, 4.5].map((v) => (
              <button
                key={v}
                onClick={() => set('minRating', v === filters.minRating ? 0 : v)}
                style={{ padding: '.3rem .65rem', borderRadius: '999px', border: `1.5px solid ${filters.minRating === v && v > 0 ? 'var(--accent)' : 'var(--border)'}`, background: filters.minRating === v && v > 0 ? '#eef2ff' : 'var(--card)', cursor: 'pointer', fontSize: '.8rem', fontWeight: 600, color: filters.minRating === v && v > 0 ? 'var(--accent)' : 'var(--ink)' }}
              >
                {v === 0 ? 'Hepsi' : `★ ${v}+`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Maksimum teslim süresi */}
      {showDelivery && (
        <div className="filter-group">
          <label>Maks. Teslim Süresi (gün)</label>
          <input className="form-control" type="number" min="1" placeholder="örn. 7" value={filters.maxDeliveryDays || ''} onChange={(e) => set('maxDeliveryDays', e.target.value)} style={{ fontSize: '.85rem' }} />
        </div>
      )}

      {/* Tarih aralığı */}
      {showDateRange && (
        <div className="filter-group">
          <label>Tarih Aralığı</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
            <input className="form-control" type="date" value={filters.dateFrom || ''} onChange={(e) => set('dateFrom', e.target.value)} style={{ fontSize: '.8rem' }} />
            <input className="form-control" type="date" value={filters.dateTo || ''} onChange={(e) => set('dateTo', e.target.value)} style={{ fontSize: '.8rem' }} />
          </div>
        </div>
      )}

      {/* İş birliği türü */}
      {showCollaborationType && (
        <div className="filter-group">
          <label>İş Birliği Türü</label>
          <div className="filter-options">
            {[['', 'Tümü'], ['volunteer', 'Gönüllü'], ['academic', 'Akademik'], ['startup', 'Startup'], ['research', 'Araştırma'], ['competition', 'Yarışma']].map(([v, l]) => (
              <label key={v} className="filter-option">
                <input type="radio" name="collaborationType" checked={(filters.collaborationType || '') === v} onChange={() => set('collaborationType', v)} />
                {l}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Uzaktan çalışma */}
      {showIsRemote && (
        <div className="filter-group">
          <label>Çalışma Şekli</label>
          <div className="filter-options">
            {[['', 'Tümü'], ['true', 'Uzaktan'], ['false', 'Yüz Yüze']].map(([v, l]) => (
              <label key={v} className="filter-option">
                <input type="radio" name="isRemote" checked={(filters.isRemote ?? '') === v} onChange={() => set('isRemote', v)} />
                {l}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Beceri filtresi */}
      {showSkills && (
        <div className="filter-group">
          <label>Beceri Filtresi</label>
          <input className="form-control" type="text" placeholder="React, Python..." value={filters.skills || ''} onChange={(e) => set('skills', e.target.value)} style={{ fontSize: '.85rem' }} />
          <p style={{ fontSize: '.7rem', color: 'var(--muted)', marginTop: '.25rem' }}>Virgülle ayırarak birden fazla girin</p>
        </div>
      )}
    </aside>
  );
}
