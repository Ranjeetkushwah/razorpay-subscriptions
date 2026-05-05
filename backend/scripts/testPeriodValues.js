require('dotenv').config();
const RazorpayService = require('../services/razorpayService');

async function testPeriodValues() {
  console.log('Testing different period values...');
  
  const periodValues = [1, 30, 7, 365, '1', '30', '7', '365'];
  
  for (const period of periodValues) {
    console.log(`\n🧪 Testing period: ${period} (${typeof period})`);
    
    try {
      const plan = await RazorpayService.createPlan({
        name: `Test Plan Period ${period}`,
        description: `Test plan with period ${period}`,
        amount: 299,
        currency: 'INR',
        frequency: 'monthly',
        period: period
      });
      console.log('✅ Success:', plan.id);
      break; // Stop on first success
    } catch (error) {
      console.log('❌ Failed:', error.error?.description || error.message);
    }
  }
}

testPeriodValues().catch(console.error);
