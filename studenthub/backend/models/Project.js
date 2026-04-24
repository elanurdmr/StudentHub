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
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);
