import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/client.js';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Şifre en az 6 karakter olmalıdır'); return; }
    if (password !== confirm) { setError('Şifreler eşleşmiyor'); return; }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Bir hata oluştu. Bağlantı geçersiz veya süresi dolmuş olabilir.');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="card" style={{ maxWidth: 400, width: '100%', padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
          <h3 style={{ fontFamily: 'Syne, sans-serif', marginBottom: '.5rem' }}>Geçersiz bağlantı</h3>
          <p style={{ color: 'var(--muted)', fontSize: '.9rem', marginBottom: '1.5rem' }}>Bu şifre sıfırlama bağlantısı geçersiz.</p>
          <Link to="/auth" className="btn btn-primary w-full" style={{ justifyContent: 'center' }}>Giriş Sayfasına Dön</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.6rem', color: 'var(--accent)' }}>StudentHub</Link>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          {success ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✅</div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', marginBottom: '.5rem' }}>Şifre güncellendi!</h3>
              <p style={{ color: 'var(--muted)', fontSize: '.9rem', marginBottom: '1.5rem' }}>
                Yeni şifrenle giriş yapabilirsin.
              </p>
              <Link to="/auth" className="btn btn-primary w-full" style={{ justifyContent: 'center' }}>
                Giriş Yap
              </Link>
            </div>
          ) : (
            <>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.25rem', marginBottom: '.5rem' }}>
                Yeni Şifre Belirle
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: '.875rem', marginBottom: '1.5rem' }}>
                En az 6 karakter kullan.
              </p>

              {error && (
                <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '.5rem', padding: '.75rem 1rem', marginBottom: '1rem', color: 'var(--coral)', fontSize: '.9rem' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Yeni Şifre</label>
                  <input
                    className="form-control"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="En az 6 karakter"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Şifre Tekrar</label>
                  <input
                    className="form-control"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Şifreyi tekrar gir"
                    required
                  />
                </div>
                <button className="btn btn-primary w-full" type="submit" disabled={loading} style={{ marginTop: '.5rem', justifyContent: 'center' }}>
                  {loading ? 'Kaydediliyor…' : 'Şifremi Güncelle'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
