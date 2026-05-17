import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  requiredSkills: [{ type: String }],
  teamSize: { type: Number, default: 3 },
  duration: { type: String, default: '' },
  status: { type: String, enum: ['recruiting', 'active', 'completed'], default: 'recruiting' },
  tags: [{ type: String }],
  applicationCount: { type: Number, default: 0 },
  collaborationType: {
    type: String,
    enum: ['volunteer', 'academic', 'startup', 'research', 'competition'],
    default: 'volunteer',
  },
  expectedTimeCommitment: { type: String, default: '' },
  projectUrl: { type: String, default: '' },
  isRemote: { type: Boolean, default: true },
  applicationDeadline: { type: Date },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, default: 'Üye' },
    joinedAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);
