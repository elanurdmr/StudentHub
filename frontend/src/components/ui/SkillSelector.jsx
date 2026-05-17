import { useState, useEffect, useRef } from 'react';
import { skillsAPI } from '../../api/client.js';

const LEVEL_LABELS = { beginner: 'Başlangıç', intermediate: 'Orta', expert: 'Uzman' };
const LEVEL_COLORS = { beginner: '#84cc16', intermediate: '#f59e0b', expert: '#4f46e5' };

export default function SkillSelector({ selected = [], onChange, maxSkills = 20 }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef();

  useEffect(() => {
    if (!query.trim()) { setSuggestions([]); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await skillsAPI.search(query, { limit: 8 });
        const filtered = Array.isArray(data) ? data.filter((s) => !selected.find((sel) => sel.skillId === s._id || sel.name === s.name)) : [];
        setSuggestions(filtered);
      } catch { setSuggestions([]); }
      finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, selected]);

  function addSkill(skill) {
    if (selected.length >= maxSkills) return;
    onChange([...selected, { skillId: skill._id, name: skill.name, level: 'intermediate', category: skill.category }]);
    setQuery('');
    setSuggestions([]);
  }

  function addFreetext() {
    const name = query.trim();
    if (!name || selected.length >= maxSkills) return;
    if (selected.find((s) => s.name.toLowerCase() === name.toLowerCase())) return;
    onChange([...selected, { skillId: null, name, level: 'intermediate' }]);
    setQuery('');
    setSuggestions([]);
  }

  function updateLevel(index, level) {
    onChange(selected.map((s, i) => (i === index ? { ...s, level } : s)));
  }

  function removeSkill(index) {
    onChange(selected.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem', marginBottom: '.75rem' }}>
        {selected.map((skill, i) => (
          <div key={i} style={{
            display: 'inline-flex', alignItems: 'center', gap: '.35rem',
            padding: '.3rem .6rem', borderRadius: '999px',
            border: '1.5px solid #e2e8f0', background: '#f8fafc',
          }}>
            <span style={{ fontWeight: 600, fontSize: '.8rem' }}>{skill.name}</span>
            <select
              value={skill.level}
              onChange={(e) => updateLevel(i, e.target.value)}
              style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '.7rem', fontWeight: 700, color: LEVEL_COLORS[skill.level] }}
            >
              {Object.entries(LEVEL_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <button onClick={() => removeSkill(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontWeight: 700, fontSize: '.85rem', lineHeight: 1, padding: 0 }}>×</button>
          </div>
        ))}
      </div>

      {selected.length < maxSkills && (
        <div style={{ position: 'relative' }}>
          <input
            className="form-control"
            placeholder="Beceri ara (React, Python, Figma...) veya enter ile ekle"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (suggestions.length > 0) addSkill(suggestions[0]); else addFreetext(); } }}
          />
          {loading && (
            <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '.75rem', color: '#94a3b8' }}>Aranıyor…</span>
          )}
          {focused && suggestions.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, background: '#fff', border: '1px solid #e2e8f0', borderRadius: '.5rem', boxShadow: '0 8px 24px rgba(0,0,0,.1)', marginTop: '.25rem', overflow: 'hidden' }}>
              {suggestions.map((s) => (
                <button
                  key={s._id}
                  onMouseDown={() => addSkill(s)}
                  style={{ width: '100%', padding: '.6rem 1rem', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span style={{ fontWeight: 600, fontSize: '.875rem' }}>{s.name}</span>
                  <span style={{ fontSize: '.7rem', color: '#94a3b8', background: '#f1f5f9', padding: '.1rem .45rem', borderRadius: '999px' }}>{s.category}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
