import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  businessName: {
    type: String,
    trim: true,
    default: '',
  },
  phone: {
    type: String,
    trim: true,
    default: '',
  },
  businessType: {
    type: String,
    trim: true,
    default: '',
  },
  taxRate: {
    type: Number,
    default: 0,
    min: [0, 'Tax rate cannot be negative'],
    max: [100, 'Tax rate cannot exceed 100'],
  },
  onboardingCompleted: {
    type: Boolean,
    default: false,
  },
  address: {
    type: String,
    trim: true,
    default: '',
  },
  brandColor: {
    type: String,
    trim: true,
    default: '#1B2A4A',
  },
  templateStyle: {
    type: String,
    trim: true,
    enum: ['clean-minimal', 'bold-modern', 'classic-professional', 'compact-estimate', 'executive-proposal', 'friendly-approachable'],
    default: 'clean-minimal',
  },
  emailVerified: {
    type: Boolean,
    default: true,
  },
  emailVerificationToken: {
    type: String,
    index: { sparse: true },
  },
  emailVerificationExpires: {
    type: Date,
  },
}, {
  timestamps: true,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
