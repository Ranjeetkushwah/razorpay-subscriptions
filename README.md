# Razorpay Subscription Management System

A complete MERN stack application for managing Razorpay subscriptions with user authentication, CRUD operations, and recurring payments.

## 🚀 Features

### User Features
- **Authentication**: Register, login, profile management
- **Subscription Management**: Create, view, pause, resume, cancel subscriptions
- **Dashboard**: Overview of subscription statistics and recent activity
- **Plan Browsing**: Explore available subscription plans with features
- **Payment Integration**: Seamless Razorpay payment processing with multiple payment options
- **Real-time Updates**: Live subscription status updates via webhooks

### Admin Features
- **Plan Management**: Create, update, delete subscription plans
- **User Management**: View all user subscriptions
- **Analytics**: Track subscription metrics and revenue
- **Admin Dashboard**: Comprehensive admin interface

### Technical Features
- **Secure Authentication**: JWT-based authentication with role-based access
- **Webhook Handling**: Process Razorpay webhook events automatically
- **Database Integration**: MongoDB with Mongoose ODM
- **API Security**: Rate limiting, input validation, CORS protection
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Error Handling**: Comprehensive error handling and user feedback

## � Payment Options & Methods

### Supported Payment Methods
The system supports all Razorpay payment methods for subscription plans:

- **Credit/Debit Cards** - Visa, Mastercard, Rupay, Maestro
- **Net Banking** - All major Indian banks supported
- **UPI** - Unified Payments Interface (Google Pay, PhonePe, Paytm, etc.)
- **Wallets** - Paytm Wallet, PhonePe Wallet, Amazon Pay, etc.
- **EMI Options** - No-cost and standard EMI on eligible cards

### Payment Flows for Subscription Plans

#### 1. **Direct Subscription Creation**
```javascript
// Automatic recurring billing setup
const customer = await RazorpayService.createCustomer(email, name, phone);
const subscription = await RazorpayService.createSubscription(
  customer.id, 
  planId, 
  totalCount, 
  startAt
);
```

#### 2. **Payment Links for Flexibility**
```javascript
// One-time payment link for subscription setup
const paymentLink = await RazorpayService.createPaymentLink(
  amount, 
  description, 
  customer
);
```

#### 3. **Order-based Payment Flow**
```javascript
// Create order → Capture payment → Convert to subscription
const order = await RazorpayService.createOrder(orderData);
// User completes payment via Razorpay checkout
// Subscription is activated after successful payment
```

### Payment Features

#### **Subscription Management**
- **Automatic Recurring** - Payments charged automatically on schedule
- **Manual Renewal** - Users can manually renew subscriptions
- **Flexible Billing Cycles** - Daily, weekly, monthly, yearly options
- **Trial Periods** - Support for free or paid trial periods
- **Proration** - Automatic calculation for plan changes

#### **Payment Security**
- **PCI DSS Compliant** - Razorpay handles all payment security
- **3D Secure Authentication** - Additional security for card payments
- **Fraud Detection** - Built-in fraud prevention mechanisms
- **Tokenization** - Secure storage of payment methods

#### **Payment Operations**
- **Refunds** - Full or partial refund processing
- **Failed Payment Handling** - Automatic retry mechanisms
- **Payment History** - Complete transaction records
- **Invoice Generation** - Automatic invoice creation for each payment

### User Payment Experience

#### **Checkout Process**
1. **Plan Selection** - User chooses subscription plan
2. **Payment Method** - Select from available payment options
3. **Razorpay Checkout** - Secure payment interface
4. **Authentication** - Complete payment authentication
5. **Confirmation** - Instant payment confirmation and subscription activation

#### **Subscription Dashboard**
- **Current Status** - Real-time subscription status
- **Next Billing Date** - Upcoming charge information
- **Payment History** - All past transactions
- **Payment Methods** - Manage saved payment options
- **Billing Settings** - Update payment preferences

### Admin Payment Controls

#### **Plan Configuration**
- **Pricing Setup** - Define plan amounts and currencies
- **Billing Cycles** - Configure subscription intervals
- **Trial Settings** - Set up free or paid trials
- **Plan Features** - Define subscription benefits

#### **Revenue Analytics**
- **Payment Metrics** - Track successful vs failed payments
- **Revenue Reports** - Monthly and annual revenue insights
- **Subscription Metrics** - Active, cancelled, and expired subscriptions
- **Payment Method Analysis** - Most popular payment options

## �🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **Razorpay SDK** - Payment processing
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation
- **Helmet** - Security headers
- **Express Rate Limiting** - Rate limiting

### Frontend
- **React 18** - UI framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling framework
- **Lucide React** - Icon library
- **React Toastify** - Notifications

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Razorpay account with API keys
- Git

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd razor-pay-subcription
```

### 2. Backend Setup
```bash
cd backend
npm install
```

#### Configure Environment Variables
Create a `.env` file in the backend directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/razorpay-subscription

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Razorpay Credentials
RAZORPAY_KEY_ID=rzp_test_SatrrxFwKXJX8e
RAZORPAY_KEY_SECRET=2qg7F437K2Oqq7gVRH41NZen

# Webhook Secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret
```

#### Start Backend Server
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

#### Start Frontend Server
```bash
npm start
```

### 4. Access the Application
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:5000](http://localhost:5000)

## 📊 Database Schema

### User Collection
```javascript
{
  name: String,
  email: String,
  password: String, // Hashed
  phone: String,
  role: String, // 'user' or 'admin'
  isActive: Boolean,
  razorpayCustomerId: String
}
```

### Plan Collection
```javascript
{
  name: String,
  description: String,
  amount: Number,
  currency: String,
  frequency: String, // 'daily', 'weekly', 'monthly', 'yearly'
  period: Number,
  totalCount: Number,
  features: [String],
  popular: Boolean,
  isActive: Boolean,
  razorpayPlanId: String
}
```

### Subscription Collection
```javascript
{
  userId: ObjectId,
  razorpaySubscriptionId: String,
  razorpayPlanId: String,
  razorpayCustomerId: String,
  status: String, // 'created', 'authenticated', 'active', 'completed', 'cancelled', 'expired', 'halted'
  planName: String,
  amount: Number,
  currency: String,
  frequency: String,
  totalCount: Number,
  paidCount: Number,
  remainingCount: Number,
  startAt: Date,
  endAt: Date,
  authAt: Date,
  nextChargeAt: Date,
  shortUrl: String,
  notes: Object,
  isActive: Boolean
}
```

### Payment Collection
```javascript
{
  userId: ObjectId,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  amount: Number,
  currency: String,
  status: String, // 'created', 'authorized', 'captured', 'refunded', 'failed'
  method: String, // 'card', 'netbanking', 'upi', 'wallet', 'emi'
  description: String,
  captured: Boolean,
  capturedAt: Date,
  refunded: Boolean,
  refundAmount: Number,
  refundedAt: Date,
  refundId: String,
  refundReason: String,
  errorCode: String,
  errorDescription: String,
  subscriptionId: ObjectId,
  metadata: Object
}
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Plans
- `GET /api/subscriptions/plans` - Get all plans
- `POST /api/subscriptions/plans` - Create plan (Admin)
- `PUT /api/subscriptions/plans/:id` - Update plan (Admin)
- `DELETE /api/subscriptions/plans/:id` - Delete plan (Admin)

### Subscriptions
- `GET /api/subscriptions/my-subscriptions` - Get user subscriptions
- `POST /api/subscriptions/create` - Create subscription
- `GET /api/subscriptions/:id` - Get subscription details
- `POST /api/subscriptions/:id/cancel` - Cancel subscription
- `POST /api/subscriptions/:id/pause` - Pause subscription
- `POST /api/subscriptions/:id/resume` - Resume subscription
- `GET /api/subscriptions/admin/all` - Get all subscriptions (Admin)

### Payments
- `POST /api/payments/create-order` - Create payment order
- `POST /api/payments/verify` - Verify payment signature
- `GET /api/payments/history` - Get user payment history
- `GET /api/payments/:id` - Get payment details
- `POST /api/payments/:id/refund` - Refund payment

### Webhooks
- `POST /api/webhooks/razorpay` - Handle Razorpay webhooks

## 🔄 Webhook Events

The system handles the following Razorpay webhook events:
- `subscription.authenticated` - Subscription authenticated
- `subscription.charged` - Payment charged
- `subscription.completed` - Subscription completed
- `subscription.cancelled` - Subscription cancelled
- `subscription.halted` - Subscription halted
- `subscription.paused` - Subscription paused
- `subscription.resumed` - Subscription resumed
- `payment.captured` - Payment captured
- `payment.failed` - Payment failed

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Comprehensive input validation
- **CORS Protection**: Cross-origin resource sharing configuration
- **Helmet.js**: Security headers
- **Webhook Verification**: Razorpay webhook signature verification

## 🎨 UI Features

- **Responsive Design**: Mobile-first approach
- **Modern UI**: Clean and intuitive interface
- **Toast Notifications**: User-friendly feedback
- **Loading States**: Smooth loading indicators
- **Error Handling**: Graceful error handling
- **Accessibility**: WCAG compliant components

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Install production dependencies
3. Start server with `npm start`
4. Configure webhook URL in Razorpay dashboard

### Frontend Deployment
1. Build with `npm run build`
2. Deploy build folder to hosting service
3. Update API base URL for production

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=mongodb://your-production-db
JWT_SECRET=your-production-secret
RAZORPAY_KEY_ID=your-production-key-id
RAZORPAY_KEY_SECRET=your-production-key-secret
```

## 📝 Usage Guide

### For Users
1. **Register**: Create an account with email, phone, and password
2. **Browse Plans**: View available subscription plans with features and pricing
3. **Choose Payment Method**: Select from Credit/Debit Cards, UPI, Net Banking, Wallets, or EMI
4. **Complete Payment**: Process payment through secure Razorpay checkout
5. **Subscribe**: Activate subscription after successful payment
6. **Manage**: View, pause, resume, or cancel subscriptions
7. **Track**: Monitor subscription status, payment history, and upcoming charges
8. **Payment Management**: Update payment methods, view invoices, request refunds

### For Admins
1. **Create Plans**: Design subscription plans with features
2. **Manage Users**: View all user subscriptions
3. **Monitor Analytics**: Track subscription metrics
4. **Handle Issues**: Manage subscription problems

## 🧪 Testing

### Manual Testing Steps
1. Register a new user account
2. Login with the new account
3. Browse available plans
4. Test different payment methods (Card, UPI, Net Banking, Wallets)
5. Create a subscription and complete payment through Razorpay
6. Verify subscription status updates after payment
7. Test payment verification and webhook processing
8. Test pause/resume/cancel functionality
9. Check payment history and invoice generation
10. Test refund processing
11. Verify failed payment handling
12. Test subscription renewal and billing cycles

### Test Cases
- User registration and login
- Plan creation and management
- Subscription lifecycle management
- **Payment Processing**:
  - Multiple payment method testing (Cards, UPI, Net Banking, Wallets)
  - Payment order creation and verification
  - Payment failure and retry scenarios
  - Refund processing and validation
  - Payment history tracking
- **Webhook Event Handling**:
  - Subscription authentication events
  - Payment charged and completed events
  - Subscription cancellation and pause events
  - Payment failure webhook processing
- **Security Testing**:
  - Payment signature verification
  - Webhook signature validation
  - Unauthorized access prevention
- Error scenarios and edge cases

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
1. Check the README files in backend and frontend directories
2. Review the API documentation
3. Check the Razorpay documentation for payment-related issues
4. Create an issue in the repository

## 🔄 Version History

- **v1.0.0** - Initial release with complete subscription management system
  - User authentication
  - Subscription CRUD operations
  - Razorpay integration
  - Webhook handling
  - Admin panel
  - Responsive frontend

## 🌟 Acknowledgments

- Razorpay for the payment gateway API
- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- MongoDB for the flexible database solution
