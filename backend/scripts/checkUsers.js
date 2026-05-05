const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function checkUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Fetch all users
    const users = await User.find({}).select('_id name email razorpayCustomerId');
    
    console.log(`\n📋 Found ${users.length} users:`);
    console.log('MongoDB ID | Name | Email | Razorpay Customer ID');
    console.log('-----------|------|-------|---------------------');
    
    users.forEach(user => {
      const customerId = user.razorpayCustomerId || 'NOT_CREATED';
      console.log(`${user._id} | ${user.name} | ${user.email} | ${customerId}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the function
checkUsers();
