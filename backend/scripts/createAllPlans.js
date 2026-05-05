const mongoose = require('mongoose');
const Plan = require('../models/Plan');
const RazorpayService = require('../services/razorpayService');
require('dotenv').config();

async function createAllPlans() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Fetch all plans that don't have razorpayPlanId
    const plans = await Plan.find({ razorpayPlanId: { $exists: false } });
    
    if (plans.length === 0) {
      console.log('📋 All plans already have Razorpay IDs');
      return;
    }

    console.log(`📋 Found ${plans.length} plans without Razorpay IDs`);

    for (const plan of plans) {
      console.log(`\n🔧 Creating Razorpay plan for: ${plan.name}`);
      
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
            createdFrom: 'bulk_creation'
          }
        });

        // Update plan with Razorpay plan ID
        plan.razorpayPlanId = razorpayPlan.id;
        await plan.save();

        console.log(`✅ Success: ${razorpayPlan.id}`);

      } catch (planError) {
        console.error(`❌ Failed for ${plan.name}:`, planError.error?.description || planError.message);
      }
    }

    console.log('\n🎯 Plan creation completed!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the function
createAllPlans();
