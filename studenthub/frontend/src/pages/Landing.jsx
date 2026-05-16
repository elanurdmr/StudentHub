import { Link } from 'react-router-dom';

const features = [
  { icon: '🛍', title: 'Hizmet Pazarı', desc: 'Tasarım, yazılım, akademik destek ve daha fazlasını sat veya satın al.', color: '#eef2ff', accent: '#4f46e5', link: '/market' },
  { icon: '🤝', title: 'Proje Ekibi', desc: 'Proje için ekip kur ya da bir ekibe katıl. Skill matching ile otomatik öneri.', color: '#f5f3ff', accent: '#7c3aed', link: '/projects' },
  { icon: '📢', title: 'İhtiyaç İlanı', desc: 'İhtiyacını ilan et, teklifleri al, içlerinden en iyisini seç.', color: '#fff1f2', accent: '#f43f5e', link: '/needs' },
];

const stats = [
  { value: '2,400+', label: 'Aktif Öğrenci' },
  { value: '1,800+', label: 'Tamamlanan İş' },
  { value: '340+', label: 'Proje Ekibi' },
  { value: '4.8★', label: 'Ortalama Puan' },
];

export default function Landing() {
  return (
    <div>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg,#eef2ff 0%,#f5f3ff 50%,#fdf4ff 100%)', padding: '6rem 1.5rem 5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div className="chip chip-indigo" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
            Öğrenci Ekonomisi Platformu
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(2rem,5vw,3.5rem)', lineHeight: 1.15, marginBottom: '1.5rem' }}>
            Becerini sat, <span style={{ color: 'var(--accent)' }}>ekip kur</span>, ilerle
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--muted)', marginBottom: '2.5rem', lineHeight: 1.7 }}>
            StudentHub, öğrencilerin hizmet satıp alabileceği, proje ekibi kurabileceği ve ihtiyaçlarını ilan edebileceği kapsamlı bir platform.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/auth?tab=register" className="btn btn-primary btn-lg">Ücretsiz Kaydol</Link>
            <Link to="/market" className="btn btn-ghost btn-lg">Hizmetleri Keşfet</Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: 'var(--ink)', padding: '2.5rem 1.5rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', textAlign: 'center' }}>
          {stats.map((s) => (
            <div key={s.label}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '2rem', color: '#fff' }}>{s.value}</div>
              <div style={{ color: 'rgba(255,255,255,.6)', fontSize: '.9rem', marginTop: '.25rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="section-title">Platformun Sunduğu İmkânlar</h2>
            <p className="section-sub">Tek platformda, öğrenci ihtiyaçlarına özel üç güçlü araç</p>
          </div>
          <div className="grid-3">
            {features.map((f) => (
              <Link to={f.link} key={f.title} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', margin: '0 auto 1.25rem' }}>
                    {f.icon}
                  </div>
                  <h3 style={{ fontFamily: 'Syne, sans-serif', marginBottom: '.75rem', color: f.accent }}>{f.title}</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '.9rem', lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent2))', padding: '5rem 1.5rem', textAlign: 'center', color: '#fff' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '2rem', marginBottom: '1rem' }}>
            Hemen başla, bedava
          </h2>
          <p style={{ opacity: .85, marginBottom: '2rem', fontSize: '1.05rem' }}>
            Kaydol, profilini oluştur ve ilk ilanını dakikalar içinde yayınla.
          </p>
          <Link to="/auth?tab=register" className="btn" style={{ background: '#fff', color: 'var(--accent)', fontWeight: 700, padding: '.85rem 2.5rem', borderRadius: '.5rem' }}>
            Hesap Oluştur
          </Link>
        </div>
      </section>
    </div>
  );
}
