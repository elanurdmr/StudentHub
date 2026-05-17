import { calculateDetailedMatch } from './skillMatchingService.js';
import User from '../models/User.js';
import Application from '../models/Application.js';
import Notification from '../models/Notification.js';

const NOTIFICATION_THRESHOLD = 75;

export async function notifyMatchingUsers(project, io, userSockets) {
  if (project.status !== 'recruiting') return;
  if (!project.requiredSkills?.length) return;

  const applicantIds = await Application.find({ project: project._id }).distinct('applicant');

  const candidates = await User.find({
    _id: { $nin: [project.owner, ...applicantIds] },
    'skills.0': { $exists: true },
  }).select('_id skills firstName');

  for (const candidate of candidates) {
    const { score } = calculateDetailedMatch(candidate.skills, project.requiredSkills);
    if (score < NOTIFICATION_THRESHOLD) continue;

    const notif = await Notification.create({
      user: candidate._id,
      type: 'opportunity',
      title: `Sana %${score} uyumlu proje!`,
      body: `"${project.title}" projesi tam senlik görünüyor.`,
      link: `/detail/project/${project._id}`,
    });

    const socketId = userSockets.get(candidate._id.toString());
    if (socketId) {
      io.to(socketId).emit('opportunity_match', {
        notification: notif,
        project: {
          _id: project._id,
          title: project.title,
          category: project.category,
          requiredSkills: project.requiredSkills,
        },
        matchScore: score,
      });
    }
  }
}
