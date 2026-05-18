import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const educationSchema = new mongoose.Schema({
  institution: { type: String, required: true },
  degree: { type: String, enum: ['Ön Lisans', 'Lisans', 'Yüksek Lisans', 'Doktora', 'Sertifika', 'Diğer'] },
  field: String,
  startYear: Number,
  endYear: Number,
  gpa: Number,
  description: String,
}, { _id: true });

const experienceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  type: { type: String, enum: ['Staj', 'Part-time', 'Full-time', 'Freelance', 'Gönüllü'] },
  startDate: Date,
  endDate: Date,
  isCurrent: { type: Boolean, default: false },
  description: String,
  skills: [String],
}, { _id: true });

const certificationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  issuer: String,
  issueDate: Date,
  expiryDate: Date,
  credentialUrl: String,
  credentialId: String,
}, { _id: true });

const teamMembershipSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  role: { type: String, default: 'Üye' },
  joinedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'completed', 'left'], default: 'active' },
}, { _id: true });

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  headline: { type: String, default: '', maxlength: 120 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isBanned: { type: Boolean, default: false },
  skills: [{ type: mongoose.Schema.Types.Mixed }],
  portfolio: [{
    title: String,
    description: String,
    url: String,
    image: String,
  }],
  education: [educationSchema],
  experience: [experienceSchema],
  certifications: [certificationSchema],
  languages: [{
    name: String,
    level: { type: String, enum: ['Başlangıç', 'Orta', 'İleri', 'Anadil'] },
  }],
  socialLinks: {
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    website: { type: String, default: '' },
    twitter: { type: String, default: '' },
  },
  teamMemberships: [teamMembershipSchema],
  profileViews: { type: Number, default: 0 },
  completionScore: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.toPublic = function () {
  const obj = this.toObject();
  delete obj.password;
  obj._id = String(obj._id);
  return obj;
};

export default mongoose.model('User', userSchema);
