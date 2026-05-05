const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  razorpaySubscriptionId: {
    type: String,
    required: true,
    unique: true
  },
  razorpayPlanId: {
    type: String,
    required: true
  },
  razorpayCustomerId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['created', 'authenticated', 'active', 'completed', 'cancelled', 'expired', 'halted'],
    default: 'created'
  },
  planName: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
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
  totalCount: {
    type: Number,
    required: true
  },
  paidCount: {
    type: Number,
    default: 0
  },
  remainingCount: {
    type: Number,
    required: true
  },
  startAt: {
    type: Date,
    required: true
  },
  endAt: {
    type: Date,
    required: true
  },
  authAt: {
    type: Date
  },
  nextChargeAt: {
    type: Date
  },
  shortUrl: {
    type: String
  },
  notes: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ razorpaySubscriptionId: 1 });
subscriptionSchema.index({ nextChargeAt: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
