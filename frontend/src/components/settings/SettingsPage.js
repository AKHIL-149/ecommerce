// frontend/src/components/settings/SettingsPage.js
// Settings page for store configuration and user profile management

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { storesAPI, authAPI } from '../../utils/api';
import Input from '../common/Input';
import Button from '../common/Button';

const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  const { currentStore, updateStore } = useStore();
  const [activeTab, setActiveTab] = useState('store');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Store settings form
  const [storeForm, setStoreForm] = useState({
    name: '',
    currency: 'USD',
    timezone: 'UTC',
    low_stock_threshold: '10'
  });

  // Profile form
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: ''
  });

  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Load current store settings
  useEffect(() => {
    if (currentStore) {
      setStoreForm({
        name: currentStore.name || '',
        currency: currentStore.settings?.currency || 'USD',
        timezone: currentStore.settings?.timezone || 'UTC',
        low_stock_threshold: currentStore.settings?.low_stock_threshold || '10'
      });
    }
  }, [currentStore]);

  // Load current user profile
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleStoreFormChange = (e) => {
    const { name, value } = e.target;
    setStoreForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleProfileFormChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordFormChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSaveStore = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const storeData = {
        name: storeForm.name,
        settings: {
          currency: storeForm.currency,
          timezone: storeForm.timezone,
          low_stock_threshold: parseInt(storeForm.low_stock_threshold)
        }
      };

      const result = await updateStore(currentStore.id, storeData);

      if (result.success) {
        setSuccessMessage('Store settings saved successfully');
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        alert(result.error || 'Failed to save store settings');
      }
    } catch (error) {
      console.error('Error saving store settings:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert('Failed to save store settings');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const response = await authAPI.updateProfile(profileForm);
      updateUser(response.data.user);
      setSuccessMessage('Profile updated successfully');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert('Failed to update profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccessMessage('');

    // Validate password form
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setErrors({ confirm_password: 'Passwords do not match' });
      setLoading(false);
      return;
    }

    if (passwordForm.new_password.length < 6) {
      setErrors({ new_password: 'Password must be at least 6 characters' });
      setLoading(false);
      return;
    }

    try {
      await authAPI.changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      });

      setSuccessMessage('Password changed successfully');
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error changing password:', error);
      if (error.response?.data?.message) {
        setErrors({ current_password: error.response.data.message });
      } else {
        alert('Failed to change password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-600 mt-1">Manage your store and account settings</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {successMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('store')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'store'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Store Settings
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'password'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Change Password
          </button>
        </nav>
      </div>

      {/* Store Settings Tab */}
      {activeTab === 'store' && currentStore && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Store Information</h2>
          <form onSubmit={handleSaveStore} className="space-y-4">
            <Input
              label="Store Name"
              name="name"
              value={storeForm.name}
              onChange={handleStoreFormChange}
              placeholder="Enter store name"
              error={errors.name}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  id="currency"
                  name="currency"
                  value={storeForm.currency}
                  onChange={handleStoreFormChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                </select>
              </div>

              <div>
                <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
                  Timezone
                </label>
                <select
                  id="timezone"
                  name="timezone"
                  value={storeForm.timezone}
                  onChange={handleStoreFormChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Asia/Kolkata">India</option>
                </select>
              </div>
            </div>

            <Input
              label="Default Low Stock Threshold"
              name="low_stock_threshold"
              type="number"
              value={storeForm.low_stock_threshold}
              onChange={handleStoreFormChange}
              placeholder="10"
              error={errors.low_stock_threshold}
            />

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Store Settings'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <Input
              label="Full Name"
              name="name"
              value={profileForm.name}
              onChange={handleProfileFormChange}
              placeholder="Enter your name"
              error={errors.name}
              required
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              value={profileForm.email}
              onChange={handleProfileFormChange}
              placeholder="your.email@example.com"
              error={errors.email}
              required
            />

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input
              label="Current Password"
              name="current_password"
              type="password"
              value={passwordForm.current_password}
              onChange={handlePasswordFormChange}
              placeholder="Enter current password"
              error={errors.current_password}
              required
            />

            <Input
              label="New Password"
              name="new_password"
              type="password"
              value={passwordForm.new_password}
              onChange={handlePasswordFormChange}
              placeholder="Enter new password"
              error={errors.new_password}
              required
            />

            <Input
              label="Confirm New Password"
              name="confirm_password"
              type="password"
              value={passwordForm.confirm_password}
              onChange={handlePasswordFormChange}
              placeholder="Confirm new password"
              error={errors.confirm_password}
              required
            />

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Changing...' : 'Change Password'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
