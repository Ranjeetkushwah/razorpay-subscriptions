const mongoose = require('mongoose');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');
const RazorpayService = require('../utils/razorpay');
require('dotenv').config();

// Sample subscription data
const sampleSubscriptions = [
  {
    userId: '65f9b698a911c8a80bcd1576',
    planName: 'Professional Plan',
    status: 'active',
    amount: 299,
    currency: 'INR',
    frequency: 'monthly',
    paidCount: 3,
    remainingCount: 9,
    nextChargeAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    shortUrl: 'https://rzp_test_SatrrxFwKXJX8e.rzp.io/v1/subscriptions/65f9b698a911c8a80bcd1576/success',
    razorpaySubscriptionId: 'sub_PzPROFESSIONAL123',
    razorpayPlanId: 'plan_PzPROFESSIONAL123',
    razorpayCustomerId: 'cust_MQ7H5L4aK8',
    notes: {
      planId: '69f9b698a911c8a80bcd1576',
      planName: 'Professional Plan',
      userId: '65f9b698a911c8a80bcd1576',
      created_at: new Date().toISOString()
    }
  },
  {
    userId: '65f9b698a911c8a80bcd1577',
    planName: 'Starter Plan',
    status: 'completed',
    amount: 99,
    currency: 'INR',
    frequency: 'monthly',
    paidCount: 12,
    remainingCount: 0,
    nextChargeAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    shortUrl: 'https://rzp_test_SatrrxFwKXJX8e.rzp.io/v1/subscriptions/69f9b698a911c8a80bcd1576/success',
    razorpaySubscriptionId: 'plan_PzSTARTER123',
    razorpayPlanId: 'plan_PzSTARTER123',
    razorpayCustomerId: 'cust_MQ7H5L4aK8',
    notes: {
      planId: '69f9b698a911c8a80bcd1576',
      planName: 'Starter Plan',
      userId: '65f9b698a911c8a80bcd1576',
      created_at: new Date().toISOString()
    }
  },
  {
    userId: '65f9b698a911c8a80bcd1577',
    planName: 'Business Plan',
    status: 'paused',
    amount: 599,
    currency: 'INR',
    frequency: 'monthly',
    paidCount: 6,
    remainingCount: 6,
    nextChargeAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    shortUrl: 'https://rzp_test_SatrrxFwKXJX8e.rzp.io/v1/subscriptions/69f9b698a911c8a80bcd1577/paused',
    razorpaySubscriptionId: 'plan_PzBUSINESS123',
    razorpayCustomerId: 'cust_MQ7H5L4aK8',
    notes: {
      planId: '69f9b698a911c8a80bcd1577',
      planName: 'Business Plan',
      userId: '65f9b698a911c8a80bcd1577',
      created_at: new Date().toISOString()
    }
  },
  {
    userId: '65f9b698a911c8a80bcd1576',
    planName: 'Weekly Trial',
    status: 'cancelled',
    amount: 25,
    currency: 'INR',
    frequency: 'weekly',
    paidCount: 2,
    remainingCount: 2,
    nextChargeAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    shortUrl: 'https://rzp_test_SatrrxFwKXJX8e.rzp.io/v1/subscriptions/69f9b698a911c8a80bcd1576/cancelled',
    razorpaySubscriptionId: 'plan_PzWEEKLY123',
    razorpayCustomerId: 'cust_MQ7H5L4aK8',
    notes: {
      planId: '69f9b698a911c8a80bcd1576',
      planName: 'Weekly Trial',
      userId: '65f9b698a911c8a80bcd1576',
      created_at: new Date().toISOString()
    }
  }
];

async function seedSubscriptions() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing subscriptions
    console.log('🗑️ Clearing existing subscriptions...');
    await Subscription.deleteMany({});
    console.log('✅ Existing subscriptions cleared');

    // Get users
    const users = await User.find({}).select('_id email');
    console.log(`📋 Found ${users.length} users`);

    // Create subscriptions for each user
    for (const subscriptionData of sampleSubscriptions) {
      const { userId, planName, status, amount, currency, frequency, paidCount, remainingCount, nextChargeAt, shortUrl, razorpaySubscriptionId, razorpayCustomerId, notes } = subscriptionData;
      
      // Find user
      const user = users.find(u => u._id.toString() === userId);
      
      if (!user) {
        console.error(`❌ User not found: ${userId}`);
        continue;
      }

      console.log(`🔄 Creating subscription for user: ${user.email}`);
      
      // Create subscription in database
      const subscription = new Subscription({
        userId,
        razorpaySubscriptionId: razorpaySubscriptionId,
        status,
        planName,
        amount,
        currency,
        frequency,
        paidCount,
        remainingCount,
        startAt: new Date(),
        endAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        nextChargeAt,
        shortUrl,
        notes
      });

      await subscription.save();
      console.log(`✅ Created subscription for user: ${user.email}`);
    }

    console.log('\n🎉 Sample subscriptions seeded successfully!');
    console.log('\n📋 Created Subscriptions Summary:');
    
    // Display created subscriptions
    const createdSubscriptions = await Subscription.find({}).populate('userId', 'email');
    console.log('User ID | Plan | Status | Paid Count | Amount | Next Charge');
    console.log('------|------|--------|-------|------');
    
    createdSubscriptions.forEach((sub, index) => {
      console.log(`${sub.userId} | ${sub.planName} | ${sub.status} | ${sub.paidCount} | ₹${sub.amount} | ${sub.nextChargeAt ? new Date(sub.nextChargeAt).toLocaleDateString() : 'N/A'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the function
seedSubscriptions();
