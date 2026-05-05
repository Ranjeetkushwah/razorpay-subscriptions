require('dotenv').config();
const razorpay = require('razorpay');

const instance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function testFinalFormat() {
  console.log('Testing final correct Razorpay plan format...');
  
  const planData = {
    period: 1,
    interval: 1, // Monthly
    item: {
      name: 'Monthly Plan Test',
      description: 'Monthly subscription plan',
      amount: 29900,
      currency: 'INR',
    },
    notes: { test: 'final_format' }
  };

  console.log('Plan data:', JSON.stringify(planData, null, 2));
  
  try {
    const plan = await instance.plans.create(planData);
    console.log('✅ Success:', plan.id);
    console.log('Plan details:', JSON.stringify(plan, null, 2));
  } catch (error) {
    console.log('❌ Failed:', error.error?.description || error.message);
    console.log('Full error:', JSON.stringify(error, null, 2));
  }
}

testFinalFormat().catch(console.error);
