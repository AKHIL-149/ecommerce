// frontend/src/components/dashboard/Dashboard.js
// Main dashboard showing store overview and key metrics

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useStore } from '../../context/StoreContext';
import { reportsAPI, ordersAPI, productsAPI } from '../../utils/api';
import { formatCurrency, formatDate } from '../../utils/helpers';

const Dashboard = () => {
  const { currentStore } = useStore();
  const [stats, setStats] = useState({
    today: {},
    sales: [],
    topProducts: [],
    lowStock: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (currentStore) {
      fetchDashboardData();
    }
  }, [currentStore, dateRange]);

  const fetchDashboardData = async () => {
    if (!currentStore) return;

    setLoading(true);
    try {
      // Fetch data from multiple endpoints in parallel
      const [todayStatsRes, salesRes, productsRes, lowStockRes] = await Promise.all([
        ordersAPI.getTodayStats({ storeId: currentStore.id }),
        reportsAPI.getSales({
          storeId: currentStore.id,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }),
        reportsAPI.getProducts({
          storeId: currentStore.id,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          limit: 5
        }),
        productsAPI.getLowStock({ storeId: currentStore.id })
      ]);

      setStats({
        today: todayStatsRes.data,
        sales: salesRes.data.dailyStats || [],
        topProducts: productsRes.data.products || [],
        lowStock: lowStockRes.data.products || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, color = '#3B82F6' }) => (
    <div className="bg-white rounded-lg shadow p-6 border-l-4" style={{ borderColor: color }}>
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );

  if (!currentStore) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Store Selected</h2>
        <p className="text-gray-600 mb-4">Please create a store to get started</p>
        <Link to="/settings" className="text-blue-600 hover:text-blue-700">
          Go to Settings
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with date range selector */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Welcome back! Here's what's happening with your store.</p>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Today's stats */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Orders Today"
            value={stats.today.orders_today || 0}
            subtitle="Total orders placed"
            color="#3B82F6"
          />
          <StatCard
            title="Revenue Today"
            value={formatCurrency(stats.today.revenue_today || 0)}
            subtitle="Total revenue generated"
            color="#10B981"
          />
          <StatCard
            title="Average Order Value"
            value={formatCurrency(stats.today.avg_order_value || 0)}
            subtitle="Per order average"
            color="#8B5CF6"
          />
        </div>
      </div>

      {/* Sales chart */}
      {stats.sales.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.sales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(date) => formatDate(date)} />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === 'revenue') return [formatCurrency(value), 'Revenue'];
                    return [value, name === 'orders' ? 'Orders' : 'Customers'];
                  }}
                  labelFormatter={(date) => formatDate(date)}
                />
                <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} name="Revenue" />
                <Line type="monotone" dataKey="orders" stroke="#10B981" strokeWidth={2} name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Top products and low stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top selling products */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Top Products</h2>
            <Link to="/reports" className="text-sm text-blue-600 hover:text-blue-700">
              View all
            </Link>
          </div>
          {stats.topProducts.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topProducts} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="revenue" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No product sales data available</p>
          )}
        </div>

        {/* Low stock alerts */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h2>
            <Link to="/inventory" className="text-sm text-blue-600 hover:text-blue-700">
              View all
            </Link>
          </div>
          {stats.lowStock.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {stats.lowStock.slice(0, 5).map((product) => (
                <div key={product.id} className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-yellow-700">
                      {product.inventory_quantity} left
                    </p>
                    <p className="text-xs text-gray-500">
                      Threshold: {product.low_stock_threshold}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">All products have sufficient stock</p>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            to="/products"
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
          >
            <p className="font-medium text-gray-900">Add Product</p>
            <p className="text-sm text-gray-500 mt-1">Create new product</p>
          </Link>
          <Link
            to="/orders"
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
          >
            <p className="font-medium text-gray-900">New Order</p>
            <p className="text-sm text-gray-500 mt-1">Record a sale</p>
          </Link>
          <Link
            to="/customers"
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
          >
            <p className="font-medium text-gray-900">Add Customer</p>
            <p className="text-sm text-gray-500 mt-1">Register new customer</p>
          </Link>
          <Link
            to="/reports"
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
          >
            <p className="font-medium text-gray-900">View Reports</p>
            <p className="text-sm text-gray-500 mt-1">Analytics & insights</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
