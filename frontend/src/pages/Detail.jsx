import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { servicesAPI, needsAPI, projectsAPI, reportsAPI } from '../api/client.js';
import useAuthStore from '../store/authStore.js';
import Modal from '../components/ui/Modal.jsx';

export default function Detail() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [offerForm, setOfferForm] = useState({ price: '', description: '', deliveryDays: '' });
  const [applyForm, setApplyForm] = useState({ coverLetter: '' });
  const [error, setError] = useState('');
  const [isNarrow, setIsNarrow] = useState(window.innerWidth < 768);
  const [reported, setReported] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [cardForm, setCardForm] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [cardErrors, setCardErrors] = useState({});

  useEffect(() => {
    const handleResize = () => setIsNarrow(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setLoading(true);
    const api = type === 'service' ? servicesAPI.get(id)
      : type === 'need' ? needsAPI.get(id)
      : projectsAPI.get(id);
    api.then((r) => { setData(r.data); if (r.data.hasApplied) setHasApplied(true); }).catch(() => setError('İlan yüklenemedi. Lütfen sayfayı yenileyin.')).finally(() => setLoading(false));
  }, [type, id]);

  const owner = data?.owner || {};
  const isOwner = user && owner._id === user._id;

  async function handleCheckout() {
    setActionLoading(true);
    try {
      const { data: pi } = await servicesAPI.checkout(id);
      setPaymentIntent(pi);
      setModal('payment');
    } catch (err) {
      alert(err.response?.data?.error || 'Hata');
    } finally { setActionLoading(false); }
  }

  function formatCardNumber(val) {
    return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  }
  function formatExpiry(val) {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    return digits.length > 2 ? digits.slice(0, 2) + '/' + digits.slice(2) : digits;
  }
  function handleCardChange(e) {
    const { name, value } = e.target;
    let formatted = value;
    if (name === 'number') formatted = formatCardNumber(value);
    if (name === 'expiry') formatted = formatExpiry(value);
    if (name === 'cvv') formatted = value.replace(/\D/g, '').slice(0, 4);
    setCardForm((f) => ({ ...f, [name]: formatted }));
    setCardErrors((er) => ({ ...er, [name]: '' }));
  }
  function validateCard() {
    const errs = {};
    const digits = cardForm.number.replace(/\s/g, '');
    if (digits.length < 16) errs.number = 'Geçerli bir kart numarası girin';
    if (!/^\d{2}\/\d{2}$/.test(cardForm.expiry)) errs.expiry = 'AA/YY formatında girin';
    else {
      const [mm, yy] = cardForm.expiry.split('/').map(Number);
      const now = new Date();
      const exp = new Date(2000 + yy, mm - 1);
      if (mm < 1 || mm > 12 || exp < now) errs.expiry = 'Kartın süresi dolmuş';
    }
    if (cardForm.cvv.length < 3) errs.cvv = 'CVV 3-4 haneli olmalı';
    if (!cardForm.name.trim()) errs.name = 'Kart üzerindeki isim zorunlu';
    return errs;
  }

  async function handleConfirmPayment() {
    if (!paymentIntent) return;
    const errs = validateCard();
    if (Object.keys(errs).length) { setCardErrors(errs); return; }
    setActionLoading(true);
    try {
      await servicesAPI.confirmPayment(id, paymentIntent.paymentIntentId);
      setModal(null);
      setPaymentIntent(null);
      setCardForm({ number: '', expiry: '', cvv: '', name: '' });
      alert('Ödeme başarılı! Satın alma tamamlandı.');
    } catch (err) {
      alert(err.response?.data?.error || 'Ödeme başarısız');
    } finally { setActionLoading(false); }
  }

  async function handleOffer(e) {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    try {
      await needsAPI.makeOffer(id, { price: Number(offerForm.price), description: offerForm.description, deliveryDays: Number(offerForm.deliveryDays) || 7 });
      setModal(null);
      alert('Teklifiniz gönderildi!');
    } catch (err) {
      setError(err.response?.data?.error || 'Hata');
    } finally { setActionLoading(false); }
  }

  async function handleApply(e) {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    try {
      await projectsAPI.apply(id, { coverLetter: applyForm.coverLetter });
      setModal(null);
      setHasApplied(true);
      alert('Başvurunuz alındı!');
    } catch (err) {
      setError(err.response?.data?.error || 'Hata');
    } finally { setActionLoading(false); }
  }

  async function handleDelete() {
    if (!confirm('Bu ilanı silmek istediğinize emin misiniz?')) return;
    try {
      if (type === 'service') await servicesAPI.remove(id);
      else if (type === 'need') await needsAPI.remove(id);
      else await projectsAPI.remove(id);
      navigate(-1);
    } catch (err) {
      alert(err.response?.data?.error || 'Silme başarısız');
    }
  }

  async function acceptOffer(offerId) {
    try {
      await needsAPI.acceptOffer(id, offerId);
      const r = await needsAPI.get(id);
      setData(r.data);
    } catch (err) { alert(err.response?.data?.error || 'Hata'); }
  }

  async function rejectOffer(offerId) {
    try {
      await needsAPI.rejectOffer(id, offerId);
      const r = await needsAPI.get(id);
      setData(r.data);
    } catch (err) { alert(err.response?.data?.error || 'Hata'); }
  }

  async function handleReport() {
    if (reported) return;
    const reason = prompt('Şikayet sebebini kısaca yazın:');
    if (!reason?.trim()) return;
    await reportsAPI.create({ contentType: type, contentId: id, reason });
    setReported(true);
    alert('Şikayetiniz alındı. Teşekkür ederiz.');
  }

  if (loading) return <div className="empty-state" style={{ marginTop: '4rem' }}><p>Yükleniyor…</p></div>;
  if (!data) return (
    <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
      <div className="empty-state">
        <div className="icon">⚠️</div>
        <h3>İlan yüklenemedi</h3>
        <p style={{ color: 'var(--muted)' }}>{error || 'Bir hata oluştu.'}</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>Yenile</button>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>Geri Dön</button>
        </div>
      </div>
    </div>
  );

  const initials = owner.firstName ? `${owner.firstName[0]}${owner.lastName?.[0] || ''}`.toUpperCase() : '?';

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: isNarrow ? '1fr' : '1fr 320px', gap: '2rem', alignItems: 'start' }}>
        {/* Main content */}
        <div>
          <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span className="chip chip-indigo">{data.category}</span>
            {type === 'project' && (
              <span className={`chip ${data.status === 'recruiting' ? 'chip-lime' : 'chip-slate'}`}>
                {data.status === 'recruiting' ? 'Ekip Arıyor' : data.status === 'active' ? 'Aktif' : 'Tamamlandı'}
              </span>
            )}
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.75rem', marginBottom: '1rem' }}>{data.title}</h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '1.5rem' }}>
            <div className="avatar av-indigo">{owner.avatar ? <img src={owner.avatar} alt="" /> : initials}</div>
            <div>
              <Link to={`/profile/${owner._id}`} style={{ fontWeight: 600, color: 'var(--ink)' }}>
                {owner.firstName} {owner.lastName}
              </Link>
              {owner.rating > 0 && <div style={{ fontSize: '.8rem', color: 'var(--amber)' }}>★ {owner.rating} ({owner.reviewCount} değerlendirme)</div>}
            </div>
          </div>

          <div style={{ lineHeight: 1.8, color: 'var(--ink)', marginBottom: '1.5rem' }}>{data.description}</div>

          {type === 'project' && (
            <>
              {(data.collaborationType || data.isRemote !== undefined) && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginBottom: '1rem' }}>
                  {data.collaborationType && (
                    <span className="chip chip-violet">
                      {data.collaborationType === 'volunteer' ? 'Gönüllü' : data.collaborationType === 'academic' ? 'Akademik' : data.collaborationType === 'startup' ? 'Startup' : data.collaborationType === 'research' ? 'Araştırma' : 'Yarışma'}
                    </span>
                  )}
                  <span className={`chip ${data.isRemote ? 'chip-lime' : 'chip-slate'}`}>
                    {data.isRemote ? 'Uzaktan' : 'Yüz Yüze'}
                  </span>
                  {data.applicationDeadline && (
                    <span className="chip chip-amber">Son başvuru: {new Date(data.applicationDeadline).toLocaleDateString('tr-TR')}</span>
                  )}
                </div>
              )}
              {data.requiredSkills?.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontFamily: 'Syne, sans-serif', marginBottom: '.75rem' }}>Aranan Beceriler</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
                    {data.requiredSkills.map((s) => <span key={s} className="chip chip-violet">{s}</span>)}
                  </div>
                </div>
              )}
              {data.expectedTimeCommitment && (
                <div style={{ marginBottom: '1rem', fontSize: '.875rem', color: 'var(--muted)' }}>
                  Haftalık zaman: <strong>{data.expectedTimeCommitment}</strong>
                </div>
              )}
              {data.projectUrl && (
                <div style={{ marginBottom: '1rem' }}>
                  <a href={data.projectUrl} target="_blank" rel="noreferrer" style={{ fontSize: '.875rem', color: 'var(--accent)', fontWeight: 600 }}>🔗 Proje bağlantısı</a>
                </div>
              )}
            </>
          )}

          {/* Need offers list (for owner) */}
          {type === 'need' && isOwner && data.offers?.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', marginBottom: '1rem' }}>Teklifler ({data.offers.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {data.offers.map((o) => {
                  const off = o.offerer || {};
                  const oi = off.firstName ? `${off.firstName[0]}${off.lastName?.[0] || ''}`.toUpperCase() : '?';
                  return (
                    <div key={o._id} className="card" style={{ padding: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                          <div className="avatar av-teal" style={{ width: '2rem', height: '2rem', fontSize: '.75rem' }}>{oi}</div>
                          <span style={{ fontWeight: 600 }}>{off.firstName} {off.lastName}</span>
                        </div>
                        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--teal)', fontSize: '1.1rem' }}>₺{o.price}</span>
                      </div>
                      <p style={{ fontSize: '.9rem', color: 'var(--muted)', marginBottom: '.75rem' }}>{o.description}</p>
                      <div style={{ display: 'flex', gap: '.5rem' }}>
                        {o.status === 'pending' ? (
                          <>
                            <button className="btn btn-teal btn-sm" onClick={() => acceptOffer(o._id)}>Kabul Et</button>
                            <button className="btn btn-secondary btn-sm" style={{ color: 'var(--coral)' }} onClick={() => rejectOffer(o._id)}>Reddet</button>
                          </>
                        ) : (
                          <span className={`status-badge ${o.status === 'accepted' ? 'status-active' : 'status-rejected'}`}>
                            {o.status === 'accepted' ? 'Kabul Edildi' : 'Reddedildi'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ position: 'sticky', top: '80px' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            {type === 'service' && (
              <>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '2rem', color: 'var(--accent)', marginBottom: '.5rem' }}>₺{data.price}</div>
                <div style={{ fontSize: '.85rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>Teslim: {data.deliveryDays} gün</div>
                {isOwner ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                    <button className="btn btn-secondary w-full" onClick={() => navigate(`/create?edit=service&id=${id}`)}>Düzenle</button>
                    <button className="btn btn-secondary w-full" style={{ color: 'var(--coral)' }} onClick={handleDelete}>Sil</button>
                  </div>
                ) : user ? (
                  <>
                    <button className="btn btn-primary w-full" disabled={actionLoading} onClick={handleCheckout} style={{ justifyContent: 'center', marginBottom: '.5rem' }}>
                      {actionLoading ? 'İşleniyor…' : '💳 Satın Al'}
                    </button>
                    <Link to={`/review/${owner._id}`} className="btn btn-secondary w-full" style={{ justifyContent: 'center', marginTop: '.5rem' }}>
                      Değerlendir
                    </Link>
                  </>
                ) : (
                  <Link to="/auth" className="btn btn-primary w-full" style={{ justifyContent: 'center' }}>Giriş Yap</Link>
                )}
                {user && !isOwner && (
                  <button
                    onClick={handleReport}
                    disabled={reported}
                    style={{
                      marginTop: '.75rem', width: '100%',
                      background: 'none', border: '1px solid var(--border)',
                      borderRadius: '.5rem', padding: '.45rem', cursor: 'pointer',
                      color: reported ? 'var(--muted)' : 'var(--coral)',
                      fontSize: '.8rem',
                    }}
                  >
                    {reported ? '✓ Şikayet gönderildi' : '⚑ Şikayet et'}
                  </button>
                )}
              </>
            )}

            {type === 'need' && (
              <>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '2rem', color: 'var(--teal)', marginBottom: '.5rem' }}>₺{data.budget}</div>
                <div style={{ fontSize: '.85rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>Bütçe</div>
                {isOwner ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                    <button className="btn btn-secondary w-full" onClick={handleDelete} style={{ color: 'var(--coral)' }}>İlanı Kapat</button>
                  </div>
                ) : user ? (
                  <button className="btn btn-teal w-full" style={{ justifyContent: 'center' }} onClick={() => setModal('offer')}>
                    Teklif Ver
                  </button>
                ) : (
                  <Link to="/auth" className="btn btn-primary w-full" style={{ justifyContent: 'center' }}>Giriş Yap</Link>
                )}
                {user && !isOwner && (
                  <button
                    onClick={handleReport}
                    disabled={reported}
                    style={{
                      marginTop: '.75rem', width: '100%',
                      background: 'none', border: '1px solid var(--border)',
                      borderRadius: '.5rem', padding: '.45rem', cursor: 'pointer',
                      color: reported ? 'var(--muted)' : 'var(--coral)',
                      fontSize: '.8rem',
                    }}
                  >
                    {reported ? '✓ Şikayet gönderildi' : '⚑ Şikayet et'}
                  </button>
                )}
              </>
            )}

            {type === 'project' && (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '.8rem', color: 'var(--muted)' }}>Ekip büyüklüğü</div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.25rem' }}>{data.teamSize} kişi</div>
                </div>
                {data.members?.length > 0 && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '.8rem', color: 'var(--muted)', marginBottom: '.5rem' }}>Ekip Üyeleri ({data.members.length})</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
                      {data.members.map((m, i) => (
                        <div key={m.user?._id || i} style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.7rem', color: '#fff', fontWeight: 700, flexShrink: 0, overflow: 'hidden' }}>
                            {m.user?.avatar
                              ? <img src={m.user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : `${m.user?.firstName?.[0] || '?'}${m.user?.lastName?.[0] || ''}`}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '.82rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {m.user?.firstName} {m.user?.lastName}
                            </div>
                            <div style={{ fontSize: '.72rem', color: 'var(--muted)' }}>{m.role || 'Üye'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {data.duration && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '.8rem', color: 'var(--muted)' }}>Süre</div>
                    <div style={{ fontWeight: 600 }}>{data.duration}</div>
                  </div>
                )}
                {isOwner ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                    <Link to={`/applications/${id}`} className="btn btn-primary w-full" style={{ justifyContent: 'center' }}>Başvuruları Gör</Link>
                    <button className="btn btn-secondary w-full" style={{ color: 'var(--coral)' }} onClick={handleDelete}>Sil</button>
                  </div>
                ) : user ? (
                  hasApplied
                    ? <button className="btn w-full" style={{ justifyContent: 'center', background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--muted)', cursor: 'default' }} disabled>✓ Başvuruldu</button>
                    : <button className="btn btn-accent2 w-full" style={{ justifyContent: 'center' }} onClick={() => setModal('apply')}>Başvur</button>
                ) : (
                  <Link to="/auth" className="btn btn-primary w-full" style={{ justifyContent: 'center' }}>Giriş Yap</Link>
                )}
                {user && !isOwner && (
                  <button
                    onClick={handleReport}
                    disabled={reported}
                    style={{
                      marginTop: '.75rem', width: '100%',
                      background: 'none', border: '1px solid var(--border)',
                      borderRadius: '.5rem', padding: '.45rem', cursor: 'pointer',
                      color: reported ? 'var(--muted)' : 'var(--coral)',
                      fontSize: '.8rem',
                    }}
                  >
                    {reported ? '✓ Şikayet gönderildi' : '⚑ Şikayet et'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Offer modal */}
      <Modal open={modal === 'offer'} onClose={() => setModal(null)} title="Teklif Ver">
        {error && <p style={{ color: 'var(--coral)', marginBottom: '1rem', fontSize: '.9rem' }}>{error}</p>}
        <form onSubmit={handleOffer}>
          <div className="form-group">
            <label className="form-label">Teklifiniz (₺)</label>
            <input className="form-control" type="number" min="1" value={offerForm.price} onChange={(e) => setOfferForm((f) => ({ ...f, price: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Açıklama</label>
            <textarea className="form-control" rows={3} value={offerForm.description} onChange={(e) => setOfferForm((f) => ({ ...f, description: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Teslim Süresi (gün)</label>
            <input className="form-control" type="number" min="1" value={offerForm.deliveryDays} onChange={(e) => setOfferForm((f) => ({ ...f, deliveryDays: e.target.value }))} />
          </div>
          <button className="btn btn-teal" type="submit" disabled={actionLoading}>{actionLoading ? 'Gönderiliyor…' : 'Teklifi Gönder'}</button>
        </form>
      </Modal>

      {/* Apply modal */}
      <Modal open={modal === 'apply'} onClose={() => setModal(null)} title="Projeye Başvur">
        {error && <p style={{ color: 'var(--coral)', marginBottom: '1rem', fontSize: '.9rem' }}>{error}</p>}
        <form onSubmit={handleApply}>
          <div className="form-group">
            <label className="form-label">Ön yazı</label>
            <textarea className="form-control" rows={5} placeholder="Kendinizi ve katkınızı kısaca anlatın..." value={applyForm.coverLetter} onChange={(e) => setApplyForm({ coverLetter: e.target.value })} />
          </div>
          <button className="btn btn-accent2" type="submit" disabled={actionLoading}>{actionLoading ? 'Gönderiliyor…' : 'Başvuruyu Gönder'}</button>
        </form>
      </Modal>

      {/* Payment modal */}
      <Modal open={modal === 'payment'} onClose={() => { setModal(null); setPaymentIntent(null); setCardForm({ number: '', expiry: '', cvv: '', name: '' }); setCardErrors({}); }} title="Ödemeyi Tamamla">
        {paymentIntent && (
          <div>
            {/* Özet */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '.75rem', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '.2rem' }}>Satın alınan hizmet</div>
                <div style={{ fontWeight: 700, fontSize: '.95rem' }}>{paymentIntent.serviceName}</div>
              </div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: 'var(--accent)' }}>₺{paymentIntent.amount}</div>
            </div>

            {/* Kart formu */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Kart Üzerindeki İsim</label>
                <input className={`form-control${cardErrors.name ? ' error' : ''}`} name="name" placeholder="AD SOYAD" value={cardForm.name} onChange={handleCardChange} autoComplete="cc-name" />
                {cardErrors.name && <p className="form-error">{cardErrors.name}</p>}
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Kart Numarası</label>
                <div style={{ position: 'relative' }}>
                  <input className={`form-control${cardErrors.number ? ' error' : ''}`} name="number" placeholder="0000 0000 0000 0000" value={cardForm.number} onChange={handleCardChange} autoComplete="cc-number" inputMode="numeric" style={{ paddingRight: '2.5rem', letterSpacing: '.1em' }} />
                  <span style={{ position: 'absolute', right: '.75rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem' }}>💳</span>
                </div>
                {cardErrors.number && <p className="form-error">{cardErrors.number}</p>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Son Kullanma</label>
                  <input className={`form-control${cardErrors.expiry ? ' error' : ''}`} name="expiry" placeholder="AA/YY" value={cardForm.expiry} onChange={handleCardChange} autoComplete="cc-exp" inputMode="numeric" />
                  {cardErrors.expiry && <p className="form-error">{cardErrors.expiry}</p>}
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">CVV</label>
                  <input className={`form-control${cardErrors.cvv ? ' error' : ''}`} name="cvv" placeholder="•••" value={cardForm.cvv} onChange={handleCardChange} autoComplete="cc-csc" inputMode="numeric" type="password" />
                  {cardErrors.cvv && <p className="form-error">{cardErrors.cvv}</p>}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.75rem', color: 'var(--muted)', margin: '1.25rem 0 .75rem' }}>
              🔒 256-bit SSL ile şifrelenmiş güvenli ödeme
            </div>

            <button className="btn btn-primary w-full" disabled={actionLoading} onClick={handleConfirmPayment} style={{ justifyContent: 'center' }}>
              {actionLoading ? 'İşleniyor…' : `₺${paymentIntent.amount} Öde`}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
