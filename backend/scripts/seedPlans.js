const mongoose = require('mongoose');
const Plan = require('../models/Plan');
const RazorpayService = require('../utils/razorpay');
require('dotenv').config();

// Sample plans data
const samplePlans = [
  {
    name: 'Starter Plan',
    description: 'Perfect for individuals and small projects',
    amount: 99,
    currency: 'INR',
    frequency: 'monthly',
    period: 1,
    totalCount: 12,
    features: [
      'Access to basic features',
      'Email support',
      '5GB storage',
      'Basic analytics dashboard'
    ],
    popular: false,
    isActive: true
  },
  {
    name: 'Professional Plan',
    description: 'Ideal for growing businesses and teams',
    amount: 299,
    currency: 'INR',
    frequency: 'monthly',
    period: 1,
    totalCount: 12,
    features: [
      'All Starter features',
      'Priority email support',
      '50GB storage',
      'Advanced analytics',
      'Team collaboration tools',
      'API access',
      'Monthly reports'
    ],
    popular: true,
    isActive: true
  },
  {
    name: 'Business Plan',
    description: 'Complete solution for large organizations',
    amount: 599,
    currency: 'INR',
    frequency: 'monthly',
    period: 1,
    totalCount: 12,
    features: [
      'All Professional features',
      '24/7 phone support',
      'Unlimited storage',
      'Custom analytics dashboard',
      'Advanced team management',
      'Priority API access',
      'Custom integrations',
      'Dedicated account manager'
    ],
    popular: false,
    isActive: true
  },
  {
    name: 'Weekly Trial',
    description: 'Try our service with weekly billing',
    amount: 25,
    currency: 'INR',
    frequency: 'weekly',
    period: 1,
    totalCount: 4,
    features: [
      'Basic feature access',
      'Email support',
      '1GB storage',
      'Weekly usage reports'
    ],
    popular: false,
    isActive: true
  },
  {
    name: 'Annual Premium',
    description: 'Best value with annual billing - Save 20%',
    amount: 2999,
    currency: 'INR',
    frequency: 'yearly',
    period: 1,
    totalCount: 1,
    features: [
      'All Business features',
      'White-label options',
      'Custom integrations',
      'Dedicated support team',
      'Advanced security features',
      'Custom training sessions',
      'Annual compliance reports'
    ],
    popular: true,
    isActive: true
  }
];

async function seedPlans() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing plans (optional - comment out if you want to keep existing plans)
    console.log('🗑️ Clearing existing plans...');
    await Plan.deleteMany({});
    console.log('✅ Existing plans cleared');

    // Create plans one by one
    for (const planData of samplePlans) {
      try {
        console.log(`📦 Creating plan: ${planData.name}`);
        
        // Create Razorpay plan first
        const razorpayPlan = await RazorpayService.createPlan({
          name: planData.name,
          description: planData.description,
          amount: planData.amount,
          currency: planData.currency,
          frequency: planData.frequency,
          period: planData.period,
          notes: {
            features: planData.features.join(', '),
            popular: planData.popular,
            created_at: new Date().toISOString()
          }
        });

        // Create plan in database
        const plan = new Plan({
          ...planData,
          razorpayPlanId: razorpayPlan.id
        });

        await plan.save();
        console.log(`✅ Created plan: ${planData.name} (Razorpay ID: ${razorpayPlan.id})`);
        
      } catch (error) {
        console.error(`❌ Error creating plan ${planData.name}:`, error.message);
      }
    }

    console.log('\n🎉 Sample plans seeding completed!');
    console.log(`📊 Total plans created: ${samplePlans.length}`);
    
    // Display created plans
    const createdPlans = await Plan.find({});
    console.log('\n📋 Created Plans:');
    createdPlans.forEach((plan, index) => {
      console.log(`${index + 1}. ${plan.name} - ₹${plan.amount}/${plan.frequency} (Popular: ${plan.popular})`);
    });

  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the seeding function
seedPlans();
