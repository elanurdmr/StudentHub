import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  completedJobs: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  projectsJoined: { type: Number, default: 0 },
  avgRating: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model('UserStatistics', schema);
