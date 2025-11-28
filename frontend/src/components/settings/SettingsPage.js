// frontend/src/components/settings/SettingsPage.js
// Settings page for store configuration and user profile management

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { storesAPI, authAPI, categoriesAPI } from '../../utils/api';
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

  // Categories management
  const [categories, setCategories] = useState([]);
  const [categoryForm, setCategoryForm] = useState({
    id: null,
    name: '',
    description: '',
    color: '#3B82F6'
  });
  const [editingCategory, setEditingCategory] = useState(null);

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

  // Load categories when tab is active and store is selected
  useEffect(() => {
    if (currentStore && activeTab === 'categories') {
      fetchCategories();
    }
  }, [currentStore, activeTab]);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.list({ storeId: currentStore.id });
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

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

  const handleCategoryFormChange = (e) => {
    const { name, value } = e.target;
    setCategoryForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      if (editingCategory) {
        // Update existing category
        await categoriesAPI.update(editingCategory.id, {
          name: categoryForm.name,
          description: categoryForm.description,
          color: categoryForm.color
        });
        setSuccessMessage('Category updated successfully');
      } else {
        // Create new category
        await categoriesAPI.create({
          store_id: currentStore.id,
          name: categoryForm.name,
          description: categoryForm.description,
          color: categoryForm.color
        });
        setSuccessMessage('Category created successfully');
      }

      // Reset form and refresh list
      setCategoryForm({ id: null, name: '', description: '', color: '#3B82F6' });
      setEditingCategory(null);
      fetchCategories();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving category:', error);
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else {
        alert('Failed to save category');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      id: category.id,
      name: category.name,
      description: category.description || '',
      color: category.color || '#3B82F6'
    });
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setCategoryForm({ id: null, name: '', description: '', color: '#3B82F6' });
  };

  const handleDeleteCategory = async (category) => {
    if (!window.confirm(`Are you sure you want to delete "${category.name}"? Products in this category will become uncategorized.`)) {
      return;
    }

    setLoading(true);
    try {
      await categoriesAPI.delete(category.id);
      setSuccessMessage('Category deleted successfully');
      fetchCategories();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
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
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'categories'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Categories
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

      {/* Categories Tab */}
      {activeTab === 'categories' && currentStore && (
        <div className="space-y-6">
          {/* Category Form */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h2>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <Input
                label="Category Name"
                name="name"
                value={categoryForm.name}
                onChange={handleCategoryFormChange}
                placeholder="e.g., Electronics, Clothing, Food"
                error={errors.name}
                required
              />

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={categoryForm.description}
                  onChange={handleCategoryFormChange}
                  placeholder="Optional description for this category"
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    id="color"
                    name="color"
                    type="color"
                    value={categoryForm.color}
                    onChange={handleCategoryFormChange}
                    className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                  />
                  <span className="text-sm text-gray-600">{categoryForm.color}</span>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                {editingCategory && (
                  <Button type="button" variant="outline" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                )}
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : (editingCategory ? 'Update Category' : 'Add Category')}
                </Button>
              </div>
            </form>
          </div>

          {/* Categories List */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Categories</h2>
            {categories.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No categories yet. Create your first category above.
              </p>
            ) : (
              <div className="space-y-3">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-8 h-8 rounded"
                        style={{ backgroundColor: category.color }}
                      />
                      <div>
                        <p className="font-medium text-gray-900">{category.name}</p>
                        {category.description && (
                          <p className="text-sm text-gray-500">{category.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category)}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
