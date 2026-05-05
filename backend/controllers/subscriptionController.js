const { validationResult } = require('express-validator');
const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');
const User = require('../models/User');
const Payment = require('../models/Payment');
const RazorpayService = require('../services/razorpayService');

// @desc    Create subscription
// @route   POST /api/subscriptions/create
// @access   Private
const createSubscription = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { planId, totalCount = 12 } = req.body;
    const userId = req.user.id;

    // Get plan details
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    // Create Razorpay plan if it doesn't exist
    if (!plan.razorpayPlanId) {
      try {
        console.log('🔧 Creating Razorpay plan for:', plan.name);
        const razorpayPlan = await RazorpayService.createPlan({
          name: plan.name,
          description: plan.description,
          amount: plan.amount,
          currency: plan.currency,
          frequency: plan.frequency,
          period: plan.period,
          notes: {
            planId: plan._id.toString(),
            createdFrom: 'subscription_flow'
          }
        });

        // Update plan with Razorpay plan ID
        plan.razorpayPlanId = razorpayPlan.id;
        await plan.save();

        console.log('✅ Razorpay plan created:', razorpayPlan.id);
      } catch (planError) {
        console.error('❌ Failed to create Razorpay plan:', planError);
        return res.status(500).json({
          success: false,
          message: 'Failed to create payment plan. Please try again.',
          error: planError.message
        });
      }
    }

    // Get user
    const user = await User.findById(userId);
    if (!user || !user.razorpayCustomerId) {
      return res.status(400).json({
        success: false,
        message: 'User Razorpay customer ID not found'
      });
    }

    // Create Razorpay subscription
    const startAt = Math.floor(Date.now() / 1000);
    
    try {
      const razorpaySubscription = await RazorpayService.createSubscription(
        user.razorpayCustomerId,
        plan.razorpayPlanId,
        totalCount,
        startAt,
        {
          userId: userId.toString(),
          planId: plan._id.toString(),
          planName: plan.name
        }
      );

      // Create subscription in database
      const subscription = new Subscription({
        userId,
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

      console.log('✅ Subscription created:', subscription._id);

      res.status(201).json({
        success: true,
        message: 'Subscription created successfully',
        data: {
          subscription,
          razorpaySubscription,
          paymentUrl: razorpaySubscription.short_url
        }
      });

    } catch (razorpayError) {
      console.error('❌ Razorpay subscription creation failed:', razorpayError);
      res.status(500).json({
        success: false,
        message: 'Failed to create subscription with Razorpay',
        error: razorpayError.message
      });
    }

  } catch (error) {
    console.error('❌ Create Subscription Error:', error);
    
    // Handle specific error messages
    let errorMessage = 'Server error while creating subscription';
    let statusCode = 500;
    
    if (error.response?.data) {
      const errorData = error.response.data;
      
      switch (errorData.code) {
        case 'PLAN_NOT_CONFIGURED':
          errorMessage = 'Plan not yet configured with Razorpay. Please contact admin to set up the plan.';
          statusCode = 400;
          break;
        case 'BAD_REQUEST_ERROR':
          errorMessage = errorData.message || 'Invalid request data';
          statusCode = 400;
          break;
        default:
          errorMessage = errorData.message || 'Subscription creation failed';
          statusCode = 500;
      }
    }
    
    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get user subscriptions
// @route   GET /api/subscriptions/my-subscriptions
// @access   Private
const getUserSubscriptions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    // Build filter
    const filter = { userId };
    if (status) {
      filter.status = status;
    }

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
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('❌ Get User Subscriptions Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching subscriptions'
    });
  }
};

// @desc    Get subscription details
// @route   GET /api/subscriptions/:id
// @access   Private
const getSubscriptionDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const subscription = await Subscription.findOne({
      _id: id,
      userId
    }).populate('userId', 'name email');

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Get latest details from Razorpay
    try {
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
          razorpaySubscription
        }
      });

    } catch (razorpayError) {
      console.error('⚠️ Razorpay fetch failed:', razorpayError);
      // Return cached data if Razorpay fails
      res.status(200).json({
        success: true,
        data: {
          subscription,
          razorpaySubscription: null
        }
      });
    }

  } catch (error) {
    console.error('❌ Get Subscription Details Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching subscription details'
    });
  }
};

// @desc    Cancel subscription
// @route   POST /api/subscriptions/:id/cancel
// @access   Private
const cancelSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { cancelAtCycleEnd = false } = req.body;

    const subscription = await Subscription.findOne({
      _id: id,
      userId
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    if (subscription.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Subscription is already cancelled'
      });
    }

    try {
      // Cancel in Razorpay
      const razorpaySubscription = await RazorpayService.cancelSubscription(
        subscription.razorpaySubscriptionId,
        cancelAtCycleEnd
      );

      // Update in database
      subscription.status = razorpaySubscription.status;
      subscription.isActive = !cancelAtCycleEnd;
      subscription.cancelledAt = new Date();
      await subscription.save();

      console.log('✅ Subscription cancelled:', subscription._id);

      res.status(200).json({
        success: true,
        message: 'Subscription cancelled successfully',
        data: {
          subscription,
          razorpaySubscription
        }
      });

    } catch (razorpayError) {
      console.error('❌ Razorpay cancel failed:', razorpayError);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel subscription with Razorpay',
        error: razorpayError.message
      });
    }

  } catch (error) {
    console.error('❌ Cancel Subscription Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling subscription'
    });
  }
};

// @desc    Pause subscription
// @route   POST /api/subscriptions/:id/pause
// @access   Private
const pauseSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const subscription = await Subscription.findOne({
      _id: id,
      userId
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    if (subscription.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Only active subscriptions can be paused'
      });
    }

    try {
      // Pause in Razorpay
      const razorpaySubscription = await RazorpayService.pauseSubscription(subscription.razorpaySubscriptionId);

      // Update in database
      subscription.status = razorpaySubscription.status;
      subscription.pausedAt = new Date();
      await subscription.save();

      console.log('✅ Subscription paused:', subscription._id);

      res.status(200).json({
        success: true,
        message: 'Subscription paused successfully',
        data: {
          subscription,
          razorpaySubscription
        }
      });

    } catch (razorpayError) {
      console.error('❌ Razorpay pause failed:', razorpayError);
      res.status(500).json({
        success: false,
        message: 'Failed to pause subscription with Razorpay',
        error: razorpayError.message
      });
    }

  } catch (error) {
    console.error('❌ Pause Subscription Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while pausing subscription'
    });
  }
};

// @desc    Resume subscription
// @route   POST /api/subscriptions/:id/resume
// @access   Private
const resumeSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const subscription = await Subscription.findOne({
      _id: id,
      userId
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    if (subscription.status !== 'paused') {
      return res.status(400).json({
        success: false,
        message: 'Only paused subscriptions can be resumed'
      });
    }

    try {
      // Resume in Razorpay
      const razorpaySubscription = await RazorpayService.resumeSubscription(subscription.razorpaySubscriptionId);

      // Update in database
      subscription.status = razorpaySubscription.status;
      subscription.resumedAt = new Date();
      await subscription.save();

      console.log('✅ Subscription resumed:', subscription._id);

      res.status(200).json({
        success: true,
        message: 'Subscription resumed successfully',
        data: {
          subscription,
          razorpaySubscription
        }
      });

    } catch (razorpayError) {
      console.error('❌ Razorpay resume failed:', razorpayError);
      res.status(500).json({
        success: false,
        message: 'Failed to resume subscription with Razorpay',
        error: razorpayError.message
      });
    }

  } catch (error) {
    console.error('❌ Resume Subscription Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while resuming subscription'
    });
  }
};

// @desc    Upgrade/Downgrade subscription
// @route   PUT /api/subscriptions/:id/upgrade
// @access   Private
const upgradeSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPlanId } = req.body;
    const userId = req.user.id;

    const currentSubscription = await Subscription.findOne({
      _id: id,
      userId
    });

    if (!currentSubscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    const newPlan = await Plan.findById(newPlanId);
    if (!newPlan || !newPlan.isActive) {
      return res.status(404).json({
        success: false,
        message: 'New plan not found or inactive'
      });
    }

    // Create Razorpay plan if it doesn't exist
    if (!newPlan.razorpayPlanId) {
      try {
        console.log('🔧 Creating Razorpay plan for upgrade:', newPlan.name);
        const razorpayPlan = await RazorpayService.createPlan({
          name: newPlan.name,
          description: newPlan.description,
          amount: newPlan.amount,
          currency: newPlan.currency,
          frequency: newPlan.frequency,
          period: newPlan.period,
          notes: {
            planId: newPlan._id.toString(),
            createdFrom: 'upgrade_flow'
          }
        });

        // Update plan with Razorpay plan ID
        newPlan.razorpayPlanId = razorpayPlan.id;
        await newPlan.save();

        console.log('✅ Razorpay plan created for upgrade:', razorpayPlan.id);
      } catch (planError) {
        console.error('❌ Failed to create Razorpay plan for upgrade:', planError);
        return res.status(500).json({
          success: false,
          message: 'Failed to create payment plan for upgrade. Please try again.',
          error: planError.message
        });
      }
    }

    // Cancel current subscription
    try {
      await RazorpayService.cancelSubscription(currentSubscription.razorpaySubscriptionId, true);
      currentSubscription.status = 'upgraded';
      currentSubscription.upgradedAt = new Date();
      await currentSubscription.save();

      // Create new subscription
      const startAt = Math.floor(Date.now() / 1000);
      const razorpaySubscription = await RazorpayService.createSubscription(
        currentSubscription.razorpayCustomerId,
        newPlan.razorpayPlanId,
        currentSubscription.remainingCount,
        startAt,
        {
          userId: userId.toString(),
          planId: newPlan._id.toString(),
          planName: newPlan.name,
          upgradedFrom: currentSubscription._id.toString()
        }
      );

      const newSubscription = new Subscription({
        userId,
        razorpaySubscriptionId: razorpaySubscription.id,
        razorpayPlanId: newPlan.razorpayPlanId,
        razorpayCustomerId: currentSubscription.razorpayCustomerId,
        status: razorpaySubscription.status,
        planName: newPlan.name,
        amount: newPlan.amount,
        currency: newPlan.currency,
        frequency: newPlan.frequency,
        totalCount: razorpaySubscription.total_count,
        paidCount: razorpaySubscription.paid_count,
        remainingCount: razorpaySubscription.remaining_count,
        startAt: new Date(razorpaySubscription.start_at * 1000),
        endAt: new Date(razorpaySubscription.end_at * 1000),
        authAt: razorpaySubscription.auth_at ? new Date(razorpaySubscription.auth_at * 1000) : undefined,
        nextChargeAt: razorpaySubscription.charge_at ? new Date(razorpaySubscription.charge_at * 1000) : undefined,
        shortUrl: razorpaySubscription.short_url,
        notes: razorpaySubscription.notes,
        upgradedFrom: currentSubscription._id
      });

      await newSubscription.save();

      console.log('✅ Subscription upgraded:', newSubscription._id);

      res.status(200).json({
        success: true,
        message: 'Subscription upgraded successfully',
        data: {
          newSubscription,
          razorpaySubscription,
          paymentUrl: razorpaySubscription.short_url
        }
      });

    } catch (razorpayError) {
      console.error('❌ Subscription upgrade failed:', razorpayError);
      res.status(500).json({
        success: false,
        message: 'Failed to upgrade subscription',
        error: razorpayError.message
      });
    }

  } catch (error) {
    console.error('❌ Upgrade Subscription Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while upgrading subscription'
    });
  }
};

module.exports = {
  createSubscription,
  getUserSubscriptions,
  getSubscriptionDetails,
  cancelSubscription,
  pauseSubscription,
  resumeSubscription,
  upgradeSubscription
};
