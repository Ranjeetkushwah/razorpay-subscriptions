import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { CreditCard, Check, Star, Loader } from 'lucide-react';
import { planAPI, subscriptionAPI } from '../services/api';

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingSubscription, setCreatingSubscription] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await planAPI.getPlans();
      if (response.success) {
        setPlans(response.data.plans);
      }
    } catch (error) {
      toast.error('Failed to fetch plans');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubscription = async (planId) => {
    setCreatingSubscription(planId);
    
    try {
      const subscriptionData = {
        planId,
        totalCount: 12, // Default to 12 months
      };

      const response = await subscriptionAPI.createSubscription(subscriptionData);
      
      if (response.success) {
        toast.success('Subscription created successfully!');
        
        // Redirect to Razorpay payment page
        if (response.data.razorpaySubscription.short_url) {
          window.open(response.data.razorpaySubscription.short_url, '_blank');
        }
        
        // Refresh plans to update UI
        setTimeout(() => {
          window.location.href = '/subscriptions';
        }, 2000);
      } else {
        toast.error(response.message || 'Failed to create subscription');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to create subscription');
    } finally {
      setCreatingSubscription(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Plan</h1>
        <p className="text-lg text-gray-600">
          Select the perfect subscription plan for your needs
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan._id}
            className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl ${
              plan.popular ? 'ring-2 ring-primary-500' : ''
            }`}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-primary-500 text-white px-3 py-1 rounded-bl-lg text-sm font-medium">
                <Star className="inline-block w-4 h-4 mr-1" />
                Popular
              </div>
            )}

            <div className="p-8">
              {/* Plan Name */}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              
              {/* Plan Description */}
              <p className="text-gray-600 mb-4">{plan.description}</p>
              
              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">₹{plan.amount}</span>
                <span className="text-gray-600">/{plan.frequency}</span>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Subscribe Button */}
              <button
                onClick={() => handleCreateSubscription(plan._id)}
                disabled={creatingSubscription === plan._id}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-300 ${
                  plan.popular
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {creatingSubscription === plan._id ? (
                  <div className="flex items-center justify-center">
                    <Loader className="animate-spin h-5 w-5 mr-2" />
                    Creating...
                  </div>
                ) : (
                  'Subscribe Now'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {plans.length === 0 && (
        <div className="text-center py-12">
          <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No plans available</h3>
          <p className="mt-1 text-sm text-gray-500">
            Please check back later for available subscription plans.
          </p>
        </div>
      )}

      {/* Additional Information */}
      <div className="bg-gray-50 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Payment Methods</h4>
            <ul className="space-y-1">
              <li>• Credit/Debit Cards</li>
              <li>• Net Banking</li>
              <li>• UPI</li>
              <li>• Wallets</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Subscription Benefits</h4>
            <ul className="space-y-1">
              <li>• Easy monthly payments</li>
              <li>• Cancel anytime</li>
              <li>• Automatic renewals</li>
              <li>• Secure payments</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plans;
