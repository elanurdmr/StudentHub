import User from '../models/User.js';
import Project from '../models/Project.js';

const SKILL_ALIASES = {
  'js': 'javascript', 'ts': 'typescript', 'py': 'python',
  'react.js': 'react', 'reactjs': 'react',
  'node': 'node.js', 'nodejs': 'node.js', 'express.js': 'express',
  'mongo': 'mongodb', 'postgres': 'postgresql',
  'ml': 'machine learning', 'ai': 'artificial intelligence',
  'css3': 'css', 'html5': 'html', 'vue.js': 'vue', 'vuejs': 'vue',
  'angular.js': 'angular', 'springboot': 'spring boot',
  'c++': 'cpp', 'c#': 'csharp',
  'react native': 'react native', 'flutter': 'flutter',
};

const LEVEL_WEIGHTS = { beginner: 0.6, intermediate: 1.0, expert: 1.5 };

function normalizeSkill(skill) {
  const lower = skill.toLowerCase().trim();
  return SKILL_ALIASES[lower] || lower;
}

function semanticSimilarity(skill1, skill2) {
  const s1 = normalizeSkill(skill1);
  const s2 = normalizeSkill(skill2);
  if (s1 === s2) return 1.0;
  if (s1.includes(s2) || s2.includes(s1)) return 0.85;
  const words1 = s1.split(/[\s.\-]+/);
  const words2 = s2.split(/[\s.\-]+/);
  const commonWords = words1.filter((w) => words2.includes(w) && w.length > 2);
  if (commonWords.length > 0) {
    return (commonWords.length / Math.max(words1.length, words2.length)) * 0.7;
  }
  return 0;
}

export function calculateDetailedMatch(userSkills, requiredSkills) {
  if (!userSkills?.length || !requiredSkills?.length) {
    return { score: 0, matchedSkills: [], missingSkills: requiredSkills || [], details: [] };
  }

  const maxPossible = requiredSkills.length * LEVEL_WEIGHTS.expert;
  let totalWeighted = 0;
  const matchedSkills = [];
  const missingSkills = [];
  const details = [];

  for (const req of requiredSkills) {
    let bestMatch = null;
    let bestSimilarity = 0;

    for (const userSkill of userSkills) {
      const skillName = typeof userSkill === 'string' ? userSkill : userSkill.name;
      const similarity = semanticSimilarity(req, skillName);
      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestMatch = { skillName, level: userSkill.level || 'intermediate', similarity };
      }
    }

    if (bestSimilarity >= 0.7) {
      const levelWeight = LEVEL_WEIGHTS[bestMatch.level] || 1.0;
      const contribution = bestSimilarity * levelWeight;
      totalWeighted += contribution;
      matchedSkills.push(req);
      details.push({
        required: req,
        matched: bestMatch.skillName,
        similarity: Math.round(bestSimilarity * 100),
        level: bestMatch.level,
      });
    } else {
      missingSkills.push(req);
      details.push({ required: req, matched: null, similarity: 0 });
    }
  }

  const score = Math.min(100, Math.max(0, Math.round((totalWeighted / maxPossible) * 100)));
  return { score, matchedSkills, missingSkills, details };
}

export async function calculateMatch(userSkills, requiredSkills) {
  const { score } = calculateDetailedMatch(userSkills, requiredSkills);
  return score;
}

export async function getSkillBasedRecommendations(userId, options = {}) {
  const { minScore = 25, limit = 10, excludeApplied = true } = options;

  const user = await User.findById(userId);
  if (!user) return [];

  let projectQuery = { status: 'recruiting' };

  if (excludeApplied) {
    const Application = (await import('../models/Application.js')).default;
    const applied = await Application.find({ applicant: userId }).distinct('project');
    projectQuery._id = { $nin: applied };
  }

  const projects = await Project.find(projectQuery)
    .populate('owner', 'firstName lastName avatar')
    .limit(100);

  const scored = projects
    .map((project) => {
      const { score, matchedSkills, missingSkills, details } = calculateDetailedMatch(
        user.skills,
        project.requiredSkills
      );
      return { project, matchScore: score, matchedSkills, missingSkills, details };
    })
    .filter((r) => r.matchScore >= minScore)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);

  return scored;
}
