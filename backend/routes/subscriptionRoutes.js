const express = require('express');
const { body } = require('express-validator');
const {
  createSubscription,
  getUserSubscriptions,
  getSubscriptionDetails,
  cancelSubscription,
  pauseSubscription,
  resumeSubscription,
  upgradeSubscription
} = require('../controllers/subscriptionController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation middleware
const createSubscriptionValidation = [
  body('planId')
    .notEmpty()
    .withMessage('Plan ID is required')
    .isMongoId()
    .withMessage('Invalid plan ID'),
  body('totalCount')
    .optional()
    .isInt({ min: 1, max: 60 })
    .withMessage('Total count must be between 1 and 60')
];

const upgradeSubscriptionValidation = [
  body('newPlanId')
    .notEmpty()
    .withMessage('New plan ID is required')
    .isMongoId()
    .withMessage('Invalid new plan ID')
];

const cancelSubscriptionValidation = [
  body('cancelAtCycleEnd')
    .optional()
    .isBoolean()
    .withMessage('cancelAtCycleEnd must be a boolean')
];

// @route   POST /api/subscriptions/create
// @desc    Create subscription
// @access   Private
router.post('/create', protect, createSubscriptionValidation, createSubscription);

// @route   GET /api/subscriptions/my-subscriptions
// @desc    Get user subscriptions
// @access   Private
router.get('/my-subscriptions', protect, getUserSubscriptions);

// @route   GET /api/subscriptions/:id
// @desc    Get subscription details
// @access   Private
router.get('/:id', protect, getSubscriptionDetails);

// @route   POST /api/subscriptions/:id/cancel
// @desc    Cancel subscription
// @access   Private
router.post('/:id/cancel', protect, cancelSubscriptionValidation, cancelSubscription);

// @route   POST /api/subscriptions/:id/pause
// @desc    Pause subscription
// @access   Private
router.post('/:id/pause', protect, pauseSubscription);

// @route   POST /api/subscriptions/:id/resume
// @desc    Resume subscription
// @access   Private
router.post('/:id/resume', protect, resumeSubscription);

// @route   PUT /api/subscriptions/:id/upgrade
// @desc    Upgrade/Downgrade subscription
// @access   Private
router.put('/:id/upgrade', protect, upgradeSubscriptionValidation, upgradeSubscription);

module.exports = router;
