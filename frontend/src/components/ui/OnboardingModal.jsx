import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore.js';
import { usersAPI } from '../../api/client.js';

const GOALS = [
  { id: 'sell', label: '🛍️ Hizmet sat', desc: 'Freelance hizmetlerini pazarla' },
  { id: 'join', label: '🚀 Projeye katıl', desc: 'Ekip ara ilanlarına başvur' },
  { id: 'build', label: '👥 Ekip kur', desc: 'Kendi projen için ekip oluştur' },
  { id: 'find', label: '💼 Freelance iş bul', desc: 'İhtiyaç ilanlarından iş al' },
];

const LEVELS = [
  { value: 'beginner', label: 'Başlangıç' },
  { value: 'intermediate', label: 'Orta' },
  { value: 'expert', label: 'İleri' },
];

export default function OnboardingModal() {
  const { user, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [goals, setGoals] = useState([]);
  const [skillName, setSkillName] = useState('');
  const [skillLevel, setSkillLevel] = useState('intermediate');
  const [loading, setLoading] = useState(false);

  if (!user || user.onboardingCompleted !== false) return null;

  const toggleGoal = (id) =>
    setGoals((prev) => prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]);

  const finish = async (goTo) => {
    setLoading(true);
    try {
      // Beceri eklenmek istendiyse önce ekle
      if (skillName.trim()) {
        await usersAPI.addSkill(user._id, skillName.trim(), skillLevel);
      }
      // Onboarding'i tamamla
      const res = await usersAPI.completeOnboarding(user._id);
      updateUser(res.data);
    } catch {
      // Hata olsa bile modal'ı kapat (store'da güncelleyerek)
      updateUser({ ...user, onboardingCompleted: true });
    } finally {
      setLoading(false);
      if (goTo === 'profile') navigate(`/profile/${user._id}`);
      else if (goTo === 'projects') navigate('/projects');
    }
  };

  const dismiss = async () => {
    setLoading(true);
    try {
      const res = await usersAPI.completeOnboarding(user._id);
      updateUser(res.data);
    } catch {
      updateUser({ ...user, onboardingCompleted: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          background: 'var(--card)', borderRadius: '1.25rem',
          padding: '2.5rem 2rem', width: '100%', maxWidth: '480px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
          position: 'relative',
        }}
      >
        {/* Kapat butonu */}
        <button
          onClick={dismiss}
          disabled={loading}
          style={{
            position: 'absolute', top: '1rem', right: '1rem',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--muted)', fontSize: '1.25rem', lineHeight: 1,
          }}
          title="Geç"
        >✕</button>

        {/* Adım göstergesi */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.75rem' }}>
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              style={{
                flex: 1, height: '4px', borderRadius: '2px',
                background: s <= step ? 'var(--accent)' : 'var(--border)',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>

        {/* ── Adım 1: Hoş geldin ── */}
        {step === 1 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>👋</div>
            <h2 style={{ color: 'var(--ink)', marginBottom: '0.5rem' }}>
              Hoş geldin, {user.firstName}!
            </h2>
            <p style={{ color: 'var(--muted)', lineHeight: 1.6, marginBottom: '2rem' }}>
              StudentHub'a kayıt olduğun için teşekkürler. Burası öğrencilerin
              hizmet sattığı, projelere katıldığı ve iş bulduğu bir platform.
              Seni tanımak için birkaç soru soracağız — 1 dakika sürer.
            </p>
            <button
              className="btn btn-accent2"
              style={{ width: '100%' }}
              onClick={() => setStep(2)}
            >
              Başlayalım →
            </button>
          </div>
        )}

        {/* ── Adım 2: Hedefler ── */}
        {step === 2 && (
          <div>
            <h2 style={{ color: 'var(--ink)', marginBottom: '0.5rem' }}>🎯 Ne yapmak istiyorsun?</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
              İstediğin kadar seçebilirsin
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.75rem' }}>
              {GOALS.map((g) => {
                const active = goals.includes(g.id);
                return (
                  <button
                    key={g.id}
                    onClick={() => toggleGoal(g.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.75rem 1rem', borderRadius: '0.75rem',
                      border: `2px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                      background: active ? 'rgba(99,102,241,0.08)' : 'var(--card)',
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>{g.label}</span>
                    <span style={{ color: 'var(--muted)', fontSize: '0.82rem', marginLeft: 'auto' }}>{g.desc}</span>
                    {active && <span style={{ color: 'var(--accent)', fontSize: '1rem' }}>✓</span>}
                  </button>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(1)}>← Geri</button>
              <button className="btn btn-accent2" style={{ flex: 2 }} onClick={() => setStep(3)}>Devam →</button>
            </div>
          </div>
        )}

        {/* ── Adım 3: İlk beceri ── */}
        {step === 3 && (
          <div>
            <h2 style={{ color: 'var(--ink)', marginBottom: '0.5rem' }}>💼 İlk becerinizi ekleyin</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
              Profil sayfandan daha fazlasını ekleyebilirsin
            </p>
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Beceri adı</label>
              <input
                className="form-input"
                placeholder="Örn: React, Python, Grafik Tasarım…"
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setStep(4)}
                autoFocus
              />
            </div>
            <div style={{ marginBottom: '1.75rem' }}>
              <label className="form-label">Seviye</label>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                {LEVELS.map((lv) => (
                  <button
                    key={lv.value}
                    onClick={() => setSkillLevel(lv.value)}
                    style={{
                      flex: 1, padding: '0.5rem', borderRadius: '0.6rem',
                      border: `2px solid ${skillLevel === lv.value ? 'var(--accent)' : 'var(--border)'}`,
                      background: skillLevel === lv.value ? 'rgba(99,102,241,0.1)' : 'var(--card)',
                      color: skillLevel === lv.value ? 'var(--accent)' : 'var(--muted)',
                      cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500,
                      transition: 'all 0.15s',
                    }}
                  >
                    {lv.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(2)}>← Geri</button>
              <button className="btn btn-accent2" style={{ flex: 2 }} onClick={() => setStep(4)}>
                {skillName.trim() ? 'Kaydet ve Devam →' : 'Geç →'}
              </button>
            </div>
          </div>
        )}

        {/* ── Adım 4: Hazır ── */}
        {step === 4 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎉</div>
            <h2 style={{ color: 'var(--ink)', marginBottom: '0.5rem' }}>Hazırsın!</h2>
            <p style={{ color: 'var(--muted)', lineHeight: 1.6, marginBottom: '2rem' }}>
              Profilin oluşturuldu. Şimdi ne yapmak istersin?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                className="btn btn-accent2"
                style={{ width: '100%' }}
                disabled={loading}
                onClick={() => finish('profile')}
              >
                👤 Profilimi düzenle
              </button>
              <button
                className="btn btn-secondary"
                style={{ width: '100%' }}
                disabled={loading}
                onClick={() => finish('projects')}
              >
                🚀 Projelere göz at
              </button>
              <button
                className="btn btn-ghost"
                style={{ width: '100%', fontSize: '0.875rem' }}
                disabled={loading}
                onClick={() => finish(null)}
              >
                {loading ? 'Kaydediliyor…' : 'Ana sayfada kal'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
