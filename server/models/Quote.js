import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const lineItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  unit: {
    type: String,
    default: 'flat rate',
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  amount: {
    type: Number,
    required: true,
  },
}, { _id: false });

const quoteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  quoteNumber: {
    type: Number,
    required: true,
  },
  clientName: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true,
  },
  clientEmail: {
    type: String,
    trim: true,
    lowercase: true,
    default: '',
  },
  clientPhone: {
    type: String,
    trim: true,
    default: '',
  },
  jobDescription: {
    type: String,
    trim: true,
    default: '',
  },
  lineItems: [lineItemSchema],
  subtotal: {
    type: Number,
    default: 0,
  },
  tax: {
    type: Number,
    default: 0,
  },
  taxRate: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['draft', 'ready', 'sent', 'viewed', 'approved', 'declined'],
    default: 'draft',
    index: true,
  },
  notes: {
    type: String,
    trim: true,
    default: '',
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
  shareToken: {
    type: String,
    unique: true,
    index: true,
  },
  viewedAt: {
    type: Date,
  },
  respondedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

quoteSchema.pre('save', function (next) {
  if (!this.shareToken) {
    this.shareToken = nanoid(32);
  }
  next();
});

quoteSchema.index({ userId: 1, createdAt: -1 });
quoteSchema.index({ userId: 1, quoteNumber: 1 }, { unique: true });

export default mongoose.model('Quote', quoteSchema);
