// frontend/src/components/customers/CustomerOrderHistory.js
// Component to display customer's purchase history

import React, { useState, useEffect } from 'react';
import { customersAPI } from '../../utils/api';
import { formatCurrency, formatDate } from '../../utils/helpers';

const CustomerOrderHistory = ({ customer, onClose }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    averageOrderValue: 0
  });

  useEffect(() => {
    if (customer) {
      fetchOrderHistory();
    }
  }, [customer]);

  const fetchOrderHistory = async () => {
    setLoading(true);
    try {
      const response = await customersAPI.getOrders(customer.id, {
        limit: 50
      });

      const orderData = response.data.orders || [];
      setOrders(orderData);

      // Calculate stats
      const totalSpent = orderData.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
      const totalOrders = orderData.length;
      const avgValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

      setStats({
        totalOrders,
        totalSpent,
        averageOrderValue: avgValue
      });
    } catch (error) {
      console.error('Error fetching order history:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Customer Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">{customer.name}</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Spent</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalSpent)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Average Order</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.averageOrderValue)}</p>
          </div>
        </div>
      </div>

      {/* Order History */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-3">Order History</h4>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No orders found for this customer</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-gray-900">
                      Order #{order.order_number}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(order.total_amount)}
                    </p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                {order.item_count && (
                  <p className="text-sm text-gray-600">
                    {order.item_count} {order.item_count === 1 ? 'item' : 'items'}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Close Button */}
      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default CustomerOrderHistory;
