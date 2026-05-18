import User from '../models/User.js';
import Project from '../models/Project.js';
import { calculateDetailedMatch } from './skillMatchingService.js';

function normalizeSkill(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // Türkçe İ gibi birleşik karakterleri temizle
    .trim()
    .toLowerCase();
}

function extractJsonArray(text) {
  if (!text) return [];
  const cleaned = text.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
  const match = cleaned.match(/\[[\s\S]*]/);
  if (!match) return [];
  try {
    const parsed = JSON.parse(match[0]);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Proje seçimi skill skoruna göre yapılır (Groq hallucination riski yok).
 * Groq yalnızca her proje için Türkçe açıklama (reason) üretir.
 * @returns {Promise<Array<{ project: object, reason: string, matchScore: number }>>}
 */
export async function fetchGroqProjectMatches(userId) {
  const key = process.env.GROQ_API_KEY?.trim();
  if (!key) return null;

  const user = await User.findById(userId).lean();
  if (!user) return null;

  const projects = await Project.find({})
    .populate('owner', 'firstName lastName avatar')
    .limit(40)
    .lean();

  if (projects.length === 0) return [];

  // Ham skill listesi (skillMatchingService alias + semantic matching için object format korunmalı)
  const userSkillsRaw = user.skills || [];

  // Görüntüleme için normalize edilmiş isim listesi (prompt'ta kullanmak için)
  const userSkillNames = userSkillsRaw
    .map((s) => (typeof s === 'string' ? s : s?.name || ''))
    .map(normalizeSkill)
    .filter(Boolean);

  // Her projeye skillMatchingService'in gelişmiş algoritmasıyla skor ver
  const scoredProjects = projects.map((p) => {
    const { score, matchedSkills } = calculateDetailedMatch(userSkillsRaw, p.requiredSkills || []);
    const required = (p.requiredSkills || []).map(normalizeSkill).filter(Boolean);
    return { project: p, required, matched: matchedSkills, matchScore: score };
  });

  // Eşleşme skoru olanları sırala; yoksa ilk 3 projeyi al
  const candidates = scoredProjects
    .filter((p) => p.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);

  const top3 = candidates.length > 0
    ? candidates.slice(0, 3)
    : scoredProjects.slice(0, 3);

  if (top3.length === 0) return [];

  // Groq'a sadece bu 3 proje için Türkçe reason ürettir
  const skillsStr = userSkillNames.length ? userSkillNames.join(', ') : '(belirtilmedi)';
  const listStr = top3
    .map((item) => {
      const p = item.project;
      const requiredStr = item.required.length ? item.required.join(', ') : '(yok)';
      const matchedStr = item.matched.length ? item.matched.join(', ') : '(yok)';
      return `- id:${String(p._id)} | baslik: ${p.title} | gerekli: ${requiredStr} | eslesen: ${matchedStr} | ozet: ${(p.description || '').slice(0, 200)}`;
    })
    .join('\n');

  const prompt = `Sen bir ogrenci platformu asistanisin. Yalnizca gecerli JSON dizisi ile yanit ver.
Kullanici becerileri: ${skillsStr}

Projeler (hepsi icin reason yaz, hicbirini atlama):
${listStr}

Gorev: her proje icin kullaniciya neden uygun oldugunu tek cumleyle Turkce acikla. Listedeki TUM projeleri dahil et.
Cikti formati kesin olarak: [{"projectId":"...","reason":"..."}]
Baska aciklama veya kod blogu yazma.`;

  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 512,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      const text = data?.choices?.[0]?.message?.content;
      const parsed = extractJsonArray(text);
      const reasonById = new Map(parsed.map((item) => [String(item.projectId), String(item.reason || '')]));

      return top3.map((item) => ({
        project: { ...item.project, owner: item.project.owner || null },
        reason: reasonById.get(String(item.project._id)) || '',
        matchScore: item.matchScore,
      }));
    }
  } catch { /* Groq hata verirse reason'sız döndür */ }

  // Groq başarısız olsa bile projeleri döndür (reason boş)
  return top3.map((item) => ({
    project: { ...item.project, owner: item.project.owner || null },
    reason: '',
    matchScore: item.matchScore,
  }));
}
