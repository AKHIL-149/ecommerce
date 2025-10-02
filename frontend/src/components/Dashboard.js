import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const [salesData, setSalesData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [customerData, setCustomerData] = useState({});
  const [realTimeData, setRealTimeData] = useState({});
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Mock data
      const mockSalesData = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
        revenue: Math.floor(Math.random() * 10000) + 5000,
        orders: Math.floor(Math.random() * 50) + 20,
        customers: Math.floor(Math.random() * 40) + 15
      }));

      const mockProductData = [
        { name: 'Wireless Headphones', revenue: 15420, units: 89, category: 'Electronics' },
        { name: 'Coffee Mug', revenue: 8930, units: 156, category: 'Home' },
        { name: 'T-Shirt', revenue: 7650, units: 98, category: 'Clothing' },
        { name: 'Laptop Stand', revenue: 6540, units: 34, category: 'Electronics' },
        { name: 'Water Bottle', revenue: 4320, units: 87, category: 'Sports' }
      ];

      const mockCustomerData = {
        segments: [
          { segment: 'VIP', customer_count: 45, avg_spent: 850 },
          { segment: 'Loyal', customer_count: 234, avg_spent: 320 },
          { segment: 'Regular', customer_count: 567, avg_spent: 180 },
          { segment: 'New', customer_count: 123, avg_spent: 95 }
        ],
        repeatCustomerRate: 67.8
      };

      const mockRealTimeData = {
        orders_last_hour: 12,
        revenue_last_hour: 2340,
        active_visitors: 847,
        orders_last_24h: 156,
        revenue_last_24h: 28450
      };

      setSalesData(mockSalesData);
      setProductData(mockProductData);
      setCustomerData(mockCustomerData);
      setRealTimeData(mockRealTimeData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        ...prev,
        orders_last_hour: Math.floor(Math.random() * 20) + 5,
        revenue_last_hour: Math.floor(Math.random() * 5000) + 1000,
        active_visitors: Math.floor(Math.random() * 200) + 600
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, [dateRange]);

  const StatCard = ({ title, value, subtitle, color = 'blue', icon }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        {icon && <div className="text-3xl opacity-20">{icon}</div>}
      </div>
    </div>
  );

  if (loading) {
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
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Real-time Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <StatCard
              title="Active Visitors"
              value={realTimeData.active_visitors?.toLocaleString()}
              subtitle="Right now"
              color="#10B981"
              icon="👁️"
            />
            <StatCard
              title="Orders (1h)"
              value={realTimeData.orders_last_hour}
              subtitle="Last hour"
              color="#3B82F6"
              icon="🛒"
            />
            <StatCard
              title="Revenue (1h)"
              value={`$${realTimeData.revenue_last_hour?.toLocaleString()}`}
              subtitle="Last hour"
              color="#8B5CF6"
              icon="💰"
            />
            <StatCard
              title="Orders (24h)"
              value={realTimeData.orders_last_24h}
              subtitle="Last 24 hours"
              color="#F59E0B"
              icon="📊"
            />
            <StatCard
              title="Revenue (24h)"
              value={`$${realTimeData.revenue_last_24h?.toLocaleString()}`}
              subtitle="Last 24 hours"
              color="#EF4444"
              icon="💎"
            />
          </div>
        </div>

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
                  <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} />
                  <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#10B981" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="customers" stroke="#F59E0B" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Segments</h2>
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
                    {customerData.segments?.map((entry, index) => (
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
          </div>
        </div>

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
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${product.revenue.toLocaleString()}
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

        <div className="text-center py-8 border-t">
          <p className="text-gray-500 text-sm">
            🚀 EcomAnalytics - Open Source E-commerce Analytics Platform
          </p>
          <p className="text-gray-400 text-xs mt-2">
            Built with React, Node.js, and PostgreSQL
          </p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;