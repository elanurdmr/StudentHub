import mongoose from 'mongoose';

const serviceOrderSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  amount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['completed', 'refunded'], default: 'completed' },
  paymentIntentId: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('ServiceOrder', serviceOrderSchema);
