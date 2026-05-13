import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contentType: { type: String, enum: ['service', 'project', 'need', 'user'], required: true },
    contentId: { type: mongoose.Schema.Types.ObjectId, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['pending', 'reviewed', 'dismissed'], default: 'pending' },
  },
  { timestamps: true }
);

export default mongoose.model('Report', schema);
