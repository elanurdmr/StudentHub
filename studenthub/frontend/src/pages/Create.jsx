import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { servicesAPI, needsAPI, projectsAPI } from '../api/client.js';

const TYPES = [
  { value: 'service', label: 'Hizmet', desc: 'Becerini sat', icon: '🛍' },
  { value: 'need', label: 'İhtiyaç', desc: 'Teklif al', icon: '📢' },
  { value: 'project', label: 'Proje', desc: 'Ekip kur', icon: '🤝' },
];

const CATEGORIES = ['Tasarım', 'Yazılım', 'Akademik', 'Çeviri', 'Fotoğraf', 'Video', 'Müzik', 'Araştırma', 'Sosyal Girişim', 'Oyun', 'Mobil', 'Yapay Zeka', 'Diğer'];

export default function Create() {
  const navigate = useNavigate();
  const [type, setType] = useState('service');
  const [form, setForm] = useState({ title: '', description: '', category: '', price: '', budget: '', deliveryDays: '', teamSize: '', duration: '', requiredSkills: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title || !form.description || !form.category) { setError('Başlık, açıklama ve kategori zorunludur'); return; }
    setError('');
    setLoading(true);
    try {
      let res;
      if (type === 'service') {
        res = await servicesAPI.create({ title: form.title, description: form.description, category: form.category, price: Number(form.price), deliveryDays: Number(form.deliveryDays) || 3 });
        navigate(`/detail/service/${res.data._id}`);
      } else if (type === 'need') {
        res = await needsAPI.create({ title: form.title, description: form.description, category: form.category, budget: Number(form.budget) });
        navigate(`/detail/need/${res.data._id}`);
      } else {
        const skills = form.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean);
        res = await projectsAPI.create({ title: form.title, description: form.description, category: form.category, teamSize: Number(form.teamSize) || 3, duration: form.duration, requiredSkills: skills });
        navigate(`/detail/project/${res.data._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: 720 }}>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, marginBottom: '.5rem' }}>Yeni İlan Oluştur</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>Ne tür bir ilan vermek istersiniz?</p>

      {/* Type selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {TYPES.map((t) => (
          <button key={t.value} onClick={() => setType(t.value)} style={{ padding: '1.25rem', border: `2px solid ${type === t.value ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 'var(--radius)', background: type === t.value ? '#eef2ff' : 'var(--card)', cursor: 'pointer', textAlign: 'center', transition: 'all .15s' }}>
            <div style={{ fontSize: '1.75rem', marginBottom: '.5rem' }}>{t.icon}</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: type === t.value ? 'var(--accent)' : 'var(--ink)' }}>{t.label}</div>
            <div style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: '.25rem' }}>{t.desc}</div>
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        {error && <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '.5rem', padding: '.75rem 1rem', marginBottom: '1rem', color: 'var(--coral)', fontSize: '.9rem' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Başlık *</label>
            <input className="form-control" name="title" value={form.title} onChange={handleChange} placeholder="İlanınızın başlığı" />
          </div>
          <div className="form-group">
            <label className="form-label">Açıklama *</label>
            <textarea className="form-control" name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Detaylı açıklama giriniz" />
          </div>
          <div className="form-group">
            <label className="form-label">Kategori *</label>
            <select className="form-control" name="category" value={form.category} onChange={handleChange}>
              <option value="">Seçiniz</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {type === 'service' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Fiyat (₺) *</label>
                <input className="form-control" name="price" type="number" min="0" value={form.price} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Teslim Süresi (gün)</label>
                <input className="form-control" name="deliveryDays" type="number" min="1" value={form.deliveryDays} onChange={handleChange} />
              </div>
            </div>
          )}

          {type === 'need' && (
            <div className="form-group">
              <label className="form-label">Bütçe (₺) *</label>
              <input className="form-control" name="budget" type="number" min="0" value={form.budget} onChange={handleChange} />
            </div>
          )}

          {type === 'project' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Ekip Büyüklüğü</label>
                  <input className="form-control" name="teamSize" type="number" min="1" value={form.teamSize} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Süre</label>
                  <input className="form-control" name="duration" value={form.duration} onChange={handleChange} placeholder="örn. 3 ay" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Gerekli Beceriler (virgülle ayır)</label>
                <input className="form-control" name="requiredSkills" value={form.requiredSkills} onChange={handleChange} placeholder="React, Node.js, Figma" />
              </div>
            </>
          )}

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: '.5rem' }}>
            {loading ? 'Yayınlanıyor…' : 'İlanı Yayınla'}
          </button>
        </form>
      </div>
    </div>
  );
}
