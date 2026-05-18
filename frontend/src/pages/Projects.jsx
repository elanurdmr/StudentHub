import { useState, useEffect } from 'react';
import { projectsAPI, aiAPI } from '../api/client.js';
import ProjectCard from '../components/cards/ProjectCard.jsx';
import FilterSidebar from '../components/forms/FilterSidebar.jsx';
import useAuthStore from '../store/authStore.js';

const CATEGORIES = ['Yazılım', 'Tasarım', 'Araştırma', 'Sosyal Girişim', 'Oyun', 'Mobil', 'Yapay Zeka', 'Diğer'];

export default function Projects() {
  const { token } = useAuthStore();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [q, setQ] = useState('');
  const [filters, setFilters] = useState({});
  const [aiMatches, setAiMatches] = useState([]);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiRan, setAiRan] = useState(false);

  useEffect(() => {
    setLoading(true);
    projectsAPI.list({
      category: category || undefined,
      q: q || undefined,
      sort: filters.sort || undefined,
      collaborationType: filters.collaborationType || undefined,
      isRemote: filters.isRemote !== undefined && filters.isRemote !== '' ? filters.isRemote : undefined,
      requiredSkills: filters.skills || undefined,
    })
      .then((r) => setProjects(r.data?.data || r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category, q, filters]);

  async function loadAiMatches() {
    if (!token) return;
    setAiBusy(true);
    setAiMatches([]);
    setAiRan(false);
    try {
      const { data } = await aiAPI.matchProjects();
      const flat = Array.isArray(data)
        ? data
            .map((row) => {
              if (row.project && row.project._id) return { ...row.project, aiReason: row.reason, aiMatchScore: row.matchScore };
              if (row._id) return row;
              return null;
            })
            .filter(Boolean)
        : [];
      setAiMatches(flat);
    } catch {
      setAiMatches([]);
    } finally {
      setAiBusy(false);
      setAiRan(true);
    }
  }

  function clearAi() {
    setAiMatches([]);
    setAiRan(false);
  }

  // AI sonuçlarının ID seti — diğer projelerden çıkarmak için
  const aiMatchedIds = new Set(aiMatches.map((p) => String(p._id)));
  const otherProjects = aiRan ? projects.filter((p) => !aiMatchedIds.has(String(p._id))) : projects;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div className="page-header" style={{ textAlign: 'left', paddingTop: '1rem' }}>
        <h1>Proje İlanları</h1>
        <p style={{ color: 'var(--muted)' }}>Ekip arayan projeler, becerilerine göre AI eşleştirme</p>
      </div>

      {/* Mobil arama */}
      <div className="mobile-search-bar">
        <div className="search-bar">
          <span>🔍</span>
          <input type="text" placeholder="Proje ara..." onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      <div className="layout-with-sidebar">
        <FilterSidebar
          categories={CATEGORIES} selected={category} onSelect={setCategory}
          onSearch={setQ} searchPlaceholder="Proje ara..."
          filters={filters} onFiltersChange={setFilters}
          showCollaborationType showIsRemote showSkills showSort
          sortOptions={[
            { value: 'newest', label: 'En Yeni' },
            { value: 'most_applied', label: 'En Çok Başvurulan' },
            { value: 'deadline', label: 'Son Başvuru Tarihi' },
          ]}
        />

        <main>
          {/* ── AI Eşleştir butonu (giriş yapılmışsa) ── */}
          {token && !aiRan && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              padding: '.875rem 1.25rem', marginBottom: '1.5rem',
              borderRadius: 'var(--radius)', border: '1px solid var(--border)',
              background: 'var(--card)',
            }}>
              <span style={{ fontSize: '1.25rem' }}>🤖</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '.9rem' }}>Sana uygun projeleri bul</div>
                <div style={{ fontSize: '.8rem', color: 'var(--muted)' }}>Becerilerine göre AI ile eşleştir</div>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                disabled={aiBusy}
                onClick={loadAiMatches}
                style={{ flexShrink: 0 }}
              >
                {aiBusy ? '⏳ Çalışıyor…' : '✨ Eşleştir'}
              </button>
            </div>
          )}

          {/* ── AI Önerileri bölümü ── */}
          {aiRan && (
            <section style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '.5rem' }}>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                  🤖 AI Önerileri
                  {aiMatches.length > 0 && (
                    <span style={{ fontSize: '.8rem', fontWeight: 400, color: 'var(--muted)', fontFamily: 'inherit' }}>
                      — {aiMatches.length} eşleşme
                    </span>
                  )}
                </h2>
                <div style={{ display: 'flex', gap: '.5rem' }}>
                  <button className="btn btn-secondary btn-sm" disabled={aiBusy} onClick={loadAiMatches}>
                    {aiBusy ? '⏳ Çalışıyor…' : '↻ Yenile'}
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={clearAi}>✕ Kapat</button>
                </div>
              </div>

              {aiMatches.length === 0 ? (
                <div style={{
                  padding: '1.25rem', borderRadius: 'var(--radius)',
                  border: '1px dashed var(--border)', background: 'var(--card)',
                  color: 'var(--muted)', fontSize: '.875rem', textAlign: 'center',
                }}>
                  Profilinizle eşleşen proje bulunamadı. Beceri ekleyerek daha iyi sonuç alabilirsiniz.
                </div>
              ) : (
                <div className="grid-3">
                  {aiMatches.map((p) => (
                    <ProjectCard key={`ai-${p._id}`} project={p} />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ── Diğer / Tüm Projeler ── */}
          <div>
            {aiRan && otherProjects.length > 0 && (
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem' }}>
                Diğer Projeler
              </h2>
            )}
            {loading ? (
              <div className="empty-state"><p>Yükleniyor…</p></div>
            ) : otherProjects.length === 0 && aiRan ? (
              <p style={{ color: 'var(--muted)', fontSize: '.875rem' }}>
                Tüm projeler yukarıda AI önerileri olarak gösteriliyor.
              </p>
            ) : otherProjects.length === 0 ? (
              <div className="empty-state">
                <div className="icon">🤝</div>
                <h3>Proje bulunamadı</h3>
                <p>Farklı filtreler deneyin veya kendi projenizi oluşturun</p>
              </div>
            ) : (
              <div className="grid-3">
                {otherProjects.map((p) => <ProjectCard key={p._id} project={p} />)}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
