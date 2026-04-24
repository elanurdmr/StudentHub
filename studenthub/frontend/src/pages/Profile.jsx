import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usersAPI, reviewsAPI, uploadAPI } from '../api/client.js';
import useAuthStore from '../store/authStore.js';

export default function Profile() {
  const { id } = useParams();
  const { user: me, updateUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSkill, setNewSkill] = useState('');
  const [editBio, setEditBio] = useState(false);
  const [bio, setBio] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const isMe = me?._id === id;

  useEffect(() => {
    setLoading(true);
    Promise.all([
      usersAPI.get(id),
      reviewsAPI.list(id),
    ]).then(([p, r]) => {
      setProfile(p.data);
      setBio(p.data.bio || '');
      setReviews(r.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

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
    } finally { setUploading(false); }
  }

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

  async function saveBio() {
    const { data } = await usersAPI.update(id, { bio });
    setProfile(data);
    if (isMe) updateUser(data);
    setEditBio(false);
  }

  if (loading) return <div className="empty-state" style={{ marginTop: '4rem' }}><p>Yükleniyor…</p></div>;
  if (!profile) return null;

  const initials = `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
  const colorClasses = ['av-indigo', 'av-violet', 'av-teal', 'av-coral', 'av-amber'];
  const colorClass = colorClasses[profile.firstName.charCodeAt(0) % colorClasses.length];

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Sidebar */}
        <div>
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem' }}>
              <div className={`avatar av-xl ${colorClass}`} style={{ margin: '0 auto' }}>
                {profile.avatar ? <img src={profile.avatar} alt="" /> : initials}
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
            {profile.rating > 0 && <div style={{ color: 'var(--amber)', marginBottom: '.5rem' }}>★ {profile.rating} ({profile.reviewCount} değerlendirme)</div>}

            {editBio && isMe ? (
              <div style={{ marginTop: '.75rem', textAlign: 'left' }}>
                <textarea className="form-control" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
                <div style={{ display: 'flex', gap: '.5rem', marginTop: '.5rem' }}>
                  <button className="btn btn-primary btn-sm" onClick={saveBio}>Kaydet</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setEditBio(false)}>İptal</button>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--muted)', fontSize: '.9rem', marginTop: '.5rem', cursor: isMe ? 'pointer' : 'default' }} onClick={() => isMe && setEditBio(true)}>
                {profile.bio || (isMe ? 'Biyografi ekle…' : 'Biyografi yok')}
              </p>
            )}

            {isMe && (
              <Link to="/notifications" className="btn btn-secondary btn-sm w-full" style={{ marginTop: '1rem', justifyContent: 'center' }}>
                🔔 Bildirimler
              </Link>
            )}
          </div>

          {/* Skills */}
          <div className="card" style={{ marginTop: '1rem', padding: '1.5rem' }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', marginBottom: '1rem' }}>Beceriler</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.35rem', marginBottom: '1rem' }}>
              {profile.skills?.length === 0 && <span style={{ color: 'var(--muted)', fontSize: '.85rem' }}>Henüz beceri eklenmemiş</span>}
              {profile.skills?.map((s) => (
                <span key={s} className="chip chip-indigo" style={{ gap: '.25rem' }}>
                  {s}
                  {isMe && (
                    <button onClick={() => removeSkill(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontWeight: 700, padding: 0, lineHeight: 1 }}>×</button>
                  )}
                </span>
              ))}
            </div>
            {isMe && (
              <div style={{ display: 'flex', gap: '.5rem' }}>
                <input className="form-control" style={{ fontSize: '.85rem', padding: '.5rem .75rem' }} placeholder="Beceri ekle" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addSkill()} />
                <button className="btn btn-primary btn-sm" onClick={addSkill}>+</button>
              </div>
            )}
          </div>
        </div>

        {/* Main */}
        <div>
          {/* Reviews */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif' }}>Değerlendirmeler ({reviews.length})</h3>
              {me && !isMe && (
                <Link to={`/review/${id}`} className="btn btn-secondary btn-sm">Değerlendir</Link>
              )}
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
                  const ri = rev.firstName ? `${rev.firstName[0]}${rev.lastName?.[0] || ''}`.toUpperCase() : '?';
                  return (
                    <div key={r._id} style={{ padding: '1rem', background: 'var(--card)', borderRadius: '.75rem', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', marginBottom: '.5rem' }}>
                        <div className="avatar av-violet" style={{ width: '1.75rem', height: '1.75rem', fontSize: '.7rem' }}>{ri}</div>
                        <span style={{ fontWeight: 600, fontSize: '.9rem' }}>{rev.firstName} {rev.lastName}</span>
                        <div style={{ marginLeft: 'auto', color: 'var(--amber)' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
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
    </div>
  );
}
