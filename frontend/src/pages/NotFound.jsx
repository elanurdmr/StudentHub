import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(124,58,237,0.06))',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div>
        <div
          style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 800,
            fontSize: 'clamp(5rem, 15vw, 9rem)',
            color: 'var(--accent)',
            lineHeight: 1,
            marginBottom: '1rem',
          }}
        >
          404
        </div>
        <h1
          style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 700,
            fontSize: '1.75rem',
            marginBottom: '.75rem',
            color: 'var(--ink)',
          }}
        >
          Sayfa bulunamadı
        </h1>
        <p style={{ color: 'var(--muted)', marginBottom: '2rem', maxWidth: 380, margin: '0 auto 2rem' }}>
          Aradığınız sayfa taşınmış, silinmiş ya da hiç var olmamış olabilir.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary">
            Ana Sayfaya Dön
          </Link>
          <Link to="/market" className="btn btn-secondary">
            Hizmetlere Bak
          </Link>
        </div>
      </div>
    </div>
  );
}
