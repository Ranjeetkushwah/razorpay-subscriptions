const mongoose = require('mongoose');
const Plan = require('../models/Plan');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const RazorpayService = require('../services/razorpayService');
require('dotenv').config();

async function testSubscriptionCreation() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get a test user
    const user = await User.findOne({ razorpayCustomerId: { $exists: true } });
    if (!user) {
      console.log('❌ No user with Razorpay customer ID found');
      return;
    }

    console.log('👤 Test user:', user.name, user.email);

    // Get the Professional Plan
    const plan = await Plan.findOne({ name: 'Professional Plan' });
    if (!plan || !plan.razorpayPlanId) {
      console.log('❌ Professional Plan not found or missing Razorpay ID');
      return;
    }

    console.log('📋 Test plan:', plan.name, 'Razorpay ID:', plan.razorpayPlanId);

    // Test subscription creation
    console.log('\n🔧 Testing subscription creation...');
    
    const startAt = Math.floor((Date.now() + 60000) / 1000); // 1 minute from now
    const totalCount = 12;
    
    try {
      const razorpaySubscription = await RazorpayService.createSubscription(
        user.razorpayCustomerId,
        plan.razorpayPlanId,
        totalCount,
        startAt,
        {
          userId: user._id.toString(),
          planId: plan._id.toString(),
          planName: plan.name,
          test: 'subscription_creation_test'
        }
      );

      console.log('✅ Razorpay subscription created:', razorpaySubscription.id);

      // Create subscription in database
      const subscription = new Subscription({
        userId: user._id,
        razorpaySubscriptionId: razorpaySubscription.id,
        razorpayPlanId: plan.razorpayPlanId,
        razorpayCustomerId: user.razorpayCustomerId,
        status: razorpaySubscription.status,
        planName: plan.name,
        amount: plan.amount,
        currency: plan.currency,
        frequency: plan.frequency,
        totalCount: razorpaySubscription.total_count,
        paidCount: razorpaySubscription.paid_count,
        remainingCount: razorpaySubscription.remaining_count,
        startAt: new Date(razorpaySubscription.start_at * 1000),
        endAt: new Date(razorpaySubscription.end_at * 1000),
        authAt: razorpaySubscription.auth_at ? new Date(razorpaySubscription.auth_at * 1000) : undefined,
        nextChargeAt: razorpaySubscription.charge_at ? new Date(razorpaySubscription.charge_at * 1000) : undefined,
        shortUrl: razorpaySubscription.short_url,
        notes: razorpaySubscription.notes,
      });

      await subscription.save();

      console.log('✅ Database subscription created:', subscription._id);
      console.log('📱 Payment URL:', razorpaySubscription.short_url);

      console.log('\n🎯 Subscription creation test completed successfully!');

    } catch (razorpayError) {
      console.error('❌ Razorpay subscription creation failed:', razorpayError.error?.description || razorpayError.message);
      console.error('Full error:', JSON.stringify(razorpayError, null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the function
testSubscriptionCreation();
