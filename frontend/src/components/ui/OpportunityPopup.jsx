import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSocket } from '../../hooks/useSocket.js';

export default function OpportunityPopup() {
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);
  const [visible, setVisible] = useState(false);

  useSocket({
    onOpportunityMatch: (data) => {
      setQueue((q) => [...q, data]);
    },
  });

  useEffect(() => {
    if (!visible && queue.length > 0) {
      setCurrent(queue[0]);
      setQueue((q) => q.slice(1));
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 12000);
      return () => clearTimeout(timer);
    }
  }, [queue, visible]);

  if (!visible || !current) return null;

  return (
    <div style={{
      position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999,
      maxWidth: 360, width: '100%',
      background: '#fff', borderRadius: '1rem',
      boxShadow: '0 20px 60px rgba(79,70,229,.2)',
      border: '2px solid #4f46e5',
      animation: 'slideInRight .4s ease',
    }}>
      <style>{`
        @keyframes slideInRight { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes shrinkBar { from { width: 100% } to { width: 0% } }
      `}</style>

      <div style={{ height: 3, background: 'var(--border)', borderRadius: '1rem 1rem 0 0', overflow: 'hidden' }}>
        <div style={{ height: '100%', background: '#4f46e5', animation: 'shrinkBar 12s linear forwards' }} />
      </div>

      <div style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🎯</span>
            <div>
              <div style={{ fontWeight: 800, fontFamily: 'Syne, sans-serif', fontSize: '.95rem', color: '#0f172a' }}>Sana Özel Fırsat!</div>
              <div style={{ fontSize: '.75rem', color: '#4f46e5', fontWeight: 700 }}>%{current.matchScore} Eşleşme</div>
            </div>
          </div>
          <button onClick={() => setVisible(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1rem' }}>✕</button>
        </div>

        <div style={{ fontWeight: 600, marginBottom: '.4rem', fontSize: '.9rem' }}>{current.project?.title}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.25rem', marginBottom: '1rem' }}>
          {current.project?.requiredSkills?.slice(0, 3).map((s) => (
            <span key={s} style={{ fontSize: '.7rem', padding: '.15rem .5rem', borderRadius: '999px', background: 'rgba(99,102,241,0.1)', color: '#4f46e5', fontWeight: 600 }}>{s}</span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '.5rem' }}>
          <Link
            to={`/detail/project/${current.project?._id}`}
            onClick={() => setVisible(false)}
            style={{ flex: 1, textAlign: 'center', padding: '.6rem', background: '#4f46e5', color: '#fff', borderRadius: '.5rem', fontSize: '.85rem', fontWeight: 700, textDecoration: 'none' }}
          >
            Projeye Bak →
          </Link>
          <button onClick={() => setVisible(false)} style={{ padding: '.6rem 1rem', background: '#f1f5f9', border: 'none', borderRadius: '.5rem', cursor: 'pointer', fontSize: '.85rem', color: '#64748b' }}>
            Sonra
          </button>
        </div>
      </div>
    </div>
  );
}
