import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Plus, Save, X, Loader, DollarSign, Calendar, Check, AlertCircle, CheckCircle } from 'lucide-react';
import { planAPI } from '../services/api';

const CreatePlan = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    currency: 'INR',
    frequency: 'monthly',
    period: 1,
    totalCount: 12,
    features: [''],
    popular: false,
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [razorpayStatus, setRazorpayStatus] = useState('checking'); // checking, connected, error

  useEffect(() => {
    fetchPlans();
    checkRazorpayConnection();
  }, []);

  const checkRazorpayConnection = async () => {
    try {
      // Check if Razorpay is configured by making a test API call
      const response = await fetch('/api/plans/razorpay-status');
      if (response.ok) {
        setRazorpayStatus('connected');
      } else {
        setRazorpayStatus('error');
      }
    } catch (error) {
      setRazorpayStatus('error');
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await planAPI.getPlans();
      if (response.success) {
        setPlans(response.data.plans);
      }
    } catch (error) {
      toast.error('Failed to fetch plans');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFeatureChange = (index, value) => {
    setFormData(prev => {
      const newFeatures = [...prev.features];
      if (value.trim() && !newFeatures.includes(value.trim())) {
        newFeatures[index] = value.trim();
      } else {
        newFeatures[index] = '';
      }
      return { ...prev, features: newFeatures };
    });
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, ''],
    }));
  };

  const removeFeature = (index) => {
    setFormData(prev => {
      const newFeatures = prev.features.filter((_, i) => i !== index);
      return { ...prev, features: newFeatures };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate form data
    if (!formData.name.trim() || !formData.description.trim() || !formData.amount || formData.amount <= 0) {
      toast.error('Please fill in all required fields with valid values');
      setLoading(false);
      return;
    }

    // Filter out empty features
    const validFeatures = formData.features.filter(feature => feature.trim() !== '');
    if (validFeatures.length === 0) {
      toast.error('Please add at least one feature to the plan');
      setLoading(false);
      return;
    }

    try {
      const planData = {
        ...formData,
        amount: parseFloat(formData.amount),
        period: parseInt(formData.period),
        totalCount: parseInt(formData.totalCount),
        features: validFeatures,
      };

      const response = await planAPI.createPlan(planData);
      
      if (response.success) {
        toast.success('Plan created and configured with Razorpay successfully!');
        setFormData({
          name: '',
          description: '',
          amount: '',
          currency: 'INR',
          frequency: 'monthly',
          period: 1,
          totalCount: 12,
          features: [''],
          popular: false,
          isActive: true,
        });
        
        // Add new plan to the list
        setPlans(prev => [...prev, response.data.plan]);
        
        // Update plans list
        fetchPlans();
      } else {
        toast.error(response.message || 'Failed to create plan');
      }
    } catch (error) {
      console.error('Plan creation error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create plan';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Razorpay Status */}
          <div className="mb-6 p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {razorpayStatus === 'connected' ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm font-medium text-green-700">Razorpay Connected</span>
                  </>
                ) : razorpayStatus === 'error' ? (
                  <>
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-sm font-medium text-red-700">Razorpay Connection Error</span>
                  </>
                ) : (
                  <>
                    <Loader className="h-5 w-5 text-blue-500 mr-2 animate-spin" />
                    <span className="text-sm font-medium text-blue-700">Checking Razorpay...</span>
                  </>
                )}
              </div>
              <div className="text-xs text-gray-500">
                Key ID: {process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_SatrrxFwKXJX8e'}
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Plan</h2>
          <p className="text-gray-600 mb-6">
            Create a new subscription plan that users can sign up for. Plans will be automatically configured with Razorpay.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Plan Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Plan Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter plan name"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe what this plan includes"
              />
            </div>

            {/* Price and Billing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                  min="1"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="99"
                />
              </div>

              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                </select>
              </div>

              <div>
                <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-2">
                  Billing Frequency
                </label>
                <select
                  id="frequency"
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-2">
                  Billing Period
                </label>
                <input
                  type="number"
                  id="period"
                  name="period"
                  value={formData.period}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1"
                />
              </div>

              <div>
                <label htmlFor="totalCount" className="block text-sm font-medium text-gray-700 mb-2">
                  Total Count
                </label>
                <input
                  type="number"
                  id="totalCount"
                  name="totalCount"
                  value={formData.totalCount}
                  onChange={handleInputChange}
                  required
                  min="1"
                  max="365"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="12"
                />
              </div>
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Features (one per line)
              </label>
              <div className="space-y-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter feature"
                    />
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFeature}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4 inline mr-2" />
                  Add Feature
                </button>
              </div>
            </div>

            {/* Popular Toggle */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="popular"
                name="popular"
                checked={formData.popular}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="popular" className="ml-2 text-sm font-medium text-gray-700">
                Mark as Popular
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end mt-6">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <Loader className="animate-spin h-4 w-4 mr-2" />
                    Creating...
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Plan
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Existing Plans */}
          {plans.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Existing Plans</h3>
              <div className="space-y-3">
                {plans.map((plan) => (
                  <div key={plan._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h4 className="font-medium text-gray-900">{plan.name}</h4>
                        {plan.razorpayPlanId ? (
                          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Configured
                          </span>
                        ) : (
                          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Not Configured
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">₹{plan.amount}/{plan.frequency} • {plan.features.length} features</p>
                      <p className="text-xs text-gray-500">
                        Razorpay ID: {plan.razorpayPlanId || 'Not Set'}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => window.open(`/admin/plans/${plan._id}`, '_blank')}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete plan "${plan.name}"?`)) {
                            // You would need to implement delete functionality
                            console.log('Delete plan:', plan.name);
                          }
                        }}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePlan;
