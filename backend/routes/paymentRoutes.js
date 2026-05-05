const express = require('express');
const { body } = require('express-validator');
const {
  createPaymentOrder,
  verifyPayment,
  getPaymentHistory,
  getPaymentDetails,
  refundPayment
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation middleware
const createOrderValidation = [
  body('amount')
    .isFloat({ min: 1 })
    .withMessage('Amount must be at least 1'),
  body('currency')
    .optional()
    .isIn(['INR', 'USD'])
    .withMessage('Currency must be INR or USD'),
  body('receipt')
    .optional()
    .isLength({ max: 40 })
    .withMessage('Receipt must be less than 40 characters')
];

const verifyPaymentValidation = [
  body('razorpay_order_id')
    .notEmpty()
    .withMessage('Razorpay order ID is required'),
  body('razorpay_payment_id')
    .notEmpty()
    .withMessage('Razorpay payment ID is required'),
  body('razorpay_signature')
    .notEmpty()
    .withMessage('Razorpay signature is required')
];

const refundValidation = [
  body('amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Refund amount must be at least 0.01'),
  body('reason')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Reason must be less than 200 characters')
];

// @route   POST /api/payments/create-order
// @desc    Create payment order
// @access   Private
router.post('/create-order', protect, createOrderValidation, createPaymentOrder);

// @route   POST /api/payments/verify
// @desc    Verify payment
// @access   Private
router.post('/verify', protect, verifyPaymentValidation, verifyPayment);

// @route   GET /api/payments/history
// @desc    Get payment history
// @access   Private
router.get('/history', protect, getPaymentHistory);

// @route   GET /api/payments/:id
// @desc    Get payment details
// @access   Private
router.get('/:id', protect, getPaymentDetails);

// @route   POST /api/payments/:id/refund
// @desc    Refund payment
// @access   Private
router.post('/:id/refund', protect, refundValidation, refundPayment);

module.exports = router;
