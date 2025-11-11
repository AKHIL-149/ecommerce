import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import analyticsService from '../services/analyticsService';
import authService from '../services/authService';

const Dashboard = ({ user, onLogout }) => {
  const [salesData, setSalesData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [customerData, setCustomerData] = useState({});
  const [realTimeData, setRealTimeData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [storeId, setStoreId] = useState(1); // TODO: Make this dynamic with store selection
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      // Fetch all analytics data in parallel
      const [salesResult, productResult, customerResult, realTimeResult] = await Promise.all([
        analyticsService.getSalesOverview(storeId, dateRange.startDate, dateRange.endDate),
        analyticsService.getProductPerformance(storeId, dateRange.startDate, dateRange.endDate, 10),
        analyticsService.getCustomerInsights(storeId, dateRange.startDate, dateRange.endDate),
        analyticsService.getRealTimeStats(storeId)
      ]);

      // Transform sales data for charts
      const transformedSalesData = salesResult.dailyStats.map(stat => ({
        date: new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: parseFloat(stat.revenue || 0),
        orders: parseInt(stat.orders || 0),
        customers: parseInt(stat.unique_customers || 0)
      })).reverse();

      // Transform product data for charts
      const transformedProductData = productResult.products.map(product => ({
        name: product.name.length > 20 ? product.name.substring(0, 20) + '...' : product.name,
        revenue: parseFloat(product.revenue || 0),
        units: parseInt(product.units_sold || 0),
        category: product.category,
        fullName: product.name
      }));

      setSalesData(transformedSalesData);
      setProductData(transformedProductData);
      setCustomerData(customerResult);
      setRealTimeData(realTimeResult);
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRealTimeData = async () => {
    try {
      const realTimeResult = await analyticsService.getRealTimeStats(storeId);
      setRealTimeData(realTimeResult);
    } catch (err) {
      console.error('Real-time stats error:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange, storeId]);

  useEffect(() => {
    // Update real-time stats every 30 seconds
    const interval = setInterval(fetchRealTimeData, 30000);
    return () => clearInterval(interval);
  }, [storeId]);

  const handleLogout = async () => {
    await authService.logout();
    onLogout();
  };

  const StatCard = ({ title, value, subtitle, color = 'blue', icon }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value || '0'}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        {icon && <div className="text-3xl opacity-20">{icon}</div>}
      </div>
    </div>
  );

  if (loading && !salesData.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">EcomAnalytics</h1>
              <p className="text-sm text-gray-600">E-commerce Analytics Dashboard</p>
            </div>
            <div className="flex items-center space-x-4">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="border rounded-md px-3 py-2 text-sm"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="border rounded-md px-3 py-2 text-sm"
              />
              <div className="border-l pl-4">
                <p className="text-sm text-gray-600">Welcome, {user?.firstName || 'User'}</p>
                <button
                  onClick={handleLogout}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Real-time Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <StatCard
              title="Active Visitors"
              value={parseInt(realTimeData.active_visitors || 0).toLocaleString()}
              subtitle="Last 5 minutes"
              color="#10B981"
              icon="👁️"
            />
            <StatCard
              title="Orders (1h)"
              value={parseInt(realTimeData.orders_last_hour || 0)}
              subtitle="Last hour"
              color="#3B82F6"
              icon="🛒"
            />
            <StatCard
              title="Revenue (1h)"
              value={`$${parseFloat(realTimeData.revenue_last_hour || 0).toLocaleString()}`}
              subtitle="Last hour"
              color="#8B5CF6"
              icon="💰"
            />
            <StatCard
              title="Orders (24h)"
              value={parseInt(realTimeData.orders_last_24h || 0)}
              subtitle="Last 24 hours"
              color="#F59E0B"
              icon="📊"
            />
            <StatCard
              title="Revenue (24h)"
              value={`$${parseFloat(realTimeData.revenue_last_24h || 0).toLocaleString()}`}
              subtitle="Last 24 hours"
              color="#EF4444"
              icon="💎"
            />
          </div>
        </div>

        {salesData.length > 0 ? (
          <>
            <div className="mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales Overview</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} name="Revenue ($)" />
                      <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#10B981" strokeWidth={2} name="Orders" />
                      <Line yAxisId="right" type="monotone" dataKey="customers" stroke="#F59E0B" strokeWidth={2} name="Customers" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h2>
                {productData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={productData} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip />
                        <Bar dataKey="revenue" fill="#3B82F6" name="Revenue ($)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-12">No product data available for this period</p>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Segments</h2>
                {customerData.segments?.length > 0 ? (
                  <>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={customerData.segments}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ segment, percent }) => `${segment} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="customer_count"
                          >
                            {customerData.segments.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-600">
                        Repeat Customer Rate: <span className="font-semibold text-green-600">{customerData.repeatCustomerRate}%</span>
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 text-center py-12">No customer data available for this period</p>
                )}
              </div>
            </div>

            {productData.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Performance Details</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units Sold</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Price</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {productData.map((product, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900" title={product.fullName}>{product.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {product.category || 'Uncategorized'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${product.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {product.units}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${(product.revenue / product.units).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">No data available for the selected period</p>
            <p className="text-gray-400 text-sm mt-2">Try selecting a different date range</p>
          </div>
        )}

        <div className="text-center py-8 border-t">
          <p className="text-gray-500 text-sm">
            EcomAnalytics - Open Source E-commerce Analytics Platform
          </p>
          <p className="text-gray-400 text-xs mt-2">
            Built with React, Node.js, and PostgreSQL | MIT License
          </p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
