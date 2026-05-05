require('dotenv').config();
const razorpay = require('razorpay');

const instance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function testCorrectFormat() {
  console.log('Testing correct Razorpay plan format...');
  
  const testPlans = [
    {
      name: 'Monthly Plan Test',
      description: 'Monthly subscription plan',
      interval: 1, // Monthly
      item: {
        name: 'Monthly Plan Test',
        description: 'Monthly subscription plan',
        amount: 29900,
        currency: 'INR',
      }
    },
    {
      name: 'Weekly Plan Test', 
      description: 'Weekly subscription plan',
      interval: 7, // Every 7 days
      item: {
        name: 'Weekly Plan Test',
        description: 'Weekly subscription plan',
        amount: 2500,
        currency: 'INR',
      }
    },
    {
      name: 'Daily Plan Test',
      description: 'Daily subscription plan',
      interval: 1, // Daily
      item: {
        name: 'Daily Plan Test',
        description: 'Daily subscription plan',
        amount: 100,
        currency: 'INR',
      }
    }
  ];

  for (const [index, planData] of testPlans.entries()) {
    console.log(`\n🧪 Testing plan ${index + 1}:`, planData);
    
    try {
      const plan = await instance.plans.create(planData);
      console.log('✅ Success:', plan.id);
      console.log('Plan details:', JSON.stringify(plan, null, 2));
      break; // Stop on first success
    } catch (error) {
      console.log('❌ Failed:', error.error?.description || error.message);
    }
  }
}

testCorrectFormat().catch(console.error);
