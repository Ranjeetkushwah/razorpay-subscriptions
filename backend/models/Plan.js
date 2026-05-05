const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Plan name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Plan description is required']
  },
  amount: {
    type: Number,
    required: [true, 'Plan amount is required'],
    min: [1, 'Amount must be at least 1']
  },
  currency: {
    type: String,
    default: 'INR',
    uppercase: true
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: true
  },
  period: {
    type: Number,
    required: true,
    min: [1, 'Period must be at least 1']
  },
  totalCount: {
    type: Number,
    required: true,
    min: [1, 'Total count must be at least 1']
  },
  features: [{
    type: String,
    required: true
  }],
  popular: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  razorpayPlanId: {
    type: String,
    sparse: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Plan', planSchema);
