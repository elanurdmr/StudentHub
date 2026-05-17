import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { usersAPI, reviewsAPI, uploadAPI, servicesAPI, projectsAPI, needsAPI } from '../api/client.js';
import useAuthStore from '../store/authStore.js';

const DEGREE_LABELS = { associate: 'Ön Lisans', bachelor: 'Lisans', master: 'Yüksek Lisans', phd: 'Doktora', certificate: 'Sertifika', other: 'Diğer' };
const EXP_TYPE_LABELS = { fulltime: 'Tam Zamanlı', parttime: 'Yarı Zamanlı', internship: 'Staj', freelance: 'Serbest', volunteer: 'Gönüllü' };
const LANG_LEVEL_LABELS = { A1: 'A1', A2: 'A2', B1: 'B1', B2: 'B2', C1: 'C1', C2: 'C2', native: 'Anadil' };

export default function Profile() {
  const { id }            = useParams();
  const navigate          = useNavigate();
  const { user: me, updateUser } = useAuthStore();

  const [profile, setProfile]   = useState(null);
  const [reviews, setReviews]   = useState([]);
  const [userServices, setUserServices] = useState([]);
  const [userProjects, setUserProjects] = useState([]);
  const [userNeeds, setUserNeeds] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [newSkill, setNewSkill] = useState('');
  const [editBio, setEditBio]   = useState(false);
  const [bio, setBio]           = useState('');
  const [uploading, setUploading] = useState(false);

  /* Portfolyo modal */
  const [showPortModal, setShowPortModal] = useState(false);
  const [portForm, setPortForm]           = useState({ title: '', description: '', url: '' });
  const [portLoading, setPortLoading]     = useState(false);
  const [portError, setPortError]         = useState('');

  /* Headline & social links */
  const [editHeadline, setEditHeadline]   = useState(false);
  const [headline, setHeadline]           = useState('');
  const [editSocial, setEditSocial]       = useState(false);
  const [social, setSocial]               = useState({ github: '', linkedin: '', website: '', twitter: '' });

  /* CV sections */
  const [showEduModal, setShowEduModal]   = useState(false);
  const [eduForm, setEduForm]             = useState({ institution: '', degree: 'bachelor', field: '', startYear: '', endYear: '', gpa: '' });
  const [showExpModal, setShowExpModal]   = useState(false);
  const [expForm, setExpForm]             = useState({ title: '', company: '', type: 'internship', startDate: '', endDate: '', isCurrent: false, description: '' });
  const [showCertModal, setShowCertModal] = useState(false);
  const [certForm, setCertForm]           = useState({ name: '', issuer: '', issueDate: '', credentialUrl: '' });
  const [cvLoading, setCvLoading]         = useState(false);

  const fileRef = useRef();
  const isMe    = me?._id === id;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      usersAPI.get(id),
      reviewsAPI.list(id),
      servicesAPI.list({ owner: id }),
      projectsAPI.list({ owner: id }),
      needsAPI.list({ owner: id }),
    ])
      .then(([p, r, sv, pj, nd]) => {
        setProfile(p.data);
        setBio(p.data.bio || '');
        setHeadline(p.data.headline || '');
        setSocial(p.data.socialLinks || { github: '', linkedin: '', website: '', twitter: '' });
        setReviews(r.data);
        setUserServices(sv.data?.data || sv.data || []);
        setUserProjects(pj.data?.data || pj.data || []);
        setUserNeeds(nd.data || []);
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

  /* ----- Başlık kaydet ----- */
  async function saveHeadline() {
    const { data } = await usersAPI.update(id, { headline });
    setProfile(data); if (isMe) updateUser(data); setEditHeadline(false);
  }

  /* ----- Sosyal bağlantılar kaydet ----- */
  async function saveSocial() {
    const { data } = await usersAPI.update(id, { socialLinks: social });
    setProfile(data); if (isMe) updateUser(data); setEditSocial(false);
  }

  /* ----- Eğitim ----- */
  async function handleAddEducation(e) {
    e.preventDefault(); setCvLoading(true);
    try {
      const { data } = await usersAPI.addEducation(id, eduForm);
      setProfile(data); if (isMe) updateUser(data);
      setShowEduModal(false); setEduForm({ institution: '', degree: 'bachelor', field: '', startYear: '', endYear: '', gpa: '' });
    } finally { setCvLoading(false); }
  }
  async function removeEducation(eduId) {
    const { data } = await usersAPI.removeEducation(id, eduId);
    setProfile(data); if (isMe) updateUser(data);
  }

  /* ----- Deneyim ----- */
  async function handleAddExperience(e) {
    e.preventDefault(); setCvLoading(true);
    try {
      const { data } = await usersAPI.addExperience(id, expForm);
      setProfile(data); if (isMe) updateUser(data);
      setShowExpModal(false); setExpForm({ title: '', company: '', type: 'internship', startDate: '', endDate: '', isCurrent: false, description: '' });
    } finally { setCvLoading(false); }
  }
  async function removeExperience(expId) {
    const { data } = await usersAPI.removeExperience(id, expId);
    setProfile(data); if (isMe) updateUser(data);
  }

  /* ----- Sertifika ----- */
  async function handleAddCertification(e) {
    e.preventDefault(); setCvLoading(true);
    try {
      const { data } = await usersAPI.addCertification(id, certForm);
      setProfile(data); if (isMe) updateUser(data);
      setShowCertModal(false); setCertForm({ name: '', issuer: '', issueDate: '', credentialUrl: '' });
    } finally { setCvLoading(false); }
  }
  async function removeCertification(certId) {
    const { data } = await usersAPI.removeCertification(id, certId);
    setProfile(data); if (isMe) updateUser(data);
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
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '280px 1fr', gap: '2rem', alignItems: 'start' }}>

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

            {/* Headline */}
            {editHeadline && isMe ? (
              <div style={{ marginBottom: '.5rem' }}>
                <input className="form-control" style={{ fontSize: '.85rem' }} maxLength={120} value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Kısa başlık..." />
                <div style={{ display: 'flex', gap: '.5rem', marginTop: '.35rem' }}>
                  <button className="btn btn-primary btn-sm" onClick={saveHeadline}>Kaydet</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setEditHeadline(false)}>İptal</button>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: '.85rem', color: 'var(--accent)', fontWeight: 600, marginBottom: '.35rem', cursor: isMe ? 'pointer' : 'default' }} onClick={() => isMe && setEditHeadline(true)}>
                {profile.headline || (isMe ? '+ Başlık ekle' : '')}
              </p>
            )}

            {profile.rating > 0 && (
              <div style={{ color: 'var(--amber)', marginBottom: '.5rem' }}>★ {profile.rating} ({profile.reviewCount} değerlendirme)</div>
            )}

            {/* Profil tamamlama skoru */}
            {isMe && profile.completionScore > 0 && (
              <div style={{ marginBottom: '.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.7rem', color: 'var(--muted)', marginBottom: '.25rem' }}>
                  <span>Profil doluluk oranı</span><span>%{profile.completionScore}</span>
                </div>
                <div style={{ height: 6, background: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${profile.completionScore}%`, background: profile.completionScore >= 80 ? '#22c55e' : profile.completionScore >= 50 ? '#f59e0b' : '#ef4444', borderRadius: 999, transition: 'width .4s' }} />
                </div>
              </div>
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

          {/* Sosyal bağlantılar */}
          {(isMe || profile.socialLinks?.github || profile.socialLinks?.linkedin || profile.socialLinks?.website || profile.socialLinks?.twitter) && (
            <div className="card" style={{ marginTop: '1rem', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.75rem' }}>
                <h4 style={{ fontFamily: 'Syne, sans-serif', fontSize: '.9rem' }}>Bağlantılar</h4>
                {isMe && <button onClick={() => setEditSocial(!editSocial)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: '.8rem', fontWeight: 600 }}>{editSocial ? 'Kapat' : '✎ Düzenle'}</button>}
              </div>
              {editSocial && isMe ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                  {['github', 'linkedin', 'website', 'twitter'].map((key) => (
                    <input key={key} className="form-control" style={{ fontSize: '.8rem' }} placeholder={key.charAt(0).toUpperCase() + key.slice(1) + ' URL'} value={social[key] || ''} onChange={(e) => setSocial((s) => ({ ...s, [key]: e.target.value }))} />
                  ))}
                  <div style={{ display: 'flex', gap: '.5rem', marginTop: '.25rem' }}>
                    <button className="btn btn-primary btn-sm" onClick={saveSocial}>Kaydet</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditSocial(false)}>İptal</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
                  {profile.socialLinks?.github && <a href={profile.socialLinks.github} target="_blank" rel="noreferrer" style={{ fontSize: '.8rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '.4rem' }}>🐙 GitHub</a>}
                  {profile.socialLinks?.linkedin && <a href={profile.socialLinks.linkedin} target="_blank" rel="noreferrer" style={{ fontSize: '.8rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '.4rem' }}>💼 LinkedIn</a>}
                  {profile.socialLinks?.website && <a href={profile.socialLinks.website} target="_blank" rel="noreferrer" style={{ fontSize: '.8rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '.4rem' }}>🌐 Web Sitesi</a>}
                  {profile.socialLinks?.twitter && <a href={profile.socialLinks.twitter} target="_blank" rel="noreferrer" style={{ fontSize: '.8rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '.4rem' }}>🐦 Twitter</a>}
                  {isMe && !profile.socialLinks?.github && !profile.socialLinks?.linkedin && !profile.socialLinks?.website && !profile.socialLinks?.twitter && (
                    <span style={{ fontSize: '.8rem', color: 'var(--muted)' }}>Bağlantı eklenmemiş.</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Beceriler */}
          <div className="card" style={{ marginTop: '1rem', padding: '1.5rem' }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', marginBottom: '1rem' }}>Beceriler</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.35rem', marginBottom: '1rem' }}>
              {profile.skills?.length === 0 && (
                <span style={{ color: 'var(--muted)', fontSize: '.85rem' }}>Henüz beceri eklenmemiş</span>
              )}
              {profile.skills?.map((s) => {
                const skillName = typeof s === 'string' ? s : s.name;
                const skillLevel = typeof s === 'string' ? null : s.level;
                return (
                  <span key={skillName} className="chip chip-indigo" style={{ gap: '.25rem' }}>
                    {skillName}
                    {skillLevel && (
                      <span style={{ fontSize: '.65rem', opacity: 0.7, fontWeight: 400 }}>
                        · {skillLevel === 'expert' ? 'uzman' : skillLevel === 'intermediate' ? 'orta' : 'başlangıç'}
                      </span>
                    )}
                    {isMe && (
                      <button
                        onClick={() => removeSkill(skillName)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontWeight: 700, padding: 0, lineHeight: 1 }}
                      >
                        ×
                      </button>
                    )}
                  </span>
                );
              })}
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

          {/* Eğitim */}
          {(isMe || profile.education?.length > 0) && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontFamily: 'Syne, sans-serif' }}>Eğitim</h3>
                {isMe && <button className="btn btn-primary btn-sm" onClick={() => setShowEduModal(true)}>+ Ekle</button>}
              </div>
              {!profile.education?.length ? (
                <p style={{ fontSize: '.875rem', color: 'var(--muted)' }}>{isMe ? 'Eğitim bilgisi eklenmemiş.' : 'Paylaşılmamış.'}</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {profile.education.map((edu) => (
                    <div key={edu._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '.75rem', borderRadius: '.5rem', border: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '.9rem' }}>{edu.institution}</div>
                        <div style={{ fontSize: '.8rem', color: 'var(--muted)' }}>{DEGREE_LABELS[edu.degree] || edu.degree} · {edu.field}</div>
                        <div style={{ fontSize: '.75rem', color: 'var(--muted)' }}>{edu.startYear}{edu.endYear ? ` — ${edu.endYear}` : ' — devam'}{edu.gpa ? ` · GPA: ${edu.gpa}` : ''}</div>
                      </div>
                      {isMe && <button onClick={() => removeEducation(edu._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1rem' }}>✕</button>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Deneyim */}
          {(isMe || profile.experience?.length > 0) && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontFamily: 'Syne, sans-serif' }}>Deneyim</h3>
                {isMe && <button className="btn btn-primary btn-sm" onClick={() => setShowExpModal(true)}>+ Ekle</button>}
              </div>
              {!profile.experience?.length ? (
                <p style={{ fontSize: '.875rem', color: 'var(--muted)' }}>{isMe ? 'Deneyim bilgisi eklenmemiş.' : 'Paylaşılmamış.'}</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {profile.experience.map((exp) => (
                    <div key={exp._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '.75rem', borderRadius: '.5rem', border: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '.9rem' }}>{exp.title}</div>
                        <div style={{ fontSize: '.8rem', color: 'var(--muted)' }}>{exp.company} · {EXP_TYPE_LABELS[exp.type] || exp.type}</div>
                        <div style={{ fontSize: '.75rem', color: 'var(--muted)' }}>{exp.startDate?.slice(0, 7)}{exp.isCurrent ? ' — Devam ediyor' : exp.endDate ? ` — ${exp.endDate.slice(0, 7)}` : ''}</div>
                        {exp.description && <p style={{ fontSize: '.8rem', marginTop: '.35rem' }}>{exp.description}</p>}
                      </div>
                      {isMe && <button onClick={() => removeExperience(exp._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1rem' }}>✕</button>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sertifikalar */}
          {(isMe || profile.certifications?.length > 0) && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontFamily: 'Syne, sans-serif' }}>Sertifikalar</h3>
                {isMe && <button className="btn btn-primary btn-sm" onClick={() => setShowCertModal(true)}>+ Ekle</button>}
              </div>
              {!profile.certifications?.length ? (
                <p style={{ fontSize: '.875rem', color: 'var(--muted)' }}>{isMe ? 'Sertifika eklenmemiş.' : 'Paylaşılmamış.'}</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                  {profile.certifications.map((cert) => (
                    <div key={cert._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '.75rem', borderRadius: '.5rem', border: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '.9rem' }}>{cert.name}</div>
                        <div style={{ fontSize: '.8rem', color: 'var(--muted)' }}>{cert.issuer}{cert.issueDate ? ` · ${cert.issueDate.slice(0, 7)}` : ''}</div>
                        {cert.credentialUrl && <a href={cert.credentialUrl} target="_blank" rel="noreferrer" style={{ fontSize: '.75rem', color: 'var(--accent)', fontWeight: 600 }}>🔗 Doğrula</a>}
                      </div>
                      {isMe && <button onClick={() => removeCertification(cert._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1rem' }}>✕</button>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Diller */}
          {profile.languages?.length > 0 && (
            <div className="card">
              <h3 style={{ fontFamily: 'Syne, sans-serif', marginBottom: '1rem' }}>Diller</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
                {profile.languages.map((lang, i) => (
                  <span key={i} className="chip chip-indigo">{lang.name} <span style={{ opacity: .7, fontSize: '.7rem' }}>· {LANG_LEVEL_LABELS[lang.level] || lang.level}</span></span>
                ))}
              </div>
            </div>
          )}

          {/* Takım üyelikleri */}
          {profile.teamMemberships?.length > 0 && (
            <div className="card">
              <h3 style={{ fontFamily: 'Syne, sans-serif', marginBottom: '1rem' }}>Proje Üyelikleri</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                {profile.teamMemberships.map((tm, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.6rem .75rem', borderRadius: '.5rem', border: '1px solid var(--border)' }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '.875rem' }}>{tm.project?.title || 'Proje'}</span>
                      <span style={{ fontSize: '.75rem', color: 'var(--muted)', marginLeft: '.5rem' }}>{tm.role}</span>
                    </div>
                    <span className={`chip ${tm.status === 'active' ? 'chip-lime' : 'chip-slate'}`} style={{ fontSize: '.65rem' }}>{tm.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Kullanıcının ilanları */}
          <div className="card">
            <h3 style={{ fontFamily: 'Syne, sans-serif', marginBottom: '1rem' }}>Hizmet ilanları</h3>
            {userServices.length === 0 ? (
              <p style={{ fontSize: '.875rem', color: 'var(--muted)' }}>Listeleyen kullanıcı hizmeti yok.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                {userServices.map((s) => (
                  <Link key={s._id} to={`/detail/service/${s._id}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '.75rem', borderRadius: '.5rem', border: '1px solid var(--border)', textDecoration: 'none', color: 'inherit' }}>
                    <span style={{ fontWeight: 600 }}>{s.title}</span>
                    <span style={{ color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>₺{s.price}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h3 style={{ fontFamily: 'Syne, sans-serif', marginBottom: '1rem' }}>Proje ilanları</h3>
            {userProjects.length === 0 ? (
              <p style={{ fontSize: '.875rem', color: 'var(--muted)' }}>Listeleyen kullanıcı proje ilanı yok.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                {userProjects.map((p) => (
                  <Link key={p._id} to={`/detail/project/${p._id}`} style={{ padding: '.75rem', borderRadius: '.5rem', border: '1px solid var(--border)', textDecoration: 'none', color: 'inherit' }}>
                    <span style={{ fontWeight: 600 }}>{p.title}</span>
                    <span className={`chip ${p.status === 'recruiting' ? 'chip-lime' : 'chip-slate'}`} style={{ fontSize: '.65rem', marginLeft: '.5rem' }}>
                      {p.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h3 style={{ fontFamily: 'Syne, sans-serif', marginBottom: '1rem' }}>İhtiyaç ilanları</h3>
            {userNeeds.length === 0 ? (
              <p style={{ fontSize: '.875rem', color: 'var(--muted)' }}>Listeleyen kullanıcı ihtiyaç ilanı yok.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                {userNeeds.map((n) => (
                  <Link key={n._id} to={`/detail/need/${n._id}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '.75rem', borderRadius: '.5rem', border: '1px solid var(--border)', textDecoration: 'none', color: 'inherit' }}>
                    <span style={{ fontWeight: 600 }}>{n.title}</span>
                    <span style={{ color: 'var(--muted)', fontSize: '.85rem' }}>₺{n.budget}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

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

      {/* ──────── EĞİTİM MODAL ──────── */}
      {showEduModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }} onClick={(e) => e.target === e.currentTarget && setShowEduModal(false)}>
          <div className="card" style={{ width: '100%', maxWidth: 480, padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif' }}>Eğitim Ekle</h3>
              <button onClick={() => setShowEduModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--muted)' }}>✕</button>
            </div>
            <form onSubmit={handleAddEducation}>
              <div className="form-group"><label className="form-label">Kurum *</label><input className="form-control" required value={eduForm.institution} onChange={(e) => setEduForm((f) => ({ ...f, institution: e.target.value }))} placeholder="Üniversite adı" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group"><label className="form-label">Derece</label><select className="form-control" value={eduForm.degree} onChange={(e) => setEduForm((f) => ({ ...f, degree: e.target.value }))}>{Object.entries(DEGREE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Alan</label><input className="form-control" value={eduForm.field} onChange={(e) => setEduForm((f) => ({ ...f, field: e.target.value }))} placeholder="Bilgisayar Müh." /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group"><label className="form-label">Başlangıç</label><input className="form-control" type="number" placeholder="2020" value={eduForm.startYear} onChange={(e) => setEduForm((f) => ({ ...f, startYear: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Bitiş</label><input className="form-control" type="number" placeholder="2024" value={eduForm.endYear} onChange={(e) => setEduForm((f) => ({ ...f, endYear: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">GPA</label><input className="form-control" type="number" step="0.01" placeholder="3.5" value={eduForm.gpa} onChange={(e) => setEduForm((f) => ({ ...f, gpa: e.target.value }))} /></div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '.5rem' }}>
                <button className="btn btn-primary" type="submit" disabled={cvLoading}>{cvLoading ? 'Ekleniyor…' : 'Ekle'}</button>
                <button className="btn btn-secondary" type="button" onClick={() => setShowEduModal(false)}>İptal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────── DENEYİM MODAL ──────── */}
      {showExpModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }} onClick={(e) => e.target === e.currentTarget && setShowExpModal(false)}>
          <div className="card" style={{ width: '100%', maxWidth: 500, padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif' }}>Deneyim Ekle</h3>
              <button onClick={() => setShowExpModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--muted)' }}>✕</button>
            </div>
            <form onSubmit={handleAddExperience}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group"><label className="form-label">Pozisyon *</label><input className="form-control" required value={expForm.title} onChange={(e) => setExpForm((f) => ({ ...f, title: e.target.value }))} placeholder="Frontend Developer" /></div>
                <div className="form-group"><label className="form-label">Şirket *</label><input className="form-control" required value={expForm.company} onChange={(e) => setExpForm((f) => ({ ...f, company: e.target.value }))} placeholder="Şirket adı" /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group"><label className="form-label">Tür</label><select className="form-control" value={expForm.type} onChange={(e) => setExpForm((f) => ({ ...f, type: e.target.value }))}>{Object.entries(EXP_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Başlangıç</label><input className="form-control" type="date" value={expForm.startDate} onChange={(e) => setExpForm((f) => ({ ...f, startDate: e.target.value }))} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group"><label className="form-label">Bitiş</label><input className="form-control" type="date" value={expForm.endDate} disabled={expForm.isCurrent} onChange={(e) => setExpForm((f) => ({ ...f, endDate: e.target.value }))} /></div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '.5rem', paddingTop: '1.75rem' }}>
                  <input type="checkbox" id="isCurrent" checked={expForm.isCurrent} onChange={(e) => setExpForm((f) => ({ ...f, isCurrent: e.target.checked, endDate: '' }))} />
                  <label htmlFor="isCurrent" style={{ fontSize: '.875rem', cursor: 'pointer' }}>Hâlâ devam ediyor</label>
                </div>
              </div>
              <div className="form-group"><label className="form-label">Açıklama</label><textarea className="form-control" rows={2} value={expForm.description} onChange={(e) => setExpForm((f) => ({ ...f, description: e.target.value }))} placeholder="Kısa açıklama…" /></div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '.5rem' }}>
                <button className="btn btn-primary" type="submit" disabled={cvLoading}>{cvLoading ? 'Ekleniyor…' : 'Ekle'}</button>
                <button className="btn btn-secondary" type="button" onClick={() => setShowExpModal(false)}>İptal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────── SERTİFİKA MODAL ──────── */}
      {showCertModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }} onClick={(e) => e.target === e.currentTarget && setShowCertModal(false)}>
          <div className="card" style={{ width: '100%', maxWidth: 440, padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif' }}>Sertifika Ekle</h3>
              <button onClick={() => setShowCertModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--muted)' }}>✕</button>
            </div>
            <form onSubmit={handleAddCertification}>
              <div className="form-group"><label className="form-label">Sertifika Adı *</label><input className="form-control" required value={certForm.name} onChange={(e) => setCertForm((f) => ({ ...f, name: e.target.value }))} placeholder="AWS Solutions Architect" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group"><label className="form-label">Veren Kurum</label><input className="form-control" value={certForm.issuer} onChange={(e) => setCertForm((f) => ({ ...f, issuer: e.target.value }))} placeholder="Amazon" /></div>
                <div className="form-group"><label className="form-label">Tarih</label><input className="form-control" type="date" value={certForm.issueDate} onChange={(e) => setCertForm((f) => ({ ...f, issueDate: e.target.value }))} /></div>
              </div>
              <div className="form-group"><label className="form-label">Doğrulama URL</label><input className="form-control" type="url" value={certForm.credentialUrl} onChange={(e) => setCertForm((f) => ({ ...f, credentialUrl: e.target.value }))} placeholder="https://…" /></div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '.5rem' }}>
                <button className="btn btn-primary" type="submit" disabled={cvLoading}>{cvLoading ? 'Ekleniyor…' : 'Ekle'}</button>
                <button className="btn btn-secondary" type="button" onClick={() => setShowCertModal(false)}>İptal</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
