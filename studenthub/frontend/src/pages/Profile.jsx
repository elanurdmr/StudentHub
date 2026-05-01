import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { usersAPI, reviewsAPI, uploadAPI } from '../api/client.js';
import useAuthStore from '../store/authStore.js';

export default function Profile() {
  const { id }            = useParams();
  const navigate          = useNavigate();
  const { user: me, updateUser } = useAuthStore();

  const [profile, setProfile]   = useState(null);
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [newSkill, setNewSkill] = useState('');
  const [editBio, setEditBio]   = useState(false);
  const [bio, setBio]           = useState('');
  const [uploading, setUploading] = useState(false);

  /* Portfolyo modal */
  const [showPortModal, setShowPortModal] = useState(false);
  const [portForm, setPortForm]           = useState({ title: '', description: '', url: '' });
  const [portLoading, setPortLoading]     = useState(false);
  const [portError, setPortError]         = useState('');

  const fileRef = useRef();
  const isMe    = me?._id === id;

  useEffect(() => {
    setLoading(true);
    Promise.all([usersAPI.get(id), reviewsAPI.list(id)])
      .then(([p, r]) => {
        setProfile(p.data);
        setBio(p.data.bio || '');
        setReviews(r.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  /* ----- Avatar yükle ----- */
  async function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data } = await uploadAPI.avatar(file);
      setProfile((p) => ({ ...p, avatar: data.url }));
      updateUser({ ...me, avatar: data.url });
    } catch (err) {
      alert(err.response?.data?.error || 'Yükleme başarısız');
    } finally {
      setUploading(false);
    }
  }

  /* ----- Beceri ekle / çıkar ----- */
  async function addSkill() {
    if (!newSkill.trim()) return;
    const { data } = await usersAPI.addSkill(id, newSkill.trim());
    setProfile(data);
    if (isMe) updateUser(data);
    setNewSkill('');
  }

  async function removeSkill(skill) {
    const { data } = await usersAPI.removeSkill(id, skill);
    setProfile(data);
    if (isMe) updateUser(data);
  }

  /* ----- Biyografi kaydet ----- */
  async function saveBio() {
    const { data } = await usersAPI.update(id, { bio });
    setProfile(data);
    if (isMe) updateUser(data);
    setEditBio(false);
  }

  /* ----- Portfolyo ekle ----- */
  async function handleAddPortfolio(e) {
    e.preventDefault();
    if (!portForm.title.trim()) { setPortError('Başlık zorunludur'); return; }
    setPortError('');
    setPortLoading(true);
    try {
      const { data } = await usersAPI.addPortfolio(id, portForm);
      setProfile(data);
      if (isMe) updateUser(data);
      setShowPortModal(false);
      setPortForm({ title: '', description: '', url: '' });
    } catch (err) {
      setPortError(err.response?.data?.error || 'Eklenemedi');
    } finally {
      setPortLoading(false);
    }
  }

  /* ----- Mesaj gönder ----- */
  function handleMessage() {
    const name = encodeURIComponent(`${profile.firstName} ${profile.lastName}`);
    navigate(`/messages?to=${id}&name=${name}`);
  }

  if (loading) return <div className="empty-state" style={{ marginTop: '4rem' }}><p>Yükleniyor…</p></div>;
  if (!profile) return null;

  const initials    = `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
  const colorClasses = ['av-indigo', 'av-violet', 'av-teal', 'av-coral', 'av-amber'];
  const colorClass  = colorClasses[profile.firstName.charCodeAt(0) % colorClasses.length];

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem', alignItems: 'start' }}>

        {/* ──────── SOL SIDEBAR ──────── */}
        <div>
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>

            {/* Avatar */}
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem' }}>
              <div className={`avatar av-xl ${colorClass}`} style={{ margin: '0 auto' }}>
                {profile.avatar ? <img src={profile.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : initials}
              </div>
              {isMe && (
                <>
                  <button
                    onClick={() => fileRef.current.click()}
                    style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--accent)', border: 'none', borderRadius: '50%', width: '1.75rem', height: '1.75rem', color: '#fff', cursor: 'pointer', fontSize: '.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {uploading ? '…' : '✎'}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
                </>
              )}
            </div>

            <h2 style={{ fontFamily: 'Syne, sans-serif', marginBottom: '.25rem' }}>{profile.firstName} {profile.lastName}</h2>
            {profile.rating > 0 && (
              <div style={{ color: 'var(--amber)', marginBottom: '.5rem' }}>★ {profile.rating} ({profile.reviewCount} değerlendirme)</div>
            )}

            {/* Biyografi */}
            {editBio && isMe ? (
              <div style={{ marginTop: '.75rem', textAlign: 'left' }}>
                <textarea className="form-control" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
                <div style={{ display: 'flex', gap: '.5rem', marginTop: '.5rem' }}>
                  <button className="btn btn-primary btn-sm" onClick={saveBio}>Kaydet</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setEditBio(false)}>İptal</button>
                </div>
              </div>
            ) : (
              <p
                style={{ color: 'var(--muted)', fontSize: '.9rem', marginTop: '.5rem', cursor: isMe ? 'pointer' : 'default' }}
                onClick={() => isMe && setEditBio(true)}
              >
                {profile.bio || (isMe ? 'Biyografi ekle…' : 'Biyografi yok')}
              </p>
            )}

            {/* Aksiyonlar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', marginTop: '1rem' }}>
              {isMe ? (
                <Link to="/notifications" className="btn btn-secondary btn-sm w-full" style={{ justifyContent: 'center' }}>
                  🔔 Bildirimler
                </Link>
              ) : (
                me && (
                  <button className="btn btn-primary btn-sm w-full" style={{ justifyContent: 'center' }} onClick={handleMessage}>
                    💬 Mesaj Gönder
                  </button>
                )
              )}
              {me && !isMe && (
                <Link to={`/review/${id}`} className="btn btn-secondary btn-sm w-full" style={{ justifyContent: 'center' }}>
                  ⭐ Değerlendir
                </Link>
              )}
            </div>
          </div>

          {/* Beceriler */}
          <div className="card" style={{ marginTop: '1rem', padding: '1.5rem' }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', marginBottom: '1rem' }}>Beceriler</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.35rem', marginBottom: '1rem' }}>
              {profile.skills?.length === 0 && (
                <span style={{ color: 'var(--muted)', fontSize: '.85rem' }}>Henüz beceri eklenmemiş</span>
              )}
              {profile.skills?.map((s) => (
                <span key={s} className="chip chip-indigo" style={{ gap: '.25rem' }}>
                  {s}
                  {isMe && (
                    <button
                      onClick={() => removeSkill(s)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontWeight: 700, padding: 0, lineHeight: 1 }}
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>
            {isMe && (
              <div style={{ display: 'flex', gap: '.5rem' }}>
                <input
                  className="form-control"
                  style={{ fontSize: '.85rem', padding: '.5rem .75rem' }}
                  placeholder="Beceri ekle"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                />
                <button className="btn btn-primary btn-sm" onClick={addSkill}>+</button>
              </div>
            )}
          </div>
        </div>

        {/* ──────── SAĞ MAIN ──────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Portfolyo */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif' }}>Portfolyo</h3>
              {isMe && (
                <button className="btn btn-primary btn-sm" onClick={() => setShowPortModal(true)}>
                  + Ekle
                </button>
              )}
            </div>

            {(!profile.portfolio || profile.portfolio.length === 0) ? (
              <div className="empty-state" style={{ padding: '1.5rem' }}>
                <div className="icon">🗂</div>
                <p style={{ fontSize: '.85rem' }}>
                  {isMe ? 'Henüz portfolyo öğesi yok. Ekle butonuyla başlayın.' : 'Portfolyo öğesi paylaşılmamış.'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: '1rem' }}>
                {profile.portfolio.map((p, i) => (
                  <div key={i} style={{ border: '1px solid var(--border)', borderRadius: '.75rem', overflow: 'hidden', background: 'var(--card)' }}>
                    <div style={{ height: 100, background: `hsl(${(i * 60) % 360},60%,90%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                      🖼
                    </div>
                    <div style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '.9rem', marginBottom: '.25rem' }}>{p.title}</div>
                      {p.description && <p style={{ fontSize: '.8rem', color: 'var(--muted)', marginBottom: '.5rem' }}>{p.description}</p>}
                      {p.url && (
                        <a href={p.url} target="_blank" rel="noreferrer" style={{ fontSize: '.8rem', color: 'var(--accent)', fontWeight: 600 }}>
                          🔗 Görüntüle
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Değerlendirmeler */}
          <div className="card">
            <div style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif' }}>Değerlendirmeler ({reviews.length})</h3>
            </div>
            {reviews.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <div className="icon">⭐</div>
                <h3>Henüz değerlendirme yok</h3>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {reviews.map((r) => {
                  const rev = r.reviewer || {};
                  const ri  = rev.firstName ? `${rev.firstName[0]}${rev.lastName?.[0] || ''}`.toUpperCase() : '?';
                  return (
                    <div key={r._id} style={{ padding: '1rem', background: 'var(--card)', borderRadius: '.75rem', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', marginBottom: '.5rem' }}>
                        <div className="avatar av-violet" style={{ width: '1.75rem', height: '1.75rem', fontSize: '.7rem' }}>{ri}</div>
                        <span style={{ fontWeight: 600, fontSize: '.9rem' }}>{rev.firstName} {rev.lastName}</span>
                        <div style={{ marginLeft: 'auto', color: 'var(--amber)' }}>
                          {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                        </div>
                      </div>
                      {r.comment && <p style={{ fontSize: '.875rem', color: 'var(--muted)' }}>{r.comment}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ──────── PORTFOLYO MODAL ──────── */}
      {showPortModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
          onClick={(e) => e.target === e.currentTarget && setShowPortModal(false)}
        >
          <div className="card" style={{ width: '100%', maxWidth: 500, padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif' }}>Portfolyo Öğesi Ekle</h3>
              <button onClick={() => setShowPortModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--muted)' }}>✕</button>
            </div>

            {portError && (
              <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '.5rem', padding: '.75rem 1rem', marginBottom: '1rem', color: 'var(--coral)', fontSize: '.9rem' }}>
                {portError}
              </div>
            )}

            <form onSubmit={handleAddPortfolio}>
              <div className="form-group">
                <label className="form-label">Başlık *</label>
                <input
                  className="form-control"
                  value={portForm.title}
                  onChange={(e) => setPortForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Proje veya çalışma adı"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Açıklama</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={portForm.description}
                  onChange={(e) => setPortForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Kısa açıklama…"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Bağlantı (URL)</label>
                <input
                  className="form-control"
                  type="url"
                  value={portForm.url}
                  onChange={(e) => setPortForm((f) => ({ ...f, url: e.target.value }))}
                  placeholder="https://…"
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '.5rem' }}>
                <button className="btn btn-primary" type="submit" disabled={portLoading}>
                  {portLoading ? 'Ekleniyor…' : 'Ekle'}
                </button>
                <button className="btn btn-secondary" type="button" onClick={() => setShowPortModal(false)}>
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
