// frontend/src/components/orders/OrderDetails.js
// Component for displaying and managing order details

import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../../utils/api';
import { formatCurrency, formatDate } from '../../utils/helpers';
import Button from '../common/Button';

const OrderDetails = ({ order: initialOrder, onStatusUpdate, onClose }) => {
  const [order, setOrder] = useState(initialOrder);
  const [loading, setLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Fetch full order details including items
  useEffect(() => {
    fetchOrderDetails();
  }, [initialOrder.id]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const response = await ordersAPI.getById(initialOrder.id);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await onStatusUpdate(order.id, newStatus);
      setOrder(prev => ({ ...prev, status: newStatus }));
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdatingStatus(false);
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

  const getStatusTimeline = () => {
    const statuses = ['pending', 'processing', 'completed'];
    const currentStatusIndex = statuses.indexOf(order.status);
    const isCancelled = order.status === 'cancelled';

    if (isCancelled) {
      return (
        <div className="flex items-center justify-center p-4 bg-red-50 rounded-lg">
          <span className="text-red-600 font-medium">❌ Order Cancelled</span>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between">
        {statuses.map((status, index) => {
          const isCompleted = index <= currentStatusIndex;
          const isCurrent = index === currentStatusIndex;

          return (
            <React.Fragment key={status}>
              <div className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  isCompleted
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  {isCompleted ? '✓' : index + 1}
                </div>
                <div className={`mt-2 text-xs font-medium ${
                  isCurrent ? 'text-blue-600' : isCompleted ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </div>
              </div>
              {index < statuses.length - 1 && (
                <div className={`h-0.5 flex-1 mx-2 ${
                  index < currentStatusIndex ? 'bg-blue-500' : 'bg-gray-300'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Order #{order.order_number}</h2>
          <p className="text-sm text-gray-500 mt-1">Placed on {formatDate(order.created_at)}</p>
        </div>
        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
          {order.status}
        </span>
      </div>

      {/* Customer Information */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Customer Information</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase">Name</p>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {order.customer_name || 'Walk-in Customer'}
              </p>
            </div>
            {order.customer_email && (
              <div>
                <p className="text-xs text-gray-500 uppercase">Email</p>
                <p className="text-sm text-gray-900 mt-1">{order.customer_email}</p>
              </div>
            )}
            {order.customer_phone && (
              <div>
                <p className="text-xs text-gray-500 uppercase">Phone</p>
                <p className="text-sm text-gray-900 mt-1">{order.customer_phone}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Order Items</h3>
        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {order.items && order.items.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.product_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(item.price)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                    {formatCurrency(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan="3" className="px-4 py-3 text-sm font-medium text-gray-900 text-right">Total:</td>
                <td className="px-4 py-3 text-lg font-bold text-gray-900 text-right">
                  {formatCurrency(order.total_amount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Payment Information */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Payment Information</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase">Payment Method</p>
              <p className="text-sm font-medium text-gray-900 mt-1 capitalize">
                {order.payment_method || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Payment Status</p>
              <p className="text-sm font-medium text-gray-900 mt-1 capitalize">
                {order.payment_status || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Notes</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-700">{order.notes}</p>
          </div>
        </div>
      )}

      {/* Order Status Timeline */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Order Timeline</h3>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          {getStatusTimeline()}
        </div>
      </div>

      {/* Status Update Actions */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Update Order Status</h3>
        <div className="flex flex-wrap gap-2">
          {order.status !== 'pending' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange('pending')}
              disabled={updatingStatus}
            >
              Mark as Pending
            </Button>
          )}
          {order.status !== 'processing' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange('processing')}
              disabled={updatingStatus}
            >
              Mark as Processing
            </Button>
          )}
          {order.status !== 'completed' && (
            <Button
              size="sm"
              variant="success"
              onClick={() => handleStatusChange('completed')}
              disabled={updatingStatus}
            >
              Mark as Completed
            </Button>
          )}
          {order.status !== 'cancelled' && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleStatusChange('cancelled')}
              disabled={updatingStatus}
            >
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      {/* Close Button */}
      <div className="border-t pt-4 flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
};

export default OrderDetails;
