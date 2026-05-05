const express = require('express');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { verifyWebhookSignature } = require('../utils/razorpay');

const router = express.Router();

// Middleware to parse raw body for webhook verification
router.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// @route   POST /api/webhooks/razorpay
// @desc    Handle Razorpay webhook events
// @access   Public (with signature verification)
router.post('/razorpay', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = req.rawBody ? JSON.parse(req.rawBody.toString()) : req.body;

    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature)) {
      console.error('❌ Invalid webhook signature');
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    const event = body.event;
    const payload = body.payload;

    console.log(`🔔 Webhook Event: ${event}`);

    switch (event) {
      case 'subscription.authenticated':
        await handleSubscriptionAuthenticated(payload.subscription.entity);
        break;

      case 'subscription.charged':
        await handleSubscriptionCharged(payload.subscription.entity);
        break;

      case 'subscription.completed':
        await handleSubscriptionCompleted(payload.subscription.entity);
        break;

      case 'subscription.cancelled':
        await handleSubscriptionCancelled(payload.subscription.entity);
        break;

      case 'subscription.halted':
        await handleSubscriptionHalted(payload.subscription.entity);
        break;

      case 'subscription.paused':
        await handleSubscriptionPaused(payload.subscription.entity);
        break;

      case 'subscription.resumed':
        await handleSubscriptionResumed(payload.subscription.entity);
        break;

      case 'payment.captured':
        await handlePaymentCaptured(payload.payment.entity);
        break;

      case 'payment.failed':
        await handlePaymentFailed(payload.payment.entity);
        break;

      case 'payment.refunded':
        await handlePaymentRefunded(payload.payment.entity);
        break;

      default:
        console.log(`ℹ️ Unhandled webhook event: ${event}`);
    }

    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    console.error('❌ Webhook Processing Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing webhook'
    });
  }
});

/**
 * Handle subscription authenticated event
 */
const handleSubscriptionAuthenticated = async (subscriptionData) => {
  try {
    const subscription = await Subscription.findOne({
      razorpaySubscriptionId: subscriptionData.id
    });

    if (subscription) {
      subscription.status = subscriptionData.status;
      subscription.authAt = new Date(subscriptionData.auth_at * 1000);
      subscription.nextChargeAt = subscriptionData.charge_at 
        ? new Date(subscriptionData.charge_at * 1000) 
        : undefined;
      await subscription.save();
      
      console.log(`✅ Subscription authenticated: ${subscriptionData.id}`);
    }
  } catch (error) {
    console.error('❌ Handle Subscription Authenticated Error:', error);
  }
};

/**
 * Handle subscription charged event
 */
const handleSubscriptionCharged = async (subscriptionData) => {
  try {
    const subscription = await Subscription.findOne({
      razorpaySubscriptionId: subscriptionData.id
    });

    if (subscription) {
      subscription.status = subscriptionData.status;
      subscription.paidCount = subscriptionData.paid_count;
      subscription.remainingCount = subscriptionData.remaining_count;
      subscription.nextChargeAt = subscriptionData.charge_at 
        ? new Date(subscriptionData.charge_at * 1000) 
        : undefined;
      subscription.lastChargedAt = new Date();
      await subscription.save();

      // Create payment record
      const Payment = require('../models/Payment');
      const payment = new Payment({
        userId: subscription.userId,
        subscriptionId: subscription._id,
        razorpayPaymentId: subscriptionData.charge_id || subscriptionData.id,
        razorpayOrderId: subscriptionData.id,
        amount: subscription.amount,
        currency: subscription.currency,
        status: 'captured',
        method: 'subscription',
        description: `Subscription payment for ${subscription.planName}`,
        captured: true,
        capturedAt: new Date()
      });

      await payment.save();
      
      console.log(`✅ Subscription charged: ${subscriptionData.id}`);
    }
  } catch (error) {
    console.error('❌ Handle Subscription Charged Error:', error);
  }
};

/**
 * Handle subscription completed event
 */
const handleSubscriptionCompleted = async (subscriptionData) => {
  try {
    const subscription = await Subscription.findOne({
      razorpaySubscriptionId: subscriptionData.id
    });

    if (subscription) {
      subscription.status = subscriptionData.status;
      subscription.paidCount = subscriptionData.paid_count;
      subscription.remainingCount = subscriptionData.remaining_count;
      subscription.completedAt = new Date();
      subscription.isActive = false;
      await subscription.save();
      
      console.log(`✅ Subscription completed: ${subscriptionData.id}`);
    }
  } catch (error) {
    console.error('❌ Handle Subscription Completed Error:', error);
  }
};

/**
 * Handle subscription cancelled event
 */
const handleSubscriptionCancelled = async (subscriptionData) => {
  try {
    const subscription = await Subscription.findOne({
      razorpaySubscriptionId: subscriptionData.id
    });

    if (subscription) {
      subscription.status = subscriptionData.status;
      subscription.cancelledAt = new Date();
      subscription.isActive = false;
      await subscription.save();
      
      console.log(`✅ Subscription cancelled: ${subscriptionData.id}`);
    }
  } catch (error) {
    console.error('❌ Handle Subscription Cancelled Error:', error);
  }
};

/**
 * Handle subscription halted event
 */
const handleSubscriptionHalted = async (subscriptionData) => {
  try {
    const subscription = await Subscription.findOne({
      razorpaySubscriptionId: subscriptionData.id
    });

    if (subscription) {
      subscription.status = subscriptionData.status;
      subscription.haltedAt = new Date();
      await subscription.save();
      
      console.log(`✅ Subscription halted: ${subscriptionData.id}`);
    }
  } catch (error) {
    console.error('❌ Handle Subscription Halted Error:', error);
  }
};

/**
 * Handle subscription paused event
 */
const handleSubscriptionPaused = async (subscriptionData) => {
  try {
    const subscription = await Subscription.findOne({
      razorpaySubscriptionId: subscriptionData.id
    });

    if (subscription) {
      subscription.status = subscriptionData.status;
      subscription.pausedAt = new Date();
      await subscription.save();
      
      console.log(`✅ Subscription paused: ${subscriptionData.id}`);
    }
  } catch (error) {
    console.error('❌ Handle Subscription Paused Error:', error);
  }
};

/**
 * Handle subscription resumed event
 */
const handleSubscriptionResumed = async (subscriptionData) => {
  try {
    const subscription = await Subscription.findOne({
      razorpaySubscriptionId: subscriptionData.id
    });

    if (subscription) {
      subscription.status = subscriptionData.status;
      subscription.resumedAt = new Date();
      subscription.nextChargeAt = subscriptionData.charge_at 
        ? new Date(subscriptionData.charge_at * 1000) 
        : undefined;
      await subscription.save();
      
      console.log(`✅ Subscription resumed: ${subscriptionData.id}`);
    }
  } catch (error) {
    console.error('❌ Handle Subscription Resumed Error:', error);
  }
};

/**
 * Handle payment captured event
 */
const handlePaymentCaptured = async (paymentData) => {
  try {
    const Payment = require('../models/Payment');
    
    // Update existing payment or create new one
    let payment = await Payment.findOne({
      razorpayPaymentId: paymentData.id
    });

    if (payment) {
      payment.status = 'captured';
      payment.captured = true;
      payment.capturedAt = new Date();
      payment.method = paymentData.method;
      payment.description = paymentData.description;
      await payment.save();
    } else {
      // Create new payment record (for one-time payments)
      payment = new Payment({
        userId: paymentData.notes?.userId || null,
        razorpayPaymentId: paymentData.id,
        razorpayOrderId: paymentData.order_id,
        amount: paymentData.amount / 100, // Convert from paise
        currency: paymentData.currency,
        status: 'captured',
        method: paymentData.method,
        description: paymentData.description,
        captured: true,
        capturedAt: new Date(),
        metadata: paymentData.notes || {}
      });

      await payment.save();
    }
    
    console.log(`✅ Payment captured: ${paymentData.id}`);
  } catch (error) {
    console.error('❌ Handle Payment Captured Error:', error);
  }
};

/**
 * Handle payment failed event
 */
const handlePaymentFailed = async (paymentData) => {
  try {
    const Payment = require('../models/Payment');
    
    let payment = await Payment.findOne({
      razorpayPaymentId: paymentData.id
    });

    if (payment) {
      payment.status = 'failed';
      payment.errorCode = paymentData.error_code;
      payment.errorDescription = paymentData.error_description;
      payment.failedAt = new Date();
      await payment.save();
    }
    
    console.log(`❌ Payment failed: ${paymentData.id} - ${paymentData.error_description}`);
  } catch (error) {
    console.error('❌ Handle Payment Failed Error:', error);
  }
};

/**
 * Handle payment refunded event
 */
const handlePaymentRefunded = async (paymentData) => {
  try {
    const Payment = require('../models/Payment');
    
    let payment = await Payment.findOne({
      razorpayPaymentId: paymentData.payment_id
    });

    if (payment) {
      payment.refunded = true;
      payment.refundAmount = paymentData.amount / 100; // Convert from paise
      payment.refundedAt = new Date();
      payment.refundId = paymentData.id;
      await payment.save();
    }
    
    console.log(`💰 Payment refunded: ${paymentData.payment_id} - Amount: ${paymentData.amount / 100}`);
  } catch (error) {
    console.error('❌ Handle Payment Refunded Error:', error);
  }
};

module.exports = router;
