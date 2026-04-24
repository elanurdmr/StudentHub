import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
  need: { type: mongoose.Schema.Types.ObjectId, ref: 'Need', required: true },
  offerer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  deliveryDays: { type: Number, default: 7 },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
}, { timestamps: true });

export default mongoose.model('Offer', offerSchema);
