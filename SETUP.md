# 🚀 Razorpay Subscription System - Complete MERN Setup

## 📋 Project Overview

A production-ready MERN stack application for Razorpay payment gateway integration with full subscription management, authentication, and CRUD operations.

## 🏗️ Architecture

### Backend (Node.js + Express + MongoDB)
- **Authentication**: JWT-based with bcrypt password hashing
- **Payment Integration**: Complete Razorpay SDK integration
- **Subscription Management**: Full lifecycle (create, pause, resume, cancel, upgrade)
- **Plan Management**: Admin CRUD for subscription plans
- **Webhook Handling**: Real-time payment event processing
- **Security**: Rate limiting, CORS, helmet, input validation

### Frontend (React + Vite + Tailwind CSS)
- **Modern React 18**: With hooks and context API
- **Vite Build Tool**: Fast development and optimized builds
- **Authentication**: Context-based state management
- **Responsive Design**: Mobile-first with Tailwind CSS
- **Protected Routes**: Role-based access control
- **Real-time Updates**: Toast notifications and loading states

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Razorpay SDK** - Payment processing
- **Helmet** - Security headers
- **Express Rate Limit** - DDoS protection

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling framework
- **Lucide React** - Icon library
- **React Toastify** - Notifications

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MongoDB 4.4+
- Git

### 1. Clone Repository
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
Create `.env` file in backend directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/razorpay-subscription

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d

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
npm run dev
```

### 4. Access Applications
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api

## 🔧 Development Workflow

### 1. User Registration & Login
- Automatic Razorpay customer creation
- JWT token generation
- Protected dashboard access

### 2. Plan Management (Admin)
- Create subscription plans with Razorpay integration
- Set pricing, features, and billing cycles
- Popular plan highlighting

### 3. Subscription Creation
- Browse available plans
- One-click subscription creation
- Redirect to Razorpay checkout
- Automatic webhook processing

### 4. Subscription Management
- View active subscriptions
- Pause/resume functionality
- Cancel with end-of-cycle option
- Upgrade/downgrade between plans

### 5. Payment Processing
- Real-time payment verification
- Failed payment handling
- Refund processing
- Payment history tracking

## 📊 Database Schema

### User Collection
```javascript
{
  name: String,
  email: String,
  password: String, // Hashed
  phone: String,
  role: String, // 'user' | 'admin'
  isActive: Boolean,
  razorpayCustomerId: String,
  createdAt: Date,
  lastLogin: Date
}
```

### Plan Collection
```javascript
{
  name: String,
  description: String,
  amount: Number,
  currency: String,
  frequency: String, // 'daily' | 'weekly' | 'monthly' | 'yearly'
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
  status: String, // 'created' | 'authenticated' | 'active' | 'completed' | 'cancelled' | 'halted'
  planName: String,
  amount: Number,
  frequency: String,
  totalCount: Number,
  paidCount: Number,
  remainingCount: Number,
  startAt: Date,
  endAt: Date,
  nextChargeAt: Date,
  isActive: Boolean
}
```

### Payment Collection
```javascript
{
  userId: ObjectId,
  subscriptionId: ObjectId,
  razorpayPaymentId: String,
  razorpayOrderId: String,
  amount: Number,
  status: String, // 'created' | 'captured' | 'refunded' | 'failed'
  method: String, // 'card' | 'netbanking' | 'wallet' | 'upi'
  description: String,
  captured: Boolean,
  refunded: Boolean,
  createdAt: Date
}
```

## 🔐 Security Features

### Authentication
- JWT tokens with configurable expiration
- Password strength validation
- Rate limiting on auth endpoints
- Session management with localStorage

### API Security
- Helmet.js security headers
- CORS configuration
- Input validation and sanitization
- SQL injection prevention
- XSS protection

### Payment Security
- Webhook signature verification
- Payment signature validation
- Razorpay SDK security
- HTTPS enforcement in production

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password
- `DELETE /api/auth/delete-account` - Delete account

### Plans
- `GET /api/plans` - Get all plans
- `GET /api/plans/:id` - Get plan by ID
- `POST /api/plans` - Create plan (Admin)
- `PUT /api/plans/:id` - Update plan (Admin)
- `DELETE /api/plans/:id` - Delete plan (Admin)
- `GET /api/plans/stats` - Plan statistics (Admin)

### Subscriptions
- `POST /api/subscriptions/create` - Create subscription
- `GET /api/subscriptions/my-subscriptions` - Get user subscriptions
- `GET /api/subscriptions/:id` - Get subscription details
- `POST /api/subscriptions/:id/cancel` - Cancel subscription
- `POST /api/subscriptions/:id/pause` - Pause subscription
- `POST /api/subscriptions/:id/resume` - Resume subscription
- `PUT /api/subscriptions/:id/upgrade` - Upgrade subscription

### Payments
- `POST /api/payments/create-order` - Create payment order
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/history` - Payment history
- `GET /api/payments/:id` - Payment details
- `POST /api/payments/:id/refund` - Refund payment

### Webhooks
- `POST /api/webhooks/razorpay` - Handle Razorpay events

## 🔄 Webhook Events

### Subscription Events
- `subscription.authenticated` - Subscription activated
- `subscription.charged` - Payment successful
- `subscription.completed` - Subscription ended
- `subscription.cancelled` - Subscription cancelled
- `subscription.paused` - Subscription paused
- `subscription.resumed` - Subscription resumed

### Payment Events
- `payment.captured` - Payment successful
- `payment.failed` - Payment failed
- `payment.refunded` - Payment refunded

## 🚀 Deployment

### Backend Deployment
1. **Environment Setup**:
   ```bash
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
   JWT_SECRET=your-production-secret
   RAZORPAY_KEY_ID=rzp_live_your_live_key
   RAZORPAY_KEY_SECRET=your_live_secret
   ```

2. **Build and Deploy**:
   ```bash
   npm install --production
   npm start
   ```

### Frontend Deployment
1. **Build**:
   ```bash
   npm run build
   ```

2. **Deploy to Vercel/Netlify**:
   - Upload `dist` folder
   - Set environment variables
   - Configure domain and SSL

### Webhook Configuration
1. **Set Webhook URL** in Razorpay Dashboard:
   ```
   https://yourdomain.com/api/webhooks/razorpay
   ```

2. **Configure Events**:
   - All subscription events
   - Payment events
   - Enable signature verification

## 🧪 Testing

### Manual Testing Flow
1. **Register User** → Creates Razorpay customer
2. **Login** → Gets JWT token
3. **Browse Plans** → View available subscriptions
4. **Create Subscription** → Redirects to Razorpay
5. **Complete Payment** → Triggers webhook
6. **Manage Subscription** → Pause/resume/cancel

### Automated Testing
```bash
# Backend Tests
cd backend
npm test

# Frontend Tests
cd frontend
npm test
```

## 📈 Production Best Practices

### Performance
- Database indexing for queries
- API response caching
- Image optimization
- Code splitting in frontend
- CDN for static assets

### Monitoring
- Application logging
- Error tracking
- Performance monitoring
- Uptime monitoring

### Scaling
- Load balancing
- Database replication
- Caching layer (Redis)
- Microservices architecture

## 🔧 Troubleshooting

### Common Issues
1. **MongoDB Connection**:
   - Check MongoDB service
   - Verify connection string
   - Check network connectivity

2. **Razorpay Integration**:
   - Verify API keys
   - Check webhook configuration
   - Review error logs

3. **CORS Issues**:
   - Check frontend URL in CORS config
   - Verify preflight requests
   - Check API headers

4. **JWT Token Issues**:
   - Clear browser localStorage
   - Check token expiration
   - Verify secret key

## 📞 Support

### Debug Mode
```bash
# Backend
DEBUG=* npm run dev

# Frontend
VITE_DEBUG=true npm run dev
```

### Log Files
- Backend: Console logs and error files
- Frontend: Browser console and network tab
- Database: MongoDB logs and query performance

## 🎯 Next Steps

1. **Setup Development Environment**
2. **Create Sample Plans**
3. **Test Complete Flow**
4. **Configure Webhooks**
5. **Deploy to Production**
6. **Monitor and Scale**

---

## 📞 Need Help?

- Check the `/api` endpoint for API documentation
- Review error logs for debugging
- Test with Razorpay test keys first
- Enable debug mode for detailed logging

**🎉 Your Razorpay Subscription System is ready for development and deployment!**
