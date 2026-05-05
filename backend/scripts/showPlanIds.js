const mongoose = require('mongoose');
const Plan = require('../models/Plan');
require('dotenv').config();

async function showPlanIds() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Fetch all plans
    const plans = await Plan.find({}).select('_id name razorpayPlanId amount frequency');

    console.log('\n📋 Plan ID Mapping:');
    console.log('MongoDB ID | Plan Name | Razorpay Plan ID | Amount | Frequency');
    console.log('-----------|------------|------------------|----------');
    
    plans.forEach((plan, index) => {
      console.log(`${plan._id} | ${plan.name} | ${plan.razorpayPlanId || 'NOT_CREATED'} | ₹${plan.amount} | ${plan.frequency}`);
    });

    console.log('\n🎯 Use these Razorpay Plan IDs in your frontend requests:');
    console.log('Example: "plan_PzABC123XYZ" for Professional Plan');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the function
showPlanIds();
