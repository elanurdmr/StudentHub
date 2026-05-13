import User from '../models/User.js';
import Project from '../models/Project.js';

export function calculateMatch(userSkills, requiredSkills) {
  if (!userSkills?.length || !requiredSkills?.length) return 0;
  const normalized = requiredSkills.map((s) => s.toLowerCase());
  const matched = userSkills.filter((s) => normalized.includes(s.toLowerCase())).length;
  return Math.min(100, Math.max(0, Math.round((matched / requiredSkills.length) * 100)));
}

export async function getSkillBasedRecommendations(userId) {
  const user = await User.findById(userId);
  if (!user) return [];
  const projects = await Project.find({ status: 'recruiting' }).populate('owner', 'firstName lastName avatar');
  return projects
    .map((project) => ({
      project,
      matchScore: calculateMatch(user.skills || [], project.requiredSkills || []),
    }))
    .filter((r) => r.matchScore > 30)
    .sort((a, b) => b.matchScore - a.matchScore);
}
