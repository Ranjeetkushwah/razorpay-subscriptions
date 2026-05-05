require('dotenv').config();
const razorpay = require('razorpay');
const crypto = require('crypto');

const instance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

class RazorpayService {
  // Create a customer
  static async createCustomer(email, name, phone) {
    try {
      const customer = await instance.customers.create({
        name,
        email,
        contact: phone,
      });
      return customer;
    } catch (error) {
      console.error('Error creating Razorpay customer:', error);
      throw error;
    }
  }

  // Create a plan
  static async createPlan(planData) {
    try {
      const plan = await instance.plans.create({
        period: planData.frequency, // frequency should be daily/weekly/monthly/yearly
        interval: planData.period, // period should be an integer
        item: {
          name: planData.name,
          description: planData.description,
          amount: planData.amount * 100, // Razorpay expects amount in paise
          currency: planData.currency || 'INR',
        },
        notes: planData.notes || {},
      });
      return plan;
    } catch (error) {
      console.error('Error creating Razorpay plan:', error);
      throw error;
    }
  }

  // Create a subscription
  static async createSubscription(customerId, planId, totalCount, startAt, notes = {}) {
    try {
      const subscription = await instance.subscriptions.create({
        customer_id: customerId,
        plan_id: planId,
        total_count: totalCount,
        start_at: startAt,
        notes: notes,
      });
      return subscription;
    } catch (error) {
      console.error('Error creating Razorpay subscription:', error);
      throw error;
    }
  }

  // Fetch subscription details
  static async fetchSubscription(subscriptionId) {
    try {
      const subscription = await instance.subscriptions.fetch(subscriptionId);
      return subscription;
    } catch (error) {
      console.error('Error fetching Razorpay subscription:', error);
      throw error;
    }
  }

  // Cancel subscription
  static async cancelSubscription(subscriptionId, cancelAtCycleEnd = false) {
    try {
      const subscription = await instance.subscriptions.cancel(subscriptionId, {
        cancel_at_cycle_end: cancelAtCycleEnd,
      });
      return subscription;
    } catch (error) {
      console.error('Error cancelling Razorpay subscription:', error);
      throw error;
    }
  }

  // Pause subscription
  static async pauseSubscription(subscriptionId) {
    try {
      const subscription = await instance.subscriptions.pause(subscriptionId);
      return subscription;
    } catch (error) {
      console.error('Error pausing Razorpay subscription:', error);
      throw error;
    }
  }

  // Resume subscription
  static async resumeSubscription(subscriptionId) {
    try {
      const subscription = await instance.subscriptions.resume(subscriptionId);
      return subscription;
    } catch (error) {
      console.error('Error resuming Razorpay subscription:', error);
      throw error;
    }
  }

  // Update subscription
  static async updateSubscription(subscriptionId, updates) {
    try {
      const subscription = await instance.subscriptions.update(subscriptionId, updates);
      return subscription;
    } catch (error) {
      console.error('Error updating Razorpay subscription:', error);
      throw error;
    }
  }

  // Verify webhook signature
  static verifyWebhookSignature(body, signature) {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(JSON.stringify(body))
        .digest('hex');
      
      return expectedSignature === signature;
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  // Create payment link for one-time payments
  static async createPaymentLink(amount, description, customer) {
    try {
      const paymentLink = await instance.paymentLink.create({
        amount: amount * 100, // Convert to paise
        currency: 'INR',
        accept_partial: false,
        description,
        customer,
        notes: {},
        callback_url: `${process.env.FRONTEND_URL}/payment-success`,
        callback_method: 'get',
      });
      return paymentLink;
    } catch (error) {
      console.error('Error creating payment link:', error);
      throw error;
    }
  }

  // Get all plans
  static async getAllPlans() {
    try {
      const plans = await instance.plans.all({
        count: 100,
      });
      return plans;
    } catch (error) {
      console.error('Error fetching Razorpay plans:', error);
      throw error;
    }
  }

  // Get customer subscriptions
  static async getCustomerSubscriptions(customerId) {
    try {
      const subscriptions = await instance.subscriptions.all({
        customer_id: customerId,
        count: 100,
      });
      return subscriptions;
    } catch (error) {
      console.error('Error fetching customer subscriptions:', error);
      throw error;
    }
  }

  // Create order
  static async createOrder(orderData) {
    try {
      const order = await instance.orders.create(orderData);
      return order;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw error;
    }
  }

  // Fetch payment
  static async fetchPayment(paymentId) {
    try {
      const payment = await instance.payments.fetch(paymentId);
      return payment;
    } catch (error) {
      console.error('Error fetching Razorpay payment:', error);
      throw error;
    }
  }

  // Capture payment
  static async capturePayment(paymentId, amount) {
    try {
      const payment = await instance.payments.capture(paymentId, amount * 100, 'INR');
      return payment;
    } catch (error) {
      console.error('Error capturing Razorpay payment:', error);
      throw error;
    }
  }
}

module.exports = RazorpayService;
