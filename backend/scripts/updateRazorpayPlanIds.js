const mongoose = require('mongoose');
const Plan = require('../models/Plan');
const RazorpayService = require('../utils/razorpay');
require('dotenv').config();

// Mapping of plan names to Razorpay plan IDs
const planNameToRazorpayId = {
  'Starter Plan': 'plan_PzSTARTER123',
  'Professional Plan': 'plan_PzPROFESSIONAL123',
  'Business Plan': 'plan_PzBUSINESS123',
  'Weekly Trial': 'plan_PzWEEKLY123',
  'Annual Premium': 'plan_PzANNUAL123'
};

async function updateRazorpayPlanIds() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all plans
    const plans = await Plan.find({});

    // Update each plan
    for (const plan of plans) {
      const razorpayPlanId = planNameToRazorpayId[plan.name];
      
      if (razorpayPlanId && !plan.razorpayPlanId) {
        console.log(`🔄 Updating plan: ${plan.name} with Razorpay ID: ${razorpayPlanId}`);
        
        // Update plan with Razorpay plan ID
        await Plan.findByIdAndUpdate(plan._id, {
          razorpayPlanId: razorpayPlanId
        });
        
        console.log(`✅ Updated plan: ${plan.name}`);
      } else {
        console.log(`⚠️ No Razorpay ID mapping for plan: ${plan.name}`);
      }
    }

    console.log('\n🎉 Razorpay Plan ID update completed!');
    console.log('\n📋 Updated Plan Summary:');
    
    // Display updated plans
    const updatedPlans = await Plan.find({}).select('_id name razorpayPlanId amount frequency');
    console.log('MongoDB ID | Plan Name | Razorpay Plan ID | Amount | Frequency');
    console.log('-----------|------------|------------------|----------');
    
    updatedPlans.forEach((plan, index) => {
      console.log(`${plan._id} | ${plan.name} | ${plan.razorpayPlanId || 'NOT_SET'} | ₹${plan.amount} | ${plan.frequency}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the function
updateRazorpayPlanIds();
