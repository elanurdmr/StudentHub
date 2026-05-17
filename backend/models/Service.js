import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  deliveryDays: { type: Number, default: 3 },
  tags: [{ type: String }],
  image: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  purchaseCount: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Service', serviceSchema);
