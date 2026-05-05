const express = require('express');
const { body, validationResult } = require('express-validator');
const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');
const User = require('../models/User');
const RazorpayService = require('../services/razorpayService');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all available plans
router.get('/plans', async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true }).sort({ amount: 1 });
    
    res.status(200).json({
      success: true,
      data: {
        plans,
      },
    });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching plans',
    });
  }
});

// Create a new plan (Admin only)
router.post('/plans', adminAuth, [
  body('name').trim().isLength({ min: 2 }).withMessage('Plan name must be at least 2 characters'),
  body('description').trim().isLength({ min: 5 }).withMessage('Description must be at least 5 characters'),
  body('amount').isNumeric().isFloat({ min: 1 }).withMessage('Amount must be at least 1'),
  body('frequency').isIn(['daily', 'weekly', 'monthly', 'yearly']).withMessage('Invalid frequency'),
  body('period').isInt({ min: 1 }).withMessage('Period must be at least 1'),
  body('totalCount').isInt({ min: 1 }).withMessage('Total count must be at least 1'),
  body('features').isArray({ min: 1 }).withMessage('At least one feature is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array(),
      });
    }

    const { name, description, amount, currency, frequency, period, totalCount, features, popular } = req.body;

    // Create Razorpay plan
    const razorpayPlan = await RazorpayService.createPlan({
      name,
      description,
      amount,
      currency: currency || 'INR',
      frequency,
      period,
    });

    // Create plan in database
    const plan = new Plan({
      name,
      description,
      amount,
      currency: currency || 'INR',
      frequency,
      period,
      totalCount,
      features,
      popular: popular || false,
      razorpayPlanId: razorpayPlan.id,
    });

    await plan.save();

    res.status(201).json({
      success: true,
      message: 'Plan created successfully',
      data: {
        plan,
      },
    });
  } catch (error) {
    console.error('Create plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating plan',
    });
  }
});

// Update a plan (Admin only)
router.put('/plans/:id', adminAuth, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Plan name must be at least 2 characters'),
  body('description').optional().trim().isLength({ min: 5 }).withMessage('Description must be at least 5 characters'),
  body('amount').optional().isNumeric().isFloat({ min: 1 }).withMessage('Amount must be at least 1'),
  body('features').optional().isArray({ min: 1 }).withMessage('At least one feature is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const updates = req.body;

    const plan = await Plan.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Plan updated successfully',
      data: {
        plan,
      },
    });
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating plan',
    });
  }
});

// Delete a plan (Admin only)
router.delete('/plans/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await Plan.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Plan deleted successfully',
    });
  } catch (error) {
    console.error('Delete plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting plan',
    });
  }
});

// Get user's subscriptions
router.get('/my-subscriptions', auth, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ 
      userId: req.user._id,
      isActive: true 
    })
    .populate('userId', 'name email')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        subscriptions,
      },
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching subscriptions',
    });
  }
});

// Create a new subscription
router.post('/create', auth, [
  body('planId').notEmpty().withMessage('Plan ID is required'),
  body('totalCount').isInt({ min: 1 }).withMessage('Total count must be at least 1'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array(),
      });
    }

    const { planId, totalCount } = req.body;
    const user = req.user;

    // Get plan details
    const plan = await Plan.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found or inactive',
      });
    }

    // Check if user has Razorpay customer ID
    if (!user.razorpayCustomerId) {
      return res.status(400).json({
        success: false,
        message: 'Razorpay customer ID not found. Please contact support.',
      });
    }

    // Create Razorpay subscription
    const startAt = Math.floor(Date.now() / 1000);
    const razorpaySubscription = await RazorpayService.createSubscription(
      user.razorpayCustomerId,
      plan.razorpayPlanId,
      totalCount,
      startAt,
      {
        userId: user._id.toString(),
        planId: plan._id.toString(),
      }
    );

    // Create subscription in database
    const subscription = new Subscription({
      userId: user._id,
      razorpaySubscriptionId: razorpaySubscription.id,
      razorpayPlanId: plan.razorpayPlanId,
      razorpayCustomerId: user.razorpayCustomerId,
      status: razorpaySubscription.status,
      planName: plan.name,
      amount: plan.amount,
      currency: plan.currency,
      frequency: plan.frequency,
      totalCount: razorpaySubscription.total_count,
      paidCount: razorpaySubscription.paid_count,
      remainingCount: razorpaySubscription.remaining_count,
      startAt: new Date(razorpaySubscription.start_at * 1000),
      endAt: new Date(razorpaySubscription.end_at * 1000),
      authAt: razorpaySubscription.auth_at ? new Date(razorpaySubscription.auth_at * 1000) : undefined,
      nextChargeAt: razorpaySubscription.charge_at ? new Date(razorpaySubscription.charge_at * 1000) : undefined,
      shortUrl: razorpaySubscription.short_url,
      notes: razorpaySubscription.notes,
    });

    await subscription.save();

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: {
        subscription,
        razorpaySubscription,
      },
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating subscription',
    });
  }
});

// Get subscription details
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findOne({
      _id: id,
      userId: req.user._id,
    }).populate('userId', 'name email');

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found',
      });
    }

    // Get latest subscription details from Razorpay
    const razorpaySubscription = await RazorpayService.fetchSubscription(subscription.razorpaySubscriptionId);

    // Update subscription status if needed
    if (razorpaySubscription.status !== subscription.status) {
      subscription.status = razorpaySubscription.status;
      subscription.paidCount = razorpaySubscription.paid_count;
      subscription.remainingCount = razorpaySubscription.remaining_count;
      subscription.authAt = razorpaySubscription.auth_at ? new Date(razorpaySubscription.auth_at * 1000) : subscription.authAt;
      subscription.nextChargeAt = razorpaySubscription.charge_at ? new Date(razorpaySubscription.charge_at * 1000) : subscription.nextChargeAt;
      await subscription.save();
    }

    res.status(200).json({
      success: true,
      data: {
        subscription,
        razorpaySubscription,
      },
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching subscription',
    });
  }
});

// Cancel subscription
router.post('/:id/cancel', auth, [
  body('cancelAtCycleEnd').optional().isBoolean().withMessage('cancelAtCycleEnd must be boolean'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const { cancelAtCycleEnd = false } = req.body;

    const subscription = await Subscription.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found',
      });
    }

    // Cancel subscription in Razorpay
    const razorpaySubscription = await RazorpayService.cancelSubscription(
      subscription.razorpaySubscriptionId,
      cancelAtCycleEnd
    );

    // Update subscription in database
    subscription.status = razorpaySubscription.status;
    subscription.isActive = !cancelAtCycleEnd;
    await subscription.save();

    res.status(200).json({
      success: true,
      message: 'Subscription cancelled successfully',
      data: {
        subscription,
        razorpaySubscription,
      },
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling subscription',
    });
  }
});

// Pause subscription
router.post('/:id/pause', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found',
      });
    }

    // Pause subscription in Razorpay
    const razorpaySubscription = await RazorpayService.pauseSubscription(subscription.razorpaySubscriptionId);

    // Update subscription in database
    subscription.status = razorpaySubscription.status;
    await subscription.save();

    res.status(200).json({
      success: true,
      message: 'Subscription paused successfully',
      data: {
        subscription,
        razorpaySubscription,
      },
    });
  } catch (error) {
    console.error('Pause subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while pausing subscription',
    });
  }
});

// Resume subscription
router.post('/:id/resume', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found',
      });
    }

    // Resume subscription in Razorpay
    const razorpaySubscription = await RazorpayService.resumeSubscription(subscription.razorpaySubscriptionId);

    // Update subscription in database
    subscription.status = razorpaySubscription.status;
    await subscription.save();

    res.status(200).json({
      success: true,
      message: 'Subscription resumed successfully',
      data: {
        subscription,
        razorpaySubscription,
      },
    });
  } catch (error) {
    console.error('Resume subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while resuming subscription',
    });
  }
});

// Get all subscriptions (Admin only)
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, userId } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (userId) filter.userId = userId;

    const subscriptions = await Subscription.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Subscription.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        subscriptions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get all subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching subscriptions',
    });
  }
});

module.exports = router;
