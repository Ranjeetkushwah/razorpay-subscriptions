const mongoose = require('mongoose');
const Subscription = require('../models/Subscription');
require('dotenv').config();

async function cleanupTestSubscription() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete test subscriptions
    const result = await Subscription.deleteMany({ 
      'notes.test': { $exists: true }
    });

    console.log(`🧹 Cleaned up ${result.deletedCount} test subscriptions`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the function
cleanupTestSubscription();
