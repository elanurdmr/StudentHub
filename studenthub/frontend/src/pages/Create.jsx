import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { servicesAPI, needsAPI, projectsAPI, uploadAPI } from '../api/client.js';

const TYPES = [
  { value: 'service', label: 'Hizmet', desc: 'Becerini sat', icon: '🛍' },
  { value: 'need', label: 'İhtiyaç', desc: 'Teklif al', icon: '📢' },
  { value: 'project', label: 'Proje', desc: 'Ekip kur', icon: '🤝' },
];

const CATEGORIES = ['Tasarım', 'Yazılım', 'Akademik', 'Çeviri', 'Fotoğraf', 'Video', 'Müzik', 'Araştırma', 'Sosyal Girişim', 'Oyun', 'Mobil', 'Yapay Zeka', 'Diğer'];

export default function Create() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const editType = params.get('edit');   // 'service' | 'need' | 'project' | null
  const editId   = params.get('id');
  const isEdit   = !!(editType && editId);

  const [type, setType] = useState(editType || 'service');
  const [form, setForm] = useState({ title: '', description: '', category: '', price: '', budget: '', deliveryDays: '', teamSize: '', duration: '', requiredSkills: '', collaborationType: 'volunteer', expectedTimeCommitment: '', isRemote: true, applicationDeadline: '', projectUrl: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [serviceImage, setServiceImage] = useState('');
  const [imageUploadBusy, setImageUploadBusy] = useState(false);

  /* Edit modunda mevcut veriyi çek */
  useEffect(() => {
    if (!isEdit) return;
    const getter = editType === 'service' ? servicesAPI.get(editId)
      : editType === 'need' ? needsAPI.get(editId)
      : projectsAPI.get(editId);
    getter.then(({ data }) => {
      setForm({
        title: data.title || '',
        description: data.description || '',
        category: data.category || '',
        price: data.price ?? '',
        budget: data.budget ?? '',
        deliveryDays: data.deliveryDays ?? '',
        teamSize: data.teamSize ?? '',
        duration: data.duration || '',
        requiredSkills: (data.requiredSkills || []).join(', '),
        collaborationType: data.collaborationType || 'volunteer',
        expectedTimeCommitment: data.expectedTimeCommitment || '',
        isRemote: data.isRemote !== false,
        applicationDeadline: data.applicationDeadline ? data.applicationDeadline.slice(0, 10) : '',
        projectUrl: data.projectUrl || '',
      });
      if (editType === 'service' && data.image) setServiceImage(data.image);
    }).catch(() => {});
  }, [isEdit, editType, editId]);

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
        const payload = {
          title: form.title,
          description: form.description,
          category: form.category,
          price: Number(form.price),
          deliveryDays: Number(form.deliveryDays) || 3,
          ...(serviceImage ? { image: serviceImage } : {}),
        };
        res = isEdit ? await servicesAPI.update(editId, payload) : await servicesAPI.create(payload);
        navigate(`/detail/service/${res.data._id}`);
      } else if (type === 'need') {
        const payload = { title: form.title, description: form.description, category: form.category, budget: Number(form.budget) };
        res = isEdit ? await needsAPI.update(editId, payload) : await needsAPI.create(payload);
        navigate(`/detail/need/${res.data._id}`);
      } else {
        const skills = form.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean);
        const payload = {
          title: form.title, description: form.description, category: form.category,
          teamSize: Number(form.teamSize) || 3, duration: form.duration, requiredSkills: skills,
          collaborationType: form.collaborationType, expectedTimeCommitment: form.expectedTimeCommitment,
          isRemote: form.isRemote,
          ...(form.applicationDeadline ? { applicationDeadline: form.applicationDeadline } : {}),
          ...(form.projectUrl ? { projectUrl: form.projectUrl } : {}),
        };
        res = isEdit ? await projectsAPI.update(editId, payload) : await projectsAPI.create(payload);
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
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, marginBottom: '.5rem' }}>
        {isEdit ? 'İlanı Düzenle' : 'Yeni İlan Oluştur'}
      </h1>
      <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>
        {isEdit ? 'Bilgileri güncelleyip kaydedin' : 'Ne tür bir ilan vermek istersiniz?'}
      </p>

      {/* Tip seçici — sadece yeni ilan oluştururken göster */}
      {!isEdit && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {TYPES.map((t) => (
            <button key={t.value} onClick={() => setType(t.value)} style={{ padding: '1.25rem', border: `2px solid ${type === t.value ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 'var(--radius)', background: type === t.value ? '#eef2ff' : 'var(--card)', cursor: 'pointer', textAlign: 'center', transition: 'all .15s' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '.5rem' }}>{t.icon}</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: type === t.value ? 'var(--accent)' : 'var(--ink)' }}>{t.label}</div>
              <div style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: '.25rem' }}>{t.desc}</div>
            </button>
          ))}
        </div>
      )}

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
            <>
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
              <div className="form-group">
                <label className="form-label">Kapak görseli (isteğe bağlı)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setImageUploadBusy(true);
                    try {
                      const { data } = await uploadAPI.serviceCover(f);
                      setServiceImage(data.url);
                    } catch {
                      setError('Görsel yüklenemedi');
                    } finally {
                      setImageUploadBusy(false);
                    }
                  }}
                />
                {imageUploadBusy && <p style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: '.35rem' }}>Yükleniyor…</p>}
                {serviceImage && (
                  <div style={{ marginTop: '.75rem' }}>
                    <img src={serviceImage} alt="" style={{ maxWidth: 200, borderRadius: '.5rem', border: '1px solid var(--border)' }} />
                  </div>
                )}
              </div>
            </>
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
                  <label className="form-label">İş Birliği Türü</label>
                  <select className="form-control" name="collaborationType" value={form.collaborationType} onChange={handleChange}>
                    <option value="volunteer">Gönüllü</option>
                    <option value="academic">Akademik</option>
                    <option value="startup">Startup</option>
                    <option value="research">Araştırma</option>
                    <option value="competition">Yarışma</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Ekip Büyüklüğü</label>
                  <input className="form-control" name="teamSize" type="number" min="1" value={form.teamSize} onChange={handleChange} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Süre</label>
                  <input className="form-control" name="duration" value={form.duration} onChange={handleChange} placeholder="örn. 3 ay" />
                </div>
                <div className="form-group">
                  <label className="form-label">Haftalık Zaman (saat)</label>
                  <input className="form-control" name="expectedTimeCommitment" value={form.expectedTimeCommitment} onChange={handleChange} placeholder="örn. 10 saat/hafta" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Başvuru Son Tarihi</label>
                  <input className="form-control" name="applicationDeadline" type="date" value={form.applicationDeadline} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Çalışma Şekli</label>
                  <select className="form-control" name="isRemote" value={form.isRemote} onChange={(e) => setForm((f) => ({ ...f, isRemote: e.target.value === 'true' }))}>
                    <option value="true">Uzaktan</option>
                    <option value="false">Yüz Yüze</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Gerekli Beceriler (virgülle ayır)</label>
                <input className="form-control" name="requiredSkills" value={form.requiredSkills} onChange={handleChange} placeholder="React, Node.js, Figma" />
              </div>
              <div className="form-group">
                <label className="form-label">Proje URL (isteğe bağlı)</label>
                <input className="form-control" name="projectUrl" type="url" value={form.projectUrl} onChange={handleChange} placeholder="https://github.com/..." />
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '.5rem' }}>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? (isEdit ? 'Kaydediliyor…' : 'Yayınlanıyor…') : (isEdit ? 'Değişiklikleri Kaydet' : 'İlanı Yayınla')}
            </button>
            {isEdit && (
              <button className="btn btn-secondary" type="button" onClick={() => navigate(-1)}>
                Vazgeç
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
