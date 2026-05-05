const { validationResult } = require('express-validator');
const Plan = require('../models/Plan');
const RazorpayService = require('../services/razorpayService');

// @desc    Create plan
// @route   POST /api/plans
// @access   Private (Admin)
const createPlan = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      name,
      description,
      amount,
      currency = 'INR',
      frequency,
      period,
      totalCount,
      features,
      popular = false
    } = req.body;

    // Check if plan with same name exists
    const existingPlan = await Plan.findOne({ name });
    if (existingPlan) {
      return res.status(400).json({
        success: false,
        message: 'Plan with this name already exists'
      });
    }

    try {
      // Create Razorpay plan
      const razorpayPlan = await RazorpayService.createPlan({
        name,
        description,
        amount,
        currency,
        frequency,
        period,
        notes: {
          features: features.join(', '),
          popular
        }
      });

      // Create plan in database
      const plan = new Plan({
        name,
        description,
        amount,
        currency,
        frequency,
        period,
        totalCount,
        features,
        popular,
        razorpayPlanId: razorpayPlan.id
      });

      await plan.save();

      console.log('✅ Plan created:', plan._id);

      res.status(201).json({
        success: true,
        message: 'Plan created successfully',
        data: {
          plan,
          razorpayPlan
        }
      });

    } catch (razorpayError) {
      console.error('❌ Razorpay plan creation failed:', razorpayError);
      res.status(500).json({
        success: false,
        message: 'Failed to create plan in Razorpay',
        error: razorpayError.message
      });
    }

  } catch (error) {
    console.error('❌ Create Plan Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating plan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all plans
// @route   GET /api/plans
// @access   Public
const getAllPlans = async (req, res) => {
  try {
    const { page = 1, limit = 10, frequency, popular } = req.query;

    // Build filter
    const filter = { isActive: true };
    if (frequency) {
      filter.frequency = frequency;
    }
    if (popular === 'true') {
      filter.popular = true;
    }

    const plans = await Plan.find(filter)
      .sort({ popular: -1, amount: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Plan.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        plans,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('❌ Get All Plans Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching plans'
    });
  }
};

// @desc    Get plan by ID
// @route   GET /api/plans/:id
// @access   Public
const getPlanById = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await Plan.findById(id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        plan
      }
    });

  } catch (error) {
    console.error('❌ Get Plan By ID Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching plan'
    });
  }
};

// @desc    Update plan
// @route   PUT /api/plans/:id
// @access   Private (Admin)
const updatePlan = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    const plan = await Plan.findById(id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    // Don't allow updating Razorpay plan ID directly
    delete updateData.razorpayPlanId;

    try {
      // Update plan in database
      const updatedPlan = await Plan.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      console.log('✅ Plan updated:', updatedPlan._id);

      res.status(200).json({
        success: true,
        message: 'Plan updated successfully',
        data: {
          plan: updatedPlan
        }
      });

    } catch (error) {
      console.error('❌ Update Plan Error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while updating plan'
      });
    }

  } catch (error) {
    console.error('❌ Update Plan Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating plan'
    });
  }
};

// @desc    Delete plan
// @route   DELETE /api/plans/:id
// @access   Private (Admin)
const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await Plan.findById(id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    // Check if plan has active subscriptions
    const Subscription = require('../models/Subscription');
    const activeSubscriptions = await Subscription.countDocuments({
      razorpayPlanId: plan.razorpayPlanId,
      status: { $in: ['active', 'created', 'authenticated'] }
    });

    if (activeSubscriptions > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete plan with active subscriptions'
      });
    }

    try {
      // Delete Razorpay plan if it exists
      if (plan.razorpayPlanId) {
        try {
          await RazorpayService.deletePlan(plan.razorpayPlanId);
          console.log('✅ Razorpay plan deleted:', plan.razorpayPlanId);
        } catch (razorpayError) {
          console.error('⚠️ Razorpay plan deletion failed:', razorpayError.message);
        }
      }

      // Soft delete in database
      await Plan.findByIdAndUpdate(id, { 
        isActive: false, 
        deletedAt: new Date() 
      });

      console.log('✅ Plan deleted:', plan._id);

      res.status(200).json({
        success: true,
        message: 'Plan deleted successfully'
      });

    } catch (error) {
      console.error('❌ Delete Plan Error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while deleting plan'
      });
    }

  } catch (error) {
    console.error('❌ Delete Plan Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting plan'
    });
  }
};

// @desc    Get plan statistics
// @route   GET /api/plans/stats
// @access   Private (Admin)
const getPlanStats = async (req, res) => {
  try {
    const stats = await Plan.aggregate([
      {
        $group: {
          _id: null,
          totalPlans: { $sum: 1 },
          activePlans: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          popularPlans: {
            $sum: { $cond: [{ $eq: ['$popular', true] }, 1, 0] }
          },
          avgAmount: { $avg: '$amount' }
        }
      }
    ]);

    const frequencyStats = await Plan.aggregate([
      {
        $group: {
          _id: '$frequency',
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: stats[0] || {},
        frequencyStats
      }
    });

  } catch (error) {
    console.error('❌ Get Plan Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching plan statistics'
    });
  }
};

module.exports = {
  createPlan,
  getAllPlans,
  getPlanById,
  updatePlan,
  deletePlan,
  getPlanStats
};
