import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Users, TrendingUp, Calendar, DollarSign, Activity } from 'lucide-react';
import { subscriptionAPI } from '../services/api';
import authService from '../services/authService';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState({
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    totalSpent: 0,
    nextPayment: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = authService.getUser();
    setUser(user);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await subscriptionAPI.getUserSubscriptions();
      
      if (response.success) {
        const subs = response.data.subscriptions;
        setSubscriptions(subs);
        
        // Calculate stats
        const activeSubs = subs.filter(sub => sub.status === 'active');
        const totalSpent = subs.reduce((sum, sub) => sum + (sub.paidCount * sub.amount), 0);
        const nextPayment = activeSubs.length > 0 
          ? activeSubs.reduce((nearest, sub) => {
              if (!nearest || new Date(sub.nextChargeAt) < new Date(nearest.nextChargeAt)) {
                return sub;
              }
              return nearest;
            }, null)
          : null;

        setStats({
          totalSubscriptions: subs.length,
          activeSubscriptions: activeSubs.length,
          totalSpent,
          nextPayment,
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-blue-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-primary-100">
          Manage your subscriptions and track your payments
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-primary-100 rounded-lg p-3">
              <CreditCard className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Subscriptions</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalSubscriptions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Subscriptions</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeSubscriptions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Spent</p>
              <p className="text-2xl font-semibold text-gray-900">₹{stats.totalSpent}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Next Payment</p>
              <p className="text-lg font-semibold text-gray-900">
                {stats.nextPayment ? formatDate(stats.nextPayment.nextChargeAt) : 'No upcoming payments'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Subscriptions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Recent Subscriptions</h2>
            <Link
              to="/subscriptions"
              className="text-sm text-primary-600 hover:text-primary-500 font-medium"
            >
              View all
            </Link>
          </div>
        </div>
        
        {subscriptions.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {subscriptions.slice(0, 5).map((subscription) => (
              <div key={subscription._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-sm font-medium text-gray-900">
                        {subscription.planName}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                        {subscription.status}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                      <span>₹{subscription.amount}/{subscription.frequency}</span>
                      <span>{subscription.paidCount} paid</span>
                      <span>{subscription.remainingCount} remaining</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Next payment</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(subscription.nextChargeAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No subscriptions yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first subscription.</p>
            <div className="mt-6">
              <Link
                to="/plans"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                View Plans
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/plans"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-primary-100 rounded-lg p-3">
              <CreditCard className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Browse Plans</h3>
              <p className="text-sm text-gray-500">Explore available subscription plans</p>
            </div>
          </div>
        </Link>

        <Link
          to="/subscriptions"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Manage Subscriptions</h3>
              <p className="text-sm text-gray-500">View and manage your active subscriptions</p>
            </div>
          </div>
        </Link>

        <Link
          to="/profile"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Account Settings</h3>
              <p className="text-sm text-gray-500">Update your profile and preferences</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
