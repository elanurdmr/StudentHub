import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  category: {
    type: String,
    enum: ['Programlama Dili', 'Framework', 'Veritabanı', 'Tasarım', 'DevOps', 'Yapay Zeka', 'Mobil', 'Oyun', 'Soft Skill', 'Dil', 'Diğer'],
    required: true,
  },
  aliases: [String],
  iconUrl: String,
  usageCount: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

skillSchema.index({ name: 'text', aliases: 'text' });

export default mongoose.model('Skill', skillSchema);
