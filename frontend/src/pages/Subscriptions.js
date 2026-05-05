import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CreditCard, Pause, Play, X, ExternalLink, RefreshCw, Loader } from 'lucide-react';
import { subscriptionAPI } from '../services/api';

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await subscriptionAPI.getUserSubscriptions();
      if (response.success) {
        setSubscriptions(response.data.subscriptions);
      }
    } catch (error) {
      toast.error('Failed to fetch subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (subscriptionId) => {
    if (!window.confirm('Are you sure you want to cancel this subscription?')) {
      return;
    }

    setActionLoading(subscriptionId);
    
    try {
      const response = await subscriptionAPI.cancelSubscription(subscriptionId);
      
      if (response.success) {
        toast.success('Subscription cancelled successfully');
        fetchSubscriptions();
      } else {
        toast.error(response.message || 'Failed to cancel subscription');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to cancel subscription');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePauseSubscription = async (subscriptionId) => {
    setActionLoading(subscriptionId);
    
    try {
      const response = await subscriptionAPI.pauseSubscription(subscriptionId);
      
      if (response.success) {
        toast.success('Subscription paused successfully');
        fetchSubscriptions();
      } else {
        toast.error(response.message || 'Failed to pause subscription');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to pause subscription');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResumeSubscription = async (subscriptionId) => {
    setActionLoading(subscriptionId);
    
    try {
      const response = await subscriptionAPI.resumeSubscription(subscriptionId);
      
      if (response.success) {
        toast.success('Subscription resumed successfully');
        fetchSubscriptions();
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
      month: 'short',
      day: 'numeric',
    });
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Subscriptions</h1>
          <p className="text-gray-600 mt-1">Manage your active subscriptions</p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={fetchSubscriptions}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <Link
            to="/plans"
            className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Add New
          </Link>
        </div>
      </div>

      {/* Subscriptions List */}
      {subscriptions.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {subscriptions.map((subscription) => (
            <div key={subscription._id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Plan Name and Status */}
                    <div className="flex items-center space-x-3 mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {subscription.planName}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                        {subscription.status}
                      </span>
                    </div>

                    {/* Subscription Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div>
                        <p className="text-sm text-gray-500">Amount</p>
                        <p className="text-lg font-medium text-gray-900">
                          ₹{subscription.amount}/{subscription.frequency}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Progress</p>
                        <p className="text-lg font-medium text-gray-900">
                          {subscription.paidCount}/{subscription.totalCount} payments
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Next Payment</p>
                        <p className="text-lg font-medium text-gray-900">
                          {formatDate(subscription.nextChargeAt)}
                        </p>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Started:</span> {formatDate(subscription.startAt)}
                      </div>
                      <div>
                        <span className="font-medium">Ends:</span> {formatDate(subscription.endAt)}
                      </div>
                      <div>
                        <span className="font-medium">Auth At:</span> {formatDate(subscription.authAt)}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2 ml-6">
                    {subscription.shortUrl && (
                      <a
                        href={subscription.shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View in Razorpay
                      </a>
                    )}

                    {subscription.status === 'active' && (
                      <>
                        <button
                          onClick={() => handlePauseSubscription(subscription._id)}
                          disabled={actionLoading === subscription._id}
                          className="inline-flex items-center px-3 py-2 border border-yellow-300 rounded-md text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 disabled:opacity-50"
                        >
                          {actionLoading === subscription._id ? (
                            <Loader className="animate-spin h-4 w-4 mr-2" />
                          ) : (
                            <Pause className="h-4 w-4 mr-2" />
                          )}
                          Pause
                        </button>
                        
                        <button
                          onClick={() => handleCancelSubscription(subscription._id)}
                          disabled={actionLoading === subscription._id}
                          className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50"
                        >
                          {actionLoading === subscription._id ? (
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
                        onClick={() => handleResumeSubscription(subscription._id)}
                        disabled={actionLoading === subscription._id}
                        className="inline-flex items-center px-3 py-2 border border-green-300 rounded-md text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 disabled:opacity-50"
                      >
                        {actionLoading === subscription._id ? (
                          <Loader className="animate-spin h-4 w-4 mr-2" />
                        ) : (
                          <Play className="h-4 w-4 mr-2" />
                        )}
                        Resume
                      </button>
                    )}

                    <Link
                      to={`/subscriptions/${subscription._id}`}
                      className="inline-flex items-center px-3 py-2 border border-primary-300 rounded-md text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-gray-50 px-6 py-3">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Subscription Progress</span>
                  <span>{Math.round((subscription.paidCount / subscription.totalCount) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(subscription.paidCount / subscription.totalCount) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No subscriptions yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first subscription.
          </p>
          <div className="mt-6">
            <Link
              to="/plans"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Browse Plans
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
