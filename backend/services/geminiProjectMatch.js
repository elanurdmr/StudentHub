import User from '../models/User.js';
import Project from '../models/Project.js';

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
 * @returns {Promise<Array<{ project: object, reason: string, matchScore: number }>>}
 */
export async function fetchGeminiProjectMatches(userId) {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) return null;

  const user = await User.findById(userId);
  if (!user) return null;

  const projects = await Project.find({ status: 'recruiting' })
    .populate('owner', 'firstName lastName avatar')
    .limit(40)
    .lean();

  if (projects.length === 0) return [];

  const skillsStr = user.skills?.length
    ? user.skills.map(s => typeof s === 'string' ? s : (s.name || '')).filter(Boolean).join(', ')
    : '(belirtilmedi)';
  const listStr = projects
    .map(
      (p) =>
        `- id:${String(p._id)} | başlık: ${p.title} | gerekli: ${(p.requiredSkills || []).join(', ') || '(yok)'} | özet: ${(p.description || '').slice(0, 280)}`,
    )
    .join('\n');

  const prompt = `Sen bir öğrenci platformu asistanısın. Yalnızca geçerli JSON dizisi ile yanıt ver.
Kullanıcı becerileri: ${skillsStr}

Projeler:
${listStr}

Görev: kullanıcıya en uygun en fazla 3 projeyi seç. Her öğe şu anahtarlara sahip olmalı: projectId (Mongo id string), matchScore (0-100 tam sayı), reason (tek cümle, Türkçe).
Çıktı formatı kesin olarak: [{"projectId":"...","reason":"...","matchScore":85}]
Başka açıklama veya kod bloğu yazma.`;

  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    const err = new Error(data.error?.message || 'Gemini yanıt hatası');
    err.status = 502;
    throw err;
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  const parsed = extractJsonArray(text);
  const byId = new Map(projects.map((p) => [String(p._id), p]));

  return parsed
    .map((item) => {
      const pid = item.projectId || item.projectTitle;
      let project = pid && byId.get(String(pid));
      if (!project && item.projectTitle)
        project = projects.find((p) => p.title === item.projectTitle);
      return project
        ? {
            project: { ...project, owner: project.owner || null },
            reason: String(item.reason || '').slice(0, 500),
            matchScore: Math.min(100, Math.max(0, Number(item.matchScore) || 0)),
          }
        : null;
    })
    .filter(Boolean)
    .slice(0, 3);
}
