import { Router } from 'express';
import Project from '../models/Project.js';
import Application from '../models/Application.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';
import { fetchGeminiProjectMatches } from '../services/geminiProjectMatch.js';
import { getSkillBasedRecommendations } from '../services/skillMatchingService.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { category, q, owner } = req.query;
    const filter = {};
    if (owner) filter.owner = owner;
    if (category) filter.category = category;
    if (q) filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
    ];
    const projects = await Project.find(filter).populate('owner', 'firstName lastName avatar').sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/mine', verifyToken, async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/recommendations', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });

    if (process.env.GEMINI_API_KEY?.trim()) {
      try {
        const ai = await fetchGeminiProjectMatches(req.user.id);
        if (Array.isArray(ai)) {
          return res.json(
            ai.map((row) => ({
              ...row.project,
              aiReason: row.reason,
              aiMatchScore: row.matchScore,
            })),
          );
        }
      } catch {
        /* Gemini hata verirse basit eşleşmeye düş */
      }
    }

    const recommendations = await getSkillBasedRecommendations(req.user.id);
    if (recommendations.length > 0) {
      return res.json(recommendations.map((r) => ({ ...r.project.toObject(), matchScore: r.matchScore })));
    }
    const projects = await Project.find({ status: 'recruiting' }).populate('owner', 'firstName lastName avatar').limit(6);
    res.json(projects.map((p) => ({ ...p.toObject(), matchScore: 0 })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('owner', 'firstName lastName avatar rating bio');
    if (!project) return res.status(404).json({ error: 'Bulunamadı' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const project = await Project.create({ ...req.body, owner: req.user.id });
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', verifyToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Bulunamadı' });
    if (project.owner.toString() !== req.user.id) return res.status(403).json({ error: 'Yetkisiz' });
    Object.assign(project, req.body);
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Bulunamadı' });
    if (project.owner.toString() !== req.user.id) return res.status(403).json({ error: 'Yetkisiz' });
    await project.deleteOne();
    res.json({ message: 'Silindi' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/apply', verifyToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('owner');
    if (!project) return res.status(404).json({ error: 'Bulunamadı' });
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/applications', verifyToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Bulunamadı' });
    if (project.owner.toString() !== req.user.id) return res.status(403).json({ error: 'Yetkisiz' });
    const apps = await Application.find({ project: req.params.id })
      .populate('applicant', 'firstName lastName avatar rating skills bio')
      .sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:projectId/applications/:appId', verifyToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project || project.owner.toString() !== req.user.id) return res.status(403).json({ error: 'Yetkisiz' });
    const app = await Application.findByIdAndUpdate(
      req.params.appId, { status: req.body.status }, { new: true }
    ).populate('applicant');
    if (req.body.status === 'accepted') {
      await Notification.create({
        user: app.applicant._id,
        type: 'application',
        title: 'Başvurunuz kabul edildi!',
        body: `"${project.title}" projesine başvurunuz kabul edildi.`,
        link: `/detail/project/${project._id}`,
      });
    }
    res.json(app);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
