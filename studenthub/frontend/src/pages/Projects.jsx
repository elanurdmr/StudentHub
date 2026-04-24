import { useState, useEffect } from 'react';
import { projectsAPI } from '../api/client.js';
import ProjectCard from '../components/cards/ProjectCard.jsx';
import FilterSidebar from '../components/forms/FilterSidebar.jsx';

const CATEGORIES = ['Yazılım', 'Tasarım', 'Araştırma', 'Sosyal Girişim', 'Oyun', 'Mobil', 'Yapay Zeka', 'Diğer'];

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [q, setQ] = useState('');

  useEffect(() => {
    setLoading(true);
    projectsAPI.list({ category: category || undefined, q: q || undefined })
      .then((r) => setProjects(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category, q]);

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div className="page-header" style={{ textAlign: 'left', paddingTop: '1rem' }}>
        <h1>Proje İlanları</h1>
        <p style={{ color: 'var(--muted)' }}>Ekip arayan projeler, skill matching ile sana özel öneriler</p>
      </div>

      <div className="layout-with-sidebar">
        <FilterSidebar categories={CATEGORIES} selected={category} onSelect={setCategory} onSearch={setQ} searchPlaceholder="Proje ara..." />

        <main>
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
