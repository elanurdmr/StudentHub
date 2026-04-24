import mongoose from 'mongoose';

const needSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  budget: { type: Number, required: true, min: 0 },
  deadline: { type: Date },
  tags: [{ type: String }],
  status: { type: String, enum: ['open', 'in_progress', 'closed'], default: 'open' },
}, { timestamps: true });

export default mongoose.model('Need', needSchema);
