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
  const [recs, setRecs] = useState([]);
  const [aiExtra, setAiExtra] = useState([]);
  const [aiBusy, setAiBusy] = useState(false);

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

  useEffect(() => {
    if (!token) {
      setRecs([]);
      return;
    }
    projectsAPI.recommendations().then((r) => setRecs(r.data)).catch(() => setRecs([]));
  }, [token]);

  async function loadAiMatches() {
    if (!token) return;
    setAiBusy(true);
    setAiExtra([]);
    try {
      const { data } = await aiAPI.matchProjects();
      const flat = Array.isArray(data)
        ? data
            .map((row) => {
              if (row.project && row.project._id) {
                return { ...row.project, aiReason: row.reason, aiMatchScore: row.matchScore };
              }
              if (row._id) return row;
              return null;
            })
            .filter(Boolean)
        : [];
      setAiExtra(flat);
    } catch {
      setAiExtra([]);
    } finally {
      setAiBusy(false);
    }
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div className="page-header" style={{ textAlign: 'left', paddingTop: '1rem' }}>
        <h1>Proje İlanları</h1>
        <p style={{ color: 'var(--muted)' }}>Ekip arayan projeler, skill matching ile sana özel öneriler</p>
      </div>

      {/* Mobil arama — sidebar gizlenince görünür */}
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
          {token && (
            <section style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '.75rem', marginBottom: '1rem' }}>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.1rem' }}>
                  <b> Sana uygun projeler </b>
                  {aiExtra.length > 0 ? '' : ''}
                  {recs.length > 0 && aiExtra.length === 0 ? ' (skill eşlemesi veya AI)' : ''}
                </h2>
                <button type="button" className="btn btn-secondary btn-sm" disabled={aiBusy} onClick={loadAiMatches}>
                  {aiBusy ? 'Çalışıyor…' : 'Eşleştir'}
                </button>
              </div>
              {(aiExtra.length > 0 ? aiExtra : recs).length === 0 ? (
                <p style={{ fontSize: '.875rem', color: 'var(--muted)' }}>
                  Henüz öneri yok. Becerilerinizi profilden ekleyin veya yukarıdan Gemini ile deneyin (API anahtarı gerekir).
                </p>
              ) : (
                <div className="grid-3">
                  {(aiExtra.length > 0 ? aiExtra : recs).slice(0, 6).map((p) => (
                    <ProjectCard key={`rec-${p._id}-${p.aiMatchScore ?? ''}`} project={p} />
                  ))}
                </div>
              )}
            </section>
          )}
            ---------------------------------------------------------------------------------------------------
          {loading ? (
            <div className="empty-state"><p>Yükleniyor…</p></div>
          ) : projects.length === 0 ? (
            <div className="empty-state">
              <div className="icon">🤝</div>
              <h3>Proje bulunamadı</h3>
              <p>Farklı filtreler deneyin veya kendi projenizi oluşturun</p>
            </div>
          ) : (
            <div className="grid-3">
              {projects.map((p) => <ProjectCard key={p._id} project={p} />)}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
