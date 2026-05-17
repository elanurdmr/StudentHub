import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reviewsAPI } from '../api/client.js';

export default function ReviewForm() {
  const { targetId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (rating === 0) { setError('Lütfen bir puan seçin'); return; }
    setLoading(true);
    setError('');
    try {
      await reviewsAPI.create({ target: targetId, rating, comment });
      navigate(`/profile/${targetId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Değerlendirme gönderilemedi');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div className="card" style={{ padding: '2.5rem' }}>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.5rem', marginBottom: '.5rem' }}>
            Değerlendirme Yap
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '.9rem', marginBottom: '2rem' }}>
            Bu kullanıcıyla olan deneyiminizi paylaşın
          </p>

          {error && (
            <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '.5rem', padding: '.75rem 1rem', marginBottom: '1rem', color: 'var(--coral)', fontSize: '.9rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Puan *</label>
              <div style={{ display: 'flex', gap: '.5rem', marginTop: '.25rem' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: '2rem', lineHeight: 1,
                      color: star <= (hovered || rating) ? 'var(--amber)' : '#e2e8f0',
                      transition: 'color .1s',
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: '.35rem' }}>
                  {['', 'Çok Kötü', 'Kötü', 'Orta', 'İyi', 'Mükemmel'][rating]}
                </p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Yorumunuz</label>
              <textarea
                className="form-control"
                rows={4}
                placeholder="Deneyiminizi anlatın (isteğe bağlı)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '.5rem' }}>
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? 'Gönderiliyor…' : 'Değerlendirmeyi Gönder'}
              </button>
              <button className="btn btn-secondary" type="button" onClick={() => navigate(-1)}>
                Vazgeç
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
