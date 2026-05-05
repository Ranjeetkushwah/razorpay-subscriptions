# Razorpay Subscription Frontend

A modern React frontend for managing Razorpay subscriptions with user authentication and comprehensive subscription management features.

## Features

- **User Authentication**: Register, login, profile management
- **Subscription Management**: View, create, pause, resume, cancel subscriptions
- **Plan Browsing**: Explore available subscription plans
- **Dashboard**: Overview of subscription statistics and recent activity
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Updates**: Live subscription status updates
- **Admin Panel**: Manage plans and view all subscriptions (Admin users)

## Tech Stack

- React 18
- React Router DOM
- Axios for API calls
- Tailwind CSS
- Lucide React (Icons)
- React Toastify (Notifications)
- Local Storage for authentication

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Navbar.js       # Navigation bar
│   ├── PrivateRoute.js # Authentication wrapper
│   └── AdminRoute.js   # Admin route protection
├── pages/              # Page components
│   ├── Login.js        # Login page
│   ├── Register.js     # Registration page
│   ├── Dashboard.js    # User dashboard
│   ├── Plans.js        # Plans listing
│   ├── Subscriptions.js # Subscription management
│   └── Profile.js      # User profile
├── services/           # API and utility services
│   ├── api.js          # Axios configuration and API endpoints
│   └── authService.js  # Authentication utilities
├── App.js              # Main app component with routing
├── index.js            # App entry point
└── index.css           # Global styles and Tailwind CSS
```

## Pages Overview

### Dashboard
- Welcome message with user stats
- Subscription overview cards
- Recent subscriptions list
- Quick action buttons
- Next payment information

### Plans
- Grid layout of available subscription plans
- Popular plan highlighting
- Feature lists for each plan
- One-click subscription creation
- Redirects to Razorpay for payment

### Subscriptions
- List of user's subscriptions
- Subscription status indicators
- Action buttons (pause, resume, cancel)
- Progress bars for subscription completion
- Links to Razorpay dashboard
- Detailed subscription information

### Authentication
- Modern login/register forms
- Form validation
- Password visibility toggle
- Error handling and user feedback
- Automatic redirect after login

### Profile
- User information display
- Profile editing capabilities
- Password change functionality
- Account management options

## Key Features

### Authentication
- JWT token-based authentication
- Protected routes
- Automatic token refresh
- User role management (user/admin)
- Persistent login state

### Subscription Management
- Real-time subscription status
- Pause/resume functionality
- Cancellation with confirmation
- Progress tracking
- Payment history

### User Experience
- Toast notifications for all actions
- Loading states and spinners
- Responsive design for all devices
- Smooth transitions and animations
- Intuitive navigation

### Security
- Secure token storage
- Route protection
- Input validation
- XSS prevention
- CSRF protection

## Environment Setup

The frontend expects the backend to be running on `http://localhost:5000`. Make sure:

1. Backend server is running
2. CORS is properly configured
3. API endpoints are accessible

## API Integration

The frontend communicates with the backend through a centralized API service (`src/services/api.js`):

```javascript
// Authentication APIs
authAPI.register(userData)
authAPI.login(credentials)
authAPI.getMe()
authAPI.updateProfile(userData)
authAPI.changePassword(passwordData)

// Subscription APIs
subscriptionAPI.getPlans()
subscriptionAPI.createSubscription(subscriptionData)
subscriptionAPI.getUserSubscriptions()
subscriptionAPI.cancelSubscription(id)
subscriptionAPI.pauseSubscription(id)
subscriptionAPI.resumeSubscription(id)
```

## Styling

The project uses Tailwind CSS for styling with a custom color scheme:

- Primary colors: Blue shades
- Success colors: Green shades
- Warning colors: Yellow shades
- Error colors: Red shades
- Custom components with hover effects and transitions

## Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy the `build` folder to your hosting service

3. Update the API base URL in production

4. Configure environment variables for production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is licensed under the ISC License.
