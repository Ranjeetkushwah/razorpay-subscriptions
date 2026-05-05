# Razorpay Subscription Backend

A complete backend implementation for Razorpay subscription management with user authentication and CRUD operations.

## Features

- **User Authentication**: Register, login, profile management
- **Subscription Management**: Create, view, pause, resume, cancel subscriptions
- **Plan Management**: Create and manage subscription plans (Admin only)
- **Webhook Handling**: Process Razorpay webhook events
- **Security**: JWT authentication, rate limiting, input validation
- **Database Integration**: MongoDB with Mongoose ODM

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Razorpay SDK
- bcryptjs
- Express Validator
- Helmet (Security)
- Express Rate Limiting

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Update the following variables in `.env`:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your secret key for JWT
   - `RAZORPAY_KEY_ID`: Your Razorpay key ID
   - `RAZORPAY_KEY_SECRET`: Your Razorpay key secret
   - `RAZORPAY_WEBHOOK_SECRET`: Your webhook secret

4. Start the server:
   ```bash
   npm run dev
   ```
   or
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Plans
- `GET /api/subscriptions/plans` - Get all available plans
- `POST /api/subscriptions/plans` - Create a new plan (Admin only)
- `PUT /api/subscriptions/plans/:id` - Update a plan (Admin only)
- `DELETE /api/subscriptions/plans/:id` - Delete a plan (Admin only)

### Subscriptions
- `GET /api/subscriptions/my-subscriptions` - Get user subscriptions
- `POST /api/subscriptions/create` - Create a new subscription
- `GET /api/subscriptions/:id` - Get subscription details
- `POST /api/subscriptions/:id/cancel` - Cancel subscription
- `POST /api/subscriptions/:id/pause` - Pause subscription
- `POST /api/subscriptions/:id/resume` - Resume subscription
- `GET /api/subscriptions/admin/all` - Get all subscriptions (Admin only)

### Webhooks
- `POST /api/webhooks/razorpay` - Handle Razorpay webhook events

## Database Schema

### User
```javascript
{
  name: String,
  email: String,
  password: String,
  phone: String,
  role: String, // 'user' or 'admin'
  isActive: Boolean,
  razorpayCustomerId: String
}
```

### Plan
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

### Subscription
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

## Webhook Events

The webhook endpoint handles the following Razorpay events:
- `subscription.authenticated`
- `subscription.charged`
- `subscription.completed`
- `subscription.cancelled`
- `subscription.halted`
- `subscription.paused`
- `subscription.resumed`
- `payment.captured`
- `payment.failed`

## Security Features

- JWT Authentication
- Password Hashing with bcrypt
- Rate Limiting
- Input Validation
- CORS Configuration
- Helmet.js for security headers
- Webhook signature verification

## Environment Variables

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

## Deployment

1. Set production environment variables
2. Install production dependencies
3. Start the server with `npm start`
4. Configure your domain's webhook URL in Razorpay dashboard

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.
