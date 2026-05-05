const RazorpayService = require('./services/razorpayService');

async function testRazorpayPlan() {
  try {
    console.log('🚀 Testing Razorpay plan creation...');
    
    const planData = {
      name: 'Basic Plan Test',
      description: 'A basic subscription plan for testing',
      amount: 99,
      currency: 'INR',
      frequency: 'monthly',
      period: 1,
      notes: {
        features: 'Feature 1, Feature 2, Feature 3',
        popular: false
      }
    };

    const razorpayPlan = await RazorpayService.createPlan(planData);
    console.log('✅ Razorpay plan created successfully:', razorpayPlan.id);
    console.log('Plan details:', {
      id: razorpayPlan.id,
      name: razorpayPlan.item.name,
      amount: razorpayPlan.item.amount / 100, // Convert from paise to rupees
      currency: razorpayPlan.item.currency,
      frequency: razorpayPlan.interval,
      period: razorpayPlan.period
    });

    return razorpayPlan;
  } catch (error) {
    console.error('❌ Error creating Razorpay plan:', error.message);
    throw error;
  }
}

// Run the test
testRazorpayPlan()
  .then(() => {
    console.log('🎉 Test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });
