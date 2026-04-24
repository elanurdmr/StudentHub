export default function FilterSidebar({ categories, selected, onSelect, onSearch, searchPlaceholder = 'Ara...' }) {
  return (
    <aside className="sidebar">
      <h3>Filtreler</h3>
      <div style={{ marginBottom: '1.25rem' }}>
        <div className="search-bar">
          <span>&#x1F50D;</span>
          <input
            type="text"
            placeholder={searchPlaceholder}
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>
      </div>
      <div className="filter-group">
        <label>Kategori</label>
        <div className="filter-options">
          <label className="filter-option">
            <input
              type="radio"
              name="category"
              checked={!selected}
              onChange={() => onSelect('')}
            />
            Tümü
          </label>
          {categories.map((cat) => (
            <label key={cat} className="filter-option">
              <input
                type="radio"
                name="category"
                checked={selected === cat}
                onChange={() => onSelect(cat)}
              />
              {cat}
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
