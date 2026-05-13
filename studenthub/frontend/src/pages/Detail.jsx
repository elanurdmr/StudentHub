import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { servicesAPI, needsAPI, projectsAPI } from '../api/client.js';
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

  useEffect(() => {
    setLoading(true);
    const api = type === 'service' ? servicesAPI.get(id)
      : type === 'need' ? needsAPI.get(id)
      : projectsAPI.get(id);
    api.then((r) => setData(r.data)).catch(() => navigate(-1)).finally(() => setLoading(false));
  }, [type, id]);

  const owner = data?.owner || {};
  const isOwner = user && owner._id === user._id;

  async function handlePurchase() {
    setActionLoading(true);
    try {
      await servicesAPI.purchase(id);
      alert('Satın alma başarılı!');
    } catch (err) {
      alert(err.response?.data?.error || 'Hata');
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

  if (loading) return <div className="empty-state" style={{ marginTop: '4rem' }}><p>Yükleniyor…</p></div>;
  if (!data) return null;

  const initials = owner.firstName ? `${owner.firstName[0]}${owner.lastName?.[0] || ''}`.toUpperCase() : '?';

  const isNarrow = typeof window !== 'undefined' && window.innerWidth < 768;

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

          {type === 'project' && data.requiredSkills?.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', marginBottom: '.75rem' }}>Aranan Beceriler</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
                {data.requiredSkills.map((s) => <span key={s} className="chip chip-violet">{s}</span>)}
              </div>
            </div>
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
                    <button className="btn btn-primary w-full" disabled={actionLoading} onClick={handlePurchase} style={{ justifyContent: 'center', marginBottom: '.5rem' }}>
                      {actionLoading ? 'İşleniyor…' : 'Satın Al'}
                    </button>
                    <Link to={`/review/${owner._id}`} className="btn btn-secondary w-full" style={{ justifyContent: 'center', marginTop: '.5rem' }}>
                      Değerlendir
                    </Link>
                  </>
                ) : (
                  <Link to="/auth" className="btn btn-primary w-full" style={{ justifyContent: 'center' }}>Giriş Yap</Link>
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
              </>
            )}

            {type === 'project' && (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '.8rem', color: 'var(--muted)' }}>Ekip büyüklüğü</div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.25rem' }}>{data.teamSize} kişi</div>
                </div>
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
                  <button className="btn btn-accent2 w-full" style={{ justifyContent: 'center' }} onClick={() => setModal('apply')}>
                    Başvur
                  </button>
                ) : (
                  <Link to="/auth" className="btn btn-primary w-full" style={{ justifyContent: 'center' }}>Giriş Yap</Link>
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
    </div>
  );
}
