require('dotenv').config();
const RazorpayService = require('../services/razorpayService');

async function testWithoutPeriod() {
  console.log('Testing plan creation without period field...');
  
  try {
    const plan = await instance.plans.create({
      interval: 'monthly',
      item: {
        name: 'Test Monthly Plan',
        description: 'Test monthly plan without period',
        amount: 29900, // 299 * 100
        currency: 'INR',
      },
      notes: { test: 'without_period' }
    });
    console.log('✅ Success:', plan.id);
    console.log('Plan details:', JSON.stringify(plan, null, 2));
  } catch (error) {
    console.log('❌ Failed:', error.error?.description || error.message);
    console.log('Full error:', JSON.stringify(error, null, 2));
  }
}

const razorpay = require('razorpay');
require('dotenv').config();

const instance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

testWithoutPeriod().catch(console.error);
