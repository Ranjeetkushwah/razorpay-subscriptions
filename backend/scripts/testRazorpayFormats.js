require('dotenv').config();
const RazorpayService = require('../services/razorpayService');

async function testFormats() {
  console.log('Testing different plan formats...');
  
  const testPlans = [
    {
      name: 'Test Monthly Plan',
      description: 'Test monthly plan',
      amount: 299,
      currency: 'INR',
      frequency: 'monthly',
      period: 1
    },
    {
      name: 'Test Weekly Plan', 
      description: 'Test weekly plan',
      amount: 25,
      currency: 'INR',
      frequency: 'weekly',
      period: 1
    },
    {
      name: 'Test Yearly Plan',
      description: 'Test yearly plan', 
      amount: 2999,
      currency: 'INR',
      frequency: 'yearly',
      period: 1
    }
  ];

  for (const [index, planData] of testPlans.entries()) {
    console.log(`\n🧪 Testing plan ${index + 1}:`, planData);
    
    try {
      const plan = await RazorpayService.createPlan({
        ...planData,
        notes: { test: `format_test_${index + 1}` }
      });
      console.log('✅ Success:', plan.id);
    } catch (error) {
      console.log('❌ Failed:', error.error?.description || error.message);
    }
  }
}

testFormats().catch(console.error);
