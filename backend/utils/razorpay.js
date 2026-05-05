const razorpay = require('razorpay');
const crypto = require('crypto');
require('dotenv').config();

// Initialize Razorpay instance
const instance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create a Razorpay customer
 * @param {string} email - Customer email
 * @param {string} name - Customer name
 * @param {string} phone - Customer phone
 * @returns {Promise<object>} Razorpay customer object
 */
const createCustomer = async (email, name, phone) => {
  try {
    const customer = await instance.customers.create({
      name,
      email,
      contact: phone,
      notes: {
        created_at: new Date().toISOString()
      }
    });
    return customer;
  } catch (error) {
    console.error('❌ Create Customer Error:', error);
    throw error;
  }
};

/**
 * Update a Razorpay customer
 * @param {string} customerId - Razorpay customer ID
 * @param {object} updateData - Data to update
 * @returns {Promise<object>} Updated customer object
 */
const updateCustomer = async (customerId, updateData) => {
  try {
    const customer = await instance.customers.edit(customerId, updateData);
    return customer;
  } catch (error) {
    console.error('❌ Update Customer Error:', error);
    throw error;
  }
};

/**
 * Delete a Razorpay customer
 * @param {string} customerId - Razorpay customer ID
 * @returns {Promise<object>} Deleted customer object
 */
const deleteCustomer = async (customerId) => {
  try {
    const customer = await instance.customers.delete(customerId);
    return customer;
  } catch (error) {
    console.error('❌ Delete Customer Error:', error);
    throw error;
  }
};

/**
 * Create a Razorpay plan
 * @param {object} planData - Plan data
 * @returns {Promise<object>} Razorpay plan object
 */
const createPlan = async (planData) => {
  try {
    const plan = await instance.plans.create({
      period: planData.period,
      interval: planData.frequency,
      item: {
        name: planData.name,
        description: planData.description,
        amount: planData.amount * 100, // Convert to paise
        currency: planData.currency || 'INR',
      },
      notes: planData.notes || {},
    });
    return plan;
  } catch (error) {
    console.error('❌ Create Plan Error:', error);
    throw error;
  }
};

/**
 * Delete a Razorpay plan
 * @param {string} planId - Razorpay plan ID
 * @returns {Promise<object>} Deleted plan object
 */
const deletePlan = async (planId) => {
  try {
    const plan = await instance.plans.delete(planId);
    return plan;
  } catch (error) {
    console.error('❌ Delete Plan Error:', error);
    throw error;
  }
};

/**
 * Create a Razorpay subscription
 * @param {string} customerId - Razorpay customer ID
 * @param {string} planId - Razorpay plan ID
 * @param {number} totalCount - Total count for subscription
 * @param {number} startAt - Start timestamp
 * @param {object} notes - Additional notes
 * @returns {Promise<object>} Razorpay subscription object
 */
const createSubscription = async (customerId, planId, totalCount, startAt, notes = {}) => {
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
    console.error('❌ Create Subscription Error:', error);
    throw error;
  }
};

/**
 * Fetch a Razorpay subscription
 * @param {string} subscriptionId - Razorpay subscription ID
 * @returns {Promise<object>} Razorpay subscription object
 */
const fetchSubscription = async (subscriptionId) => {
  try {
    const subscription = await instance.subscriptions.fetch(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('❌ Fetch Subscription Error:', error);
    throw error;
  }
};

/**
 * Cancel a Razorpay subscription
 * @param {string} subscriptionId - Razorpay subscription ID
 * @param {boolean} cancelAtCycleEnd - Whether to cancel at cycle end
 * @returns {Promise<object>} Cancelled subscription object
 */
const cancelSubscription = async (subscriptionId, cancelAtCycleEnd = false) => {
  try {
    const subscription = await instance.subscriptions.cancel(subscriptionId, {
      cancel_at_cycle_end: cancelAtCycleEnd,
    });
    return subscription;
  } catch (error) {
    console.error('❌ Cancel Subscription Error:', error);
    throw error;
  }
};

/**
 * Pause a Razorpay subscription
 * @param {string} subscriptionId - Razorpay subscription ID
 * @returns {Promise<object>} Paused subscription object
 */
const pauseSubscription = async (subscriptionId) => {
  try {
    const subscription = await instance.subscriptions.pause(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('❌ Pause Subscription Error:', error);
    throw error;
  }
};

/**
 * Resume a Razorpay subscription
 * @param {string} subscriptionId - Razorpay subscription ID
 * @returns {Promise<object>} Resumed subscription object
 */
const resumeSubscription = async (subscriptionId) => {
  try {
    const subscription = await instance.subscriptions.resume(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('❌ Resume Subscription Error:', error);
    throw error;
  }
};

/**
 * Create a Razorpay order
 * @param {object} orderData - Order data
 * @returns {Promise<object>} Razorpay order object
 */
const createOrder = async (orderData) => {
  try {
    const order = await instance.orders.create(orderData);
    return order;
  } catch (error) {
    console.error('❌ Create Order Error:', error);
    throw error;
  }
};

/**
 * Fetch a Razorpay payment
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise<object>} Razorpay payment object
 */
const fetchPayment = async (paymentId) => {
  try {
    const payment = await instance.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error('❌ Fetch Payment Error:', error);
    throw error;
  }
};

/**
 * Create a Razorpay refund
 * @param {object} refundData - Refund data
 * @returns {Promise<object>} Razorpay refund object
 */
const createRefund = async (refundData) => {
  try {
    const refund = await instance.refunds.create(refundData);
    return refund;
  } catch (error) {
    console.error('❌ Create Refund Error:', error);
    throw error;
  }
};

/**
 * Verify Razorpay webhook signature
 * @param {object} body - Webhook body
 * @param {string} signature - Razorpay signature
 * @returns {boolean} Whether signature is valid
 */
const verifyWebhookSignature = (body, signature) => {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(JSON.stringify(body))
      .digest('hex');

    return expectedSignature === signature;
  } catch (error) {
    console.error('❌ Webhook Signature Verification Error:', error);
    return false;
  }
};

/**
 * Verify payment signature
 * @param {object} paymentData - Payment verification data
 * @returns {boolean} Whether signature is valid
 */
const verifyPaymentSignature = (paymentData) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;
    
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    return expectedSignature === razorpay_signature;
  } catch (error) {
    console.error('❌ Payment Signature Verification Error:', error);
    return false;
  }
};

/**
 * Get Razorpay instance
 * @returns {object} Razorpay instance
 */
const getInstance = () => {
  return instance;
};

module.exports = {
  createCustomer,
  updateCustomer,
  deleteCustomer,
  createPlan,
  deletePlan,
  createSubscription,
  fetchSubscription,
  cancelSubscription,
  pauseSubscription,
  resumeSubscription,
  createOrder,
  fetchPayment,
  createRefund,
  verifyWebhookSignature,
  verifyPaymentSignature,
  getInstance
};
