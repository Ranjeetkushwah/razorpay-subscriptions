import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, Calendar, DollarSign, CreditCard, Activity, Pause, Play, X, ExternalLink, Loader } from 'lucide-react';
import { subscriptionAPI } from '../services/api';

const SubscriptionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [razorpaySubscription, setRazorpaySubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchSubscriptionDetails();
  }, [id]);

  const fetchSubscriptionDetails = async () => {
    try {
      const response = await subscriptionAPI.getSubscription(id);
      if (response.success) {
        setSubscription(response.data.subscription);
        setRazorpaySubscription(response.data.razorpaySubscription);
      }
    } catch (error) {
      toast.error('Failed to fetch subscription details');
      navigate('/subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel this subscription?')) {
      return;
    }

    setActionLoading('cancel');
    
    try {
      const response = await subscriptionAPI.cancelSubscription(id);
      
      if (response.success) {
        toast.success('Subscription cancelled successfully');
        fetchSubscriptionDetails();
      } else {
        toast.error(response.message || 'Failed to cancel subscription');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to cancel subscription');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePauseSubscription = async () => {
    setActionLoading('pause');
    
    try {
      const response = await subscriptionAPI.pauseSubscription(id);
      
      if (response.success) {
        toast.success('Subscription paused successfully');
        fetchSubscriptionDetails();
      } else {
        toast.error(response.message || 'Failed to pause subscription');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to pause subscription');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResumeSubscription = async () => {
    setActionLoading('resume');
    
    try {
      const response = await subscriptionAPI.resumeSubscription(id);
      
      if (response.success) {
        toast.success('Subscription resumed successfully');
        fetchSubscriptionDetails();
      } else {
        toast.error(response.message || 'Failed to resume subscription');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to resume subscription');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'created':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'halted':
        return 'bg-gray-100 text-gray-800';
      case 'paused':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="text-center py-12">
        <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Subscription not found</h3>
        <button
          onClick={() => navigate('/subscriptions')}
          className="mt-4 text-primary-600 hover:text-primary-500"
        >
          Back to Subscriptions
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/subscriptions')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Subscriptions
        </button>
      </div>

      {/* Subscription Overview */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{subscription.planName}</h1>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}>
                {subscription.status}
              </span>
            </div>
            
            {subscription.shortUrl && (
              <a
                href={subscription.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View in Razorpay
              </a>
            )}
          </div>

          {/* Key Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 bg-primary-100 rounded-lg p-3">
                <DollarSign className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Amount</p>
                <p className="text-lg font-semibold text-gray-900">
                  ₹{subscription.amount}/{subscription.frequency}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Progress</p>
                <p className="text-lg font-semibold text-gray-900">
                  {subscription.paidCount}/{subscription.totalCount}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Next Payment</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatDate(subscription.nextChargeAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Remaining</p>
                <p className="text-lg font-semibold text-gray-900">
                  {subscription.remainingCount} payments
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Subscription Progress</span>
              <span>{Math.round((subscription.paidCount / subscription.totalCount) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                style={{
                  width: `${(subscription.paidCount / subscription.totalCount) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {subscription.status === 'active' && (
              <>
                <button
                  onClick={handlePauseSubscription}
                  disabled={actionLoading === 'pause'}
                  className="inline-flex items-center px-4 py-2 border border-yellow-300 rounded-md text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 disabled:opacity-50"
                >
                  {actionLoading === 'pause' ? (
                    <Loader className="animate-spin h-4 w-4 mr-2" />
                  ) : (
                    <Pause className="h-4 w-4 mr-2" />
                  )}
                  Pause
                </button>
                
                <button
                  onClick={handleCancelSubscription}
                  disabled={actionLoading === 'cancel'}
                  className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50"
                >
                  {actionLoading === 'cancel' ? (
                    <Loader className="animate-spin h-4 w-4 mr-2" />
                  ) : (
                    <X className="h-4 w-4 mr-2" />
                  )}
                  Cancel
                </button>
              </>
            )}

            {subscription.status === 'paused' && (
              <button
                onClick={handleResumeSubscription}
                disabled={actionLoading === 'resume'}
                className="inline-flex items-center px-4 py-2 border border-green-300 rounded-md text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 disabled:opacity-50"
              >
                {actionLoading === 'resume' ? (
                  <Loader className="animate-spin h-4 w-4 mr-2" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Resume
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscription Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Subscription ID</span>
              <span className="font-mono text-sm">{subscription.razorpaySubscriptionId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Plan ID</span>
              <span className="font-mono text-sm">{subscription.razorpayPlanId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Customer ID</span>
              <span className="font-mono text-sm">{subscription.razorpayCustomerId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Currency</span>
              <span>{subscription.currency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Frequency</span>
              <span className="capitalize">{subscription.frequency}</span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Started</span>
              <span>{formatDate(subscription.startAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Authenticated</span>
              <span>{formatDate(subscription.authAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Next Charge</span>
              <span>{formatDate(subscription.nextChargeAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Ends</span>
              <span>{formatDate(subscription.endAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Created</span>
              <span>{formatDate(subscription.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {subscription.notes && Object.keys(subscription.notes).length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h2>
          <pre className="bg-gray-50 p-4 rounded-md text-sm text-gray-700 overflow-x-auto">
            {JSON.stringify(subscription.notes, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default SubscriptionDetails;
