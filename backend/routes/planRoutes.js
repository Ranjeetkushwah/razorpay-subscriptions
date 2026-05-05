const express = require('express');
const { body } = require('express-validator');
const {
  createPlan,
  getAllPlans,
  getPlanById,
  updatePlan,
  deletePlan,
  getPlanStats
} = require('../controllers/planController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation middleware
const createPlanValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Plan name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('amount')
    .isFloat({ min: 1 })
    .withMessage('Amount must be at least 1'),
  body('currency')
    .optional()
    .isIn(['INR', 'USD'])
    .withMessage('Currency must be INR or USD'),
  body('frequency')
    .isIn(['daily', 'weekly', 'monthly', 'yearly'])
    .withMessage('Frequency must be daily, weekly, monthly, or yearly'),
  body('period')
    .isInt({ min: 1 })
    .withMessage('Period must be at least 1'),
  body('totalCount')
    .isInt({ min: 1, max: 365 })
    .withMessage('Total count must be between 1 and 365'),
  body('features')
    .isArray({ min: 1 })
    .withMessage('Features must be an array with at least 1 item'),
  body('popular')
    .optional()
    .isBoolean()
    .withMessage('Popular must be a boolean')
];

const updatePlanValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Plan name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('amount')
    .optional()
    .isFloat({ min: 1 })
    .withMessage('Amount must be at least 1'),
  body('currency')
    .optional()
    .isIn(['INR', 'USD'])
    .withMessage('Currency must be INR or USD'),
  body('frequency')
    .optional()
    .isIn(['daily', 'weekly', 'monthly', 'yearly'])
    .withMessage('Frequency must be daily, weekly, monthly, or yearly'),
  body('period')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Period must be at least 1'),
  body('totalCount')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Total count must be between 1 and 365'),
  body('features')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Features must be an array with at least 1 item'),
  body('popular')
    .optional()
    .isBoolean()
    .withMessage('Popular must be a boolean')
];

// @route   POST /api/plans
// @desc    Create plan
// @access   Private (Admin)
router.post('/', protect, adminOnly, createPlanValidation, createPlan);

// @route   GET /api/plans
// @desc    Get all plans
// @access   Public
router.get('/', getAllPlans);

// @route   GET /api/plans/stats
// @desc    Get plan statistics
// @access   Private (Admin)
router.get('/stats', protect, adminOnly, getPlanStats);

// @route   GET /api/plans/razorpay-status
// @desc    Check Razorpay connection status
// @access   Public
router.get('/razorpay-status', (req, res) => {
  try {
    // Check if Razorpay credentials are configured
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay credentials not configured'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Razorpay is configured',
      data: {
        keyId: process.env.RAZORPAY_KEY_ID,
        status: 'connected'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking Razorpay status'
    });
  }
});

// @route   GET /api/plans/:id
// @desc    Get plan by ID
// @access   Public
router.get('/:id', getPlanById);

// @route   PUT /api/plans/:id
// @desc    Update plan
// @access   Private (Admin)
router.put('/:id', protect, adminOnly, updatePlanValidation, updatePlan);

// @route   DELETE /api/plans/:id
// @desc    Delete plan
// @access   Private (Admin)
router.delete('/:id', protect, adminOnly, deletePlan);

module.exports = router;
