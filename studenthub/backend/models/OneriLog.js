import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  action: { type: String, enum: ['viewed', 'applied', 'dismissed'], required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('OneriLog', schema);
