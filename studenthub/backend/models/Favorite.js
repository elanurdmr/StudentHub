import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contentType: { type: String, enum: ['service', 'project', 'need'], required: true },
    contentId: { type: mongoose.Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
);

schema.index({ user: 1, contentType: 1, contentId: 1 }, { unique: true });

export default mongoose.model('Favorite', schema);
