require('dotenv').config();
const razorpay = require('razorpay');

const instance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function testPeriodFormats() {
  console.log('Testing different period formats...');
  
  const periodFormats = [
    { format: 'YYYY-MM-DD', value: '2024-12-31' },
    { format: 'timestamp', value: Math.floor(Date.now() / 1000) + 86400 * 30 }, // 30 days from now
    { format: 'days', value: 30 },
    { format: 'months', value: 1 },
    { format: 'years', value: 1 }
  ];

  for (const { format, value } of periodFormats) {
    console.log(`\n🧪 Testing period format: ${format} (${value})`);
    
    const planData = {
      period: value,
      interval: 1,
      item: {
        name: `Test Plan ${format}`,
        description: `Test plan with period ${format}`,
        amount: 29900,
        currency: 'INR',
      },
      notes: { test: `period_${format}` }
    };
    
    try {
      const plan = await instance.plans.create(planData);
      console.log('✅ Success:', plan.id);
      console.log('Plan details:', JSON.stringify(plan, null, 2));
      return plan; // Return the first successful plan
    } catch (error) {
      console.log('❌ Failed:', error.error?.description || error.message);
    }
  }
}

testPeriodFormats().catch(console.error);
