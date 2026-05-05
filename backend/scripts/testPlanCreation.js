const mongoose = require('mongoose');
const Plan = require('../models/Plan');
const RazorpayService = require('../services/razorpayService');
require('dotenv').config();

async function testPlanCreation() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get the Professional Plan
    const plan = await Plan.findOne({ name: 'Professional Plan' });
    if (!plan) {
      console.log('❌ Professional Plan not found');
      return;
    }

    console.log('📋 Found plan:', {
      name: plan.name,
      amount: plan.amount,
      currency: plan.currency,
      frequency: plan.frequency,
      period: plan.period,
      razorpayPlanId: plan.razorpayPlanId || 'NOT_CREATED'
    });

    // Test Razorpay plan creation
    console.log('\n🔧 Testing Razorpay plan creation...');
    try {
      const razorpayPlan = await RazorpayService.createPlan({
        name: plan.name,
        description: plan.description,
        amount: plan.amount,
        currency: plan.currency,
        frequency: plan.frequency,
        period: plan.period,
        notes: {
          planId: plan._id.toString(),
          createdFrom: 'test_script'
        }
      });

      console.log('✅ Razorpay plan created successfully:', razorpayPlan.id);

      // Update plan with Razorpay plan ID
      plan.razorpayPlanId = razorpayPlan.id;
      await plan.save();

      console.log('✅ Plan updated with Razorpay ID');

    } catch (planError) {
      console.error('❌ Failed to create Razorpay plan:', planError.message);
      console.error('Full error:', planError);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the function
testPlanCreation();
