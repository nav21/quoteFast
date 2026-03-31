import mongoose from 'mongoose';

const serviceItemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['per hour', 'per sqft', 'per unit', 'per linear ft', 'per day', 'flat rate'],
    default: 'flat rate',
  },
  defaultPrice: {
    type: Number,
    required: [true, 'Default price is required'],
    min: [0, 'Price cannot be negative'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

serviceItemSchema.index({ userId: 1, isActive: 1 });

export default mongoose.model('ServiceItem', serviceItemSchema);
