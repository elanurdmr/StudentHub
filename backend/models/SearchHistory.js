import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    query: { type: String, required: true },
    type: { type: String, enum: ['service', 'project', 'need'], required: true },
    resultCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('SearchHistory', schema);
