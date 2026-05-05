const { validationResult } = require('express-validator');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const RazorpayService = require('../services/razorpayService');

// @desc    Create payment order
// @route   POST /api/payments/create-order
// @access   Private
const createPaymentOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { amount, currency = 'INR', receipt, notes } = req.body;
    const userId = req.user.id;

    // Create Razorpay order
    const orderData = {
      amount: amount * 100, // Convert to paise
      currency,
      receipt: receipt || `order_${Date.now()}_${userId}`,
      notes: notes || {},
      payment_capture: 1
    };

    try {
      const order = await RazorpayService.createOrder(orderData);

      // Save payment record
      const payment = new Payment({
        userId,
        razorpayOrderId: order.id,
        amount,
        currency,
        status: 'created',
        description: notes?.description || 'Payment for subscription',
        metadata: {
          ...notes,
          orderId: order.id
        }
      });

      await payment.save();

      console.log('✅ Payment order created:', order.id);

      res.status(201).json({
        success: true,
        message: 'Payment order created successfully',
        data: {
          order,
          payment
        }
      });

    } catch (razorpayError) {
      console.error('❌ Razorpay order creation failed:', razorpayError);
      res.status(500).json({
        success: false,
        message: 'Failed to create payment order',
        error: razorpayError.message
      });
    }

  } catch (error) {
    console.error('❌ Create Payment Order Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating payment order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access   Private
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification parameters'
      });
    }

    // Find payment record
    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment order not found'
      });
    }

    try {
      // Verify payment signature
      const isValid = RazorpayService.verifyPaymentSignature({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      });

      if (!isValid) {
        payment.status = 'failed';
        payment.errorCode = 'INVALID_SIGNATURE';
        payment.errorDescription = 'Payment signature verification failed';
        await payment.save();

        return res.status(400).json({
          success: false,
          message: 'Invalid payment signature'
        });
      }

      // Fetch payment details from Razorpay
      const razorpayPayment = await RazorpayService.fetchPayment(razorpay_payment_id);

      // Update payment record
      payment.razorpayPaymentId = razorpay_payment_id;
      payment.status = razorpayPayment.status;
      payment.method = razorpayPayment.method;
      payment.description = razorpayPayment.description;
      payment.metadata = {
        ...payment.metadata,
        ...razorpayPayment.notes
      };

      if (razorpayPayment.status === 'captured') {
        payment.captured = true;
        payment.capturedAt = new Date();
      }

      await payment.save();

      console.log('✅ Payment verified and updated:', payment._id);

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          payment,
          razorpayPayment
        }
      });

    } catch (razorpayError) {
      console.error('❌ Payment verification failed:', razorpayError);
      payment.status = 'failed';
      payment.errorCode = 'VERIFICATION_FAILED';
      payment.errorDescription = razorpayError.message;
      await payment.save();

      res.status(500).json({
        success: false,
        message: 'Payment verification failed',
        error: razorpayError.message
      });
    }

  } catch (error) {
    console.error('❌ Verify Payment Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while verifying payment'
    });
  }
};

// @desc    Get user payment history
// @route   GET /api/payments/history
// @access   Private
const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status, method } = req.query;

    // Build filter
    const filter = { userId };
    if (status) {
      filter.status = status;
    }
    if (method) {
      filter.method = method;
    }

    const payments = await Payment.find(filter)
      .populate('subscriptionId', 'planName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(filter);

    // Calculate statistics
    const stats = await Payment.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        payments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        stats
      }
    });

  } catch (error) {
    console.error('❌ Get Payment History Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payment history'
    });
  }
};

// @desc    Get payment details
// @route   GET /api/payments/:id
// @access   Private
const getPaymentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findOne({
      _id: id,
      userId
    }).populate('subscriptionId', 'planName status');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        payment
      }
    });

  } catch (error) {
    console.error('❌ Get Payment Details Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payment details'
    });
  }
};

// @desc    Refund payment
// @route   POST /api/payments/:id/refund
// @access   Private
const refundPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;
    const userId = req.user.id;

    const payment = await Payment.findOne({
      _id: id,
      userId
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status !== 'captured') {
      return res.status(400).json({
        success: false,
        message: 'Only captured payments can be refunded'
      });
    }

    if (payment.refunded) {
      return res.status(400).json({
        success: false,
        message: 'Payment is already refunded'
      });
    }

    try {
      // Create refund in Razorpay
      const refundData = {
        payment_id: payment.razorpayPaymentId,
        amount: amount ? amount * 100 : undefined // Convert to paise
      };

      const refund = await RazorpayService.createRefund(refundData);

      // Update payment record
      payment.refunded = true;
      payment.refundAmount = amount || payment.amount;
      payment.refundedAt = new Date();
      payment.refundId = refund.id;
      payment.refundReason = reason || 'Customer requested refund';
      await payment.save();

      console.log('✅ Payment refunded:', payment._id);

      res.status(200).json({
        success: true,
        message: 'Payment refunded successfully',
        data: {
          payment,
          refund
        }
      });

    } catch (razorpayError) {
      console.error('❌ Refund failed:', razorpayError);
      res.status(500).json({
        success: false,
        message: 'Failed to process refund',
        error: razorpayError.message
      });
    }

  } catch (error) {
    console.error('❌ Refund Payment Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing refund'
    });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getPaymentHistory,
  getPaymentDetails,
  refundPayment
};
