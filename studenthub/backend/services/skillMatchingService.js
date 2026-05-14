import User from '../models/User.js';
import Project from '../models/Project.js';

/* JS fallback implementasyonu */
function calculateMatchJS(userSkills, requiredSkills) {
  if (!userSkills?.length || !requiredSkills?.length) return 0;
  const normalized = requiredSkills.map((s) => s.toLowerCase());
  const rawSkills = userSkills.map((s) => (typeof s === 'string' ? s : s.name).toLowerCase());
  const matched = rawSkills.filter((s) => normalized.includes(s)).length;
  return Math.min(100, Math.max(0, Math.round((matched / requiredSkills.length) * 100)));
}

export async function calculateMatch(userSkills, requiredSkills) {
  const aiUrl = process.env.AI_SERVICE_URL;
  if (aiUrl) {
    try {
      const payload = {
        userSkills: userSkills.map((s) =>
          typeof s === 'string' ? { name: s, level: 'intermediate' } : { name: s.name, level: s.level || 'intermediate' }
        ),
        requiredSkills,
      };
      const resp = await fetch(`${aiUrl}/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(3000),
      });
      if (resp.ok) {
        const data = await resp.json();
        return data.matchScore;
      }
    } catch {
      /* Python servisi yoksa JS implementasyonuna düş */
    }
  }
  return calculateMatchJS(userSkills, requiredSkills);
}

export async function getSkillBasedRecommendations(userId) {
  const user = await User.findById(userId);
  if (!user) return [];
  const projects = await Project.find({ status: 'recruiting' }).populate('owner', 'firstName lastName avatar');
  const results = await Promise.all(
    projects.map(async (project) => ({
      project,
      matchScore: await calculateMatch(user.skills || [], project.requiredSkills || []),
    }))
  );
  return results
    .filter((r) => r.matchScore > 30)
    .sort((a, b) => b.matchScore - a.matchScore);
}
