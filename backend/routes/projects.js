import { Router } from 'express';
import jwt from 'jsonwebtoken';
import Project from '../models/Project.js';
import Application from '../models/Application.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import OneriLog from '../models/OneriLog.js';
import SearchHistory from '../models/SearchHistory.js';
import { verifyToken } from '../middleware/auth.js';
import { asyncHandler, NotFoundError, ForbiddenError } from '../middleware/errorHandler.js';
import { fetchGroqProjectMatches } from '../services/groqProjectMatch.js';
import { getSkillBasedRecommendations } from '../services/skillMatchingService.js';
import { notifyMatchingUsers } from '../services/opportunityMatcher.js';

function optionalAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try { req.user = jwt.verify(token, process.env.JWT_SECRET); } catch { /* yok say */ }
  }
  next();
}

const router = Router();

router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  const { category, q, owner, requiredSkills, collaborationType, isRemote, page = 1, limit = 20, sort } = req.query;
  const filter = {};
  if (owner) filter.owner = owner;
  if (category) filter.category = category;
  if (collaborationType) filter.collaborationType = collaborationType;
  if (isRemote !== undefined) filter.isRemote = isRemote === 'true';
  if (q) filter.$or = [
    { title: { $regex: q, $options: 'i' } },
    { description: { $regex: q, $options: 'i' } },
  ];
  if (requiredSkills) {
    const skillList = requiredSkills.split(',').map((s) => s.trim());
    filter.requiredSkills = { $in: skillList.map((s) => new RegExp(s, 'i')) };
  }

  const sortMap = {
    newest: { createdAt: -1 },
    most_applied: { applicationCount: -1 },
    deadline: { applicationDeadline: 1 },
  };
  const sortObj = sortMap[sort] || { createdAt: -1 };
  const skip = (Number(page) - 1) * Number(limit);

  const [projects, total] = await Promise.all([
    Project.find(filter).populate('owner', 'firstName lastName avatar').sort(sortObj).skip(skip).limit(Number(limit)),
    Project.countDocuments(filter),
  ]);

  if (req.user && q) {
    SearchHistory.create({ user: req.user.id, query: q, type: 'project', resultCount: total }).catch(() => {});
  }

  res.json({ data: projects, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
}));

router.get('/mine', verifyToken, asyncHandler(async (req, res) => {
  const projects = await Project.find({ owner: req.user.id }).sort({ createdAt: -1 });
  res.json(projects);
}));

router.get('/my-applications', verifyToken, asyncHandler(async (req, res) => {
  const apps = await Application.find({ applicant: req.user.id })
    .populate('project', 'title category _id')
    .sort({ createdAt: -1 });
  res.json(apps);
}));

router.delete('/my-applications/:id', verifyToken, asyncHandler(async (req, res) => {
  const app = await Application.findById(req.params.id);
  if (!app) throw new NotFoundError('Başvuru');
  if (app.applicant.toString() !== req.user.id) throw new ForbiddenError();
  if (app.status !== 'pending')
    return res.status(400).json({ error: 'Sadece beklemedeki başvurular geri çekilebilir' });
  await Project.findByIdAndUpdate(app.project, { $inc: { applicationCount: -1 } });
  await app.deleteOne();
  res.json({ success: true });
}));

router.get('/recommendations', verifyToken, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new NotFoundError('Kullanıcı');

  if (process.env.GROQ_API_KEY?.trim()) {
    try {
      const ai = await fetchGroqProjectMatches(req.user.id);
      if (Array.isArray(ai) && ai.length > 0) {
        return res.json(ai.map((row) => ({ ...row.project, aiReason: row.reason, aiMatchScore: row.matchScore })));
      }
    } catch { /* Groq hata verirse devam */ }
  }

  const recommendations = await getSkillBasedRecommendations(req.user.id);
  if (recommendations.length > 0) {
    recommendations.forEach((r) => {
      OneriLog.create({ user: req.user.id, project: r.project._id, action: 'viewed' }).catch(() => {});
    });
    return res.json(recommendations.map((r) => ({ ...r.project.toObject(), matchScore: r.matchScore })));
  }

  const projects = await Project.find({ status: 'recruiting' }).populate('owner', 'firstName lastName avatar').limit(6);
  projects.forEach((p) => {
    OneriLog.create({ user: req.user.id, project: p._id, action: 'viewed' }).catch(() => {});
  });
  res.json(projects.map((p) => ({ ...p.toObject(), matchScore: 0 })));
}));

router.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('owner', 'firstName lastName avatar rating bio')
    .populate('members.user', 'firstName lastName avatar');
  if (!project) throw new NotFoundError('Proje');
  let hasApplied = false;
  if (req.user) {
    hasApplied = !!(await Application.findOne({ project: req.params.id, applicant: req.user.id }));
  }
  res.json({ ...project.toObject(), hasApplied });
}));

router.post('/', verifyToken, asyncHandler(async (req, res) => {
  const project = await Project.create({ ...req.body, owner: req.user.id });
  // Eşleşen kullanıcılara bildirim gönder (io ve userSockets server.js'den gelmeli)
  if (req.app.get('io') && req.app.get('userSockets')) {
    notifyMatchingUsers(project, req.app.get('io'), req.app.get('userSockets')).catch(() => {});
  }
  res.status(201).json(project);
}));

router.patch('/:id', verifyToken, asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new NotFoundError('Proje');
  if (project.owner.toString() !== req.user.id) throw new ForbiddenError();
  Object.assign(project, req.body);
  await project.save();
  res.json(project);
}));

router.delete('/:id', verifyToken, asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new NotFoundError('Proje');
  if (project.owner.toString() !== req.user.id) throw new ForbiddenError();
  await project.deleteOne();
  res.json({ message: 'Silindi' });
}));

router.post('/:id/apply', verifyToken, asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).populate('owner');
  if (!project) throw new NotFoundError('Proje');
  const existing = await Application.findOne({ project: req.params.id, applicant: req.user.id });
  if (existing) return res.status(409).json({ error: 'Zaten başvurdunuz' });
  const app = await Application.create({ project: req.params.id, applicant: req.user.id, coverLetter: req.body.coverLetter });
  project.applicationCount += 1;
  await project.save();
  await Notification.create({
    user: project.owner._id,
    type: 'application',
    title: 'Yeni proje başvurusu',
    body: `"${project.title}" projenize yeni bir başvuru geldi.`,
    link: `/applications/${project._id}`,
  });
  res.status(201).json(app);
}));

router.get('/:id/applications', verifyToken, asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new NotFoundError('Proje');
  if (project.owner.toString() !== req.user.id) throw new ForbiddenError();
  const apps = await Application.find({ project: req.params.id })
    .populate('applicant', 'firstName lastName avatar rating skills bio')
    .sort({ createdAt: -1 });
  res.json(apps);
}));

router.patch('/:projectId/applications/:appId', verifyToken, asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId);
  if (!project || project.owner.toString() !== req.user.id) throw new ForbiddenError();

  const app = await Application.findByIdAndUpdate(
    req.params.appId,
    { status: req.body.status },
    { new: true }
  ).populate('applicant');

  if (req.body.status === 'accepted' && app?.applicant) {
    await User.findByIdAndUpdate(app.applicant._id, {
      $push: {
        teamMemberships: {
          project: project._id,
          role: req.body.role || 'Üye',
          joinedAt: new Date(),
          status: 'active',
        },
      },
    });

    await Project.findByIdAndUpdate(req.params.projectId, {
      $push: { members: { user: app.applicant._id, role: req.body.role || 'Üye', joinedAt: new Date() } },
    });

    await Notification.create({
      user: app.applicant._id,
      type: 'application',
      title: 'Başvurunuz kabul edildi!',
      body: `"${project.title}" projesine dahil oldunuz.`,
      link: `/detail/project/${project._id}`,
    });
  }

  res.json(app);
}));

export default router;
