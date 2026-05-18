import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authAPI } from '../api/client.js';
import useAuthStore from '../store/authStore.js';

const RULES = {
  firstName: { required: true, min: 2 },
  lastName: { required: true, min: 2 },
  email: { required: true, email: true },
  password: { required: true, min: 6 },
};

function validate(fields, rules) {
  const errors = {};
  for (const [key, rule] of Object.entries(rules)) {
    const val = (fields[key] || '').trim();
    if (rule.required && !val) { errors[key] = 'Bu alan zorunludur'; continue; }
    if (rule.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) { errors[key] = 'Geçerli bir e-posta girin'; continue; }
    if (rule.min && val.length < rule.min) { errors[key] = `En az ${rule.min} karakter giriniz`; }
  }
  return errors;
}

export default function Auth() {
  const [params] = useSearchParams();
  const [tab, setTab] = useState(params.get('tab') === 'register' ? 'register' : 'login');

  useEffect(() => {
    setTab(params.get('tab') === 'register' ? 'register' : 'login');
  }, [params]);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [apiErrorCode, setApiErrorCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, token } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => { if (token) navigate('/dashboard'); }, [token]);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: '' }));
    setApiError('');
    setApiErrorCode('');
  }

  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    const errs = validate(form, { email: RULES.email, password: RULES.password });
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const { data } = await authAPI.login({ email: form.email, password: form.password });
      login(data.accessToken, data.user);
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.error || 'Giriş başarısız');
      setApiErrorCode(err.response?.data?.code || '');
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot(e) {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setLoading(true);
    try {
      await authAPI.forgotPassword(forgotEmail.trim());
      setForgotSent(true);
    } catch {
      setForgotSent(true); // Güvenlik: hata olsa da aynı mesajı göster
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    const errs = validate(form, RULES);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const { data } = await authAPI.register(form);
      login(data.accessToken, data.user);
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.error || 'Kayıt başarısız');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.6rem', color: 'var(--accent)' }}>StudentHub</Link>
          <p style={{ color: 'var(--muted)', marginTop: '.5rem', fontSize: '.95rem' }}>Öğrenci ekonomisi platformu</p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '1.75rem' }}>
            {['login', 'register'].map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setErrors({}); setApiError(''); }}
                style={{
                  flex: 1, padding: '.75rem', background: 'none', border: 'none',
                  fontFamily: 'Syne, sans-serif', fontWeight: 600,
                  color: tab === t ? 'var(--accent)' : 'var(--muted)',
                  borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
                  marginBottom: -1,
                  cursor: 'pointer',
                  transition: 'color .15s',
                }}
              >
                {t === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
              </button>
            ))}
          </div>

          {apiError && (
            <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '.5rem', padding: '.75rem 1rem', marginBottom: '1rem', color: 'var(--coral)', fontSize: '.9rem' }}>
              {apiError}
              {apiErrorCode === 'EMAIL_NOT_FOUND' && (
                <div style={{ marginTop: '.5rem' }}>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 600, cursor: 'pointer', fontSize: '.875rem', padding: 0 }}
                    onClick={() => { setTab('register'); setApiError(''); setApiErrorCode(''); setForm((f) => ({ ...f, email: form.email })); }}
                  >
                    Kayıt ol →
                  </button>
                </div>
              )}
              {apiErrorCode === 'WRONG_PASSWORD' && (
                <div style={{ marginTop: '.5rem' }}>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 600, cursor: 'pointer', fontSize: '.875rem', padding: 0 }}
                    onClick={() => { setForgotMode(true); setApiError(''); setApiErrorCode(''); setForgotEmail(form.email); }}
                  >
                    Şifremi unuttum →
                  </button>
                </div>
              )}
            </div>
          )}

          {tab === 'login' && forgotMode ? (
            forgotSent ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📬</div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', marginBottom: '.5rem' }}>Mail gönderildi!</h3>
                <p style={{ color: 'var(--muted)', fontSize: '.9rem', marginBottom: '1.5rem' }}>
                  E-posta adresin kayıtlıysa sıfırlama bağlantısı gönderildi. Spam klasörünü de kontrol et.
                </p>
                <button className="btn btn-secondary w-full" style={{ justifyContent: 'center' }} onClick={() => { setForgotMode(false); setForgotSent(false); setForgotEmail(''); }}>
                  Giriş ekranına dön
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgot}>
                <p style={{ color: 'var(--muted)', fontSize: '.875rem', marginBottom: '1.25rem' }}>
                  Kayıtlı e-posta adresini gir, sıfırlama bağlantısı gönderelim.
                </p>
                <div className="form-group">
                  <label className="form-label">E-posta</label>
                  <input className="form-control" type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="ornek@email.com" required />
                </div>
                <button className="btn btn-primary w-full" type="submit" disabled={loading} style={{ justifyContent: 'center', marginBottom: '.75rem' }}>
                  {loading ? 'Gönderiliyor…' : 'Sıfırlama Bağlantısı Gönder'}
                </button>
                <button type="button" className="btn btn-ghost w-full" style={{ justifyContent: 'center', fontSize: '.875rem' }} onClick={() => setForgotMode(false)}>
                  ← Geri dön
                </button>
              </form>
            )
          ) : tab === 'login' ? (
            <form onSubmit={handleLogin}>
              <Field label="E-posta" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} />
              <Field label="Şifre" name="password" type="password" value={form.password} onChange={handleChange} error={errors.password} />
              <button className="btn btn-primary w-full" type="submit" disabled={loading} style={{ marginTop: '.5rem', justifyContent: 'center' }}>
                {loading ? 'Giriş yapılıyor…' : 'Giriş Yap'}
              </button>
              <button type="button" onClick={() => { setForgotMode(true); setApiError(''); }} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '.85rem', cursor: 'pointer', marginTop: '.75rem', width: '100%', textAlign: 'center' }}>
                Şifremi unuttum
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Field label="Ad" name="firstName" value={form.firstName} onChange={handleChange} error={errors.firstName} />
                <Field label="Soyad" name="lastName" value={form.lastName} onChange={handleChange} error={errors.lastName} />
              </div>
              <Field label="E-posta" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} />
              <Field label="Şifre" name="password" type="password" value={form.password} onChange={handleChange} error={errors.password} />
              <button className="btn btn-primary w-full" type="submit" disabled={loading} style={{ marginTop: '.5rem', justifyContent: 'center' }}>
                {loading ? 'Kaydediliyor…' : 'Hesap Oluştur'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, name, type = 'text', value, onChange, error }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input className={`form-control${error ? ' error' : ''}`} type={type} name={name} value={value} onChange={onChange} />
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
