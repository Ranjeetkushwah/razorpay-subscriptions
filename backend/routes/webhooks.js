const express = require('express');
const crypto = require('crypto');
const Subscription = require('../models/Subscription');
const RazorpayService = require('../services/razorpayService');

const router = express.Router();

// Webhook endpoint for Razorpay events
router.post('/razorpay', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = req.body;

    // Verify webhook signature
    if (!RazorpayService.verifyWebhookSignature(body, signature)) {
      console.error('Invalid webhook signature');
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature',
      });
    }

    const event = JSON.parse(body);
    console.log('Webhook event received:', event.event);

    // Handle different webhook events
    switch (event.event) {
      case 'subscription.authenticated':
        await handleSubscriptionAuthenticated(event);
        break;
      
      case 'subscription.charged':
        await handleSubscriptionCharged(event);
        break;
      
      case 'subscription.completed':
        await handleSubscriptionCompleted(event);
        break;
      
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event);
        break;
      
      case 'subscription.halted':
        await handleSubscriptionHalted(event);
        break;
      
      case 'subscription.paused':
        await handleSubscriptionPaused(event);
        break;
      
      case 'subscription.resumed':
        await handleSubscriptionResumed(event);
        break;
      
      case 'payment.captured':
        await handlePaymentCaptured(event);
        break;
      
      case 'payment.failed':
        await handlePaymentFailed(event);
        break;
      
      default:
        console.log('Unhandled webhook event:', event.event);
    }

    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing webhook',
    });
  }
});

// Handle subscription authenticated event
async function handleSubscriptionAuthenticated(event) {
  try {
    const subscriptionData = event.payload.subscription.entity;
    
    const subscription = await Subscription.findOne({
      razorpaySubscriptionId: subscriptionData.id,
    });

    if (subscription) {
      subscription.status = subscriptionData.status;
      subscription.authAt = new Date(subscriptionData.auth_at * 1000);
      subscription.nextChargeAt = subscriptionData.charge_at ? new Date(subscriptionData.charge_at * 1000) : undefined;
      await subscription.save();
      
      console.log(`Subscription ${subscriptionData.id} authenticated successfully`);
    }
  } catch (error) {
    console.error('Error handling subscription authenticated:', error);
  }
}

// Handle subscription charged event
async function handleSubscriptionCharged(event) {
  try {
    const subscriptionData = event.payload.subscription.entity;
    
    const subscription = await Subscription.findOne({
      razorpaySubscriptionId: subscriptionData.id,
    });

    if (subscription) {
      subscription.status = subscriptionData.status;
      subscription.paidCount = subscriptionData.paid_count;
      subscription.remainingCount = subscriptionData.remaining_count;
      subscription.nextChargeAt = subscriptionData.charge_at ? new Date(subscriptionData.charge_at * 1000) : undefined;
      await subscription.save();
      
      console.log(`Subscription ${subscriptionData.id} charged successfully`);
    }
  } catch (error) {
    console.error('Error handling subscription charged:', error);
  }
}

// Handle subscription completed event
async function handleSubscriptionCompleted(event) {
  try {
    const subscriptionData = event.payload.subscription.entity;
    
    const subscription = await Subscription.findOne({
      razorpaySubscriptionId: subscriptionData.id,
    });

    if (subscription) {
      subscription.status = subscriptionData.status;
      subscription.paidCount = subscriptionData.paid_count;
      subscription.remainingCount = subscriptionData.remaining_count;
      subscription.isActive = false;
      await subscription.save();
      
      console.log(`Subscription ${subscriptionData.id} completed successfully`);
    }
  } catch (error) {
    console.error('Error handling subscription completed:', error);
  }
}

// Handle subscription cancelled event
async function handleSubscriptionCancelled(event) {
  try {
    const subscriptionData = event.payload.subscription.entity;
    
    const subscription = await Subscription.findOne({
      razorpaySubscriptionId: subscriptionData.id,
    });

    if (subscription) {
      subscription.status = subscriptionData.status;
      subscription.isActive = false;
      await subscription.save();
      
      console.log(`Subscription ${subscriptionData.id} cancelled`);
    }
  } catch (error) {
    console.error('Error handling subscription cancelled:', error);
  }
}

// Handle subscription halted event
async function handleSubscriptionHalted(event) {
  try {
    const subscriptionData = event.payload.subscription.entity;
    
    const subscription = await Subscription.findOne({
      razorpaySubscriptionId: subscriptionData.id,
    });

    if (subscription) {
      subscription.status = subscriptionData.status;
      await subscription.save();
      
      console.log(`Subscription ${subscriptionData.id} halted`);
    }
  } catch (error) {
    console.error('Error handling subscription halted:', error);
  }
}

// Handle subscription paused event
async function handleSubscriptionPaused(event) {
  try {
    const subscriptionData = event.payload.subscription.entity;
    
    const subscription = await Subscription.findOne({
      razorpaySubscriptionId: subscriptionData.id,
    });

    if (subscription) {
      subscription.status = subscriptionData.status;
      await subscription.save();
      
      console.log(`Subscription ${subscriptionData.id} paused`);
    }
  } catch (error) {
    console.error('Error handling subscription paused:', error);
  }
}

// Handle subscription resumed event
async function handleSubscriptionResumed(event) {
  try {
    const subscriptionData = event.payload.subscription.entity;
    
    const subscription = await Subscription.findOne({
      razorpaySubscriptionId: subscriptionData.id,
    });

    if (subscription) {
      subscription.status = subscriptionData.status;
      subscription.nextChargeAt = subscriptionData.charge_at ? new Date(subscriptionData.charge_at * 1000) : undefined;
      await subscription.save();
      
      console.log(`Subscription ${subscriptionData.id} resumed`);
    }
  } catch (error) {
    console.error('Error handling subscription resumed:', error);
  }
}

// Handle payment captured event
async function handlePaymentCaptured(event) {
  try {
    const paymentData = event.payload.payment.entity;
    console.log(`Payment captured: ${paymentData.id} for amount ${paymentData.amount / 100}`);
    
    // You can add additional logic here like:
    // - Send email receipts
    // - Update user credits/balance
    // - Trigger notifications
  } catch (error) {
    console.error('Error handling payment captured:', error);
  }
}

// Handle payment failed event
async function handlePaymentFailed(event) {
  try {
    const paymentData = event.payload.payment.entity;
    console.log(`Payment failed: ${paymentData.id} for amount ${paymentData.amount / 100}`);
    
    // You can add additional logic here like:
    // - Send payment failure notifications
    // - Update subscription status
    // - Retry logic
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

module.exports = router;
