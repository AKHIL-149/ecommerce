// frontend/src/components/orders/OrderForm.js
// Form component for creating new orders

import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { ordersAPI, productsAPI, customersAPI } from '../../utils/api';
import { formatCurrency } from '../../utils/helpers';
import Input from '../common/Input';
import Button from '../common/Button';

const OrderForm = ({ onSuccess, onCancel }) => {
  const { currentStore } = useStore();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [errors, setErrors] = useState({});

  // Form state
  const [formData, setFormData] = useState({
    customer_id: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    payment_method: 'cash',
    payment_status: 'paid',
    notes: ''
  });

  // Order items state
  const [orderItems, setOrderItems] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  // Load products and customers when component mounts
  useEffect(() => {
    if (currentStore) {
      fetchProducts();
      fetchCustomers();
    }
  }, [currentStore]);

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.list({
        storeId: currentStore.id,
        limit: 1000,
        status: 'active'
      });
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await customersAPI.list({
        storeId: currentStore.id,
        limit: 1000
      });
      setCustomers(response.data.customers);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // If selecting an existing customer, populate their details
    if (name === 'customer_id' && value) {
      const customer = customers.find(c => c.id === parseInt(value));
      if (customer) {
        setFormData(prev => ({
          ...prev,
          customer_name: customer.name,
          customer_email: customer.email || '',
          customer_phone: customer.phone || ''
        }));
      }
    }

    // Clear customer ID if manually editing customer fields
    if ((name === 'customer_name' || name === 'customer_email' || name === 'customer_phone') && formData.customer_id) {
      setFormData(prev => ({
        ...prev,
        customer_id: ''
      }));
    }
  };

  const handleAddItem = () => {
    if (!selectedProductId) {
      alert('Please select a product');
      return;
    }

    if (selectedQuantity <= 0) {
      alert('Quantity must be greater than 0');
      return;
    }

    const product = products.find(p => p.id === parseInt(selectedProductId));
    if (!product) return;

    // Check if product already in order
    const existingItemIndex = orderItems.findIndex(item => item.product_id === product.id);

    if (existingItemIndex >= 0) {
      // Update quantity if product already added
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += selectedQuantity;
      setOrderItems(updatedItems);
    } else {
      // Add new item
      setOrderItems([
        ...orderItems,
        {
          product_id: product.id,
          product_name: product.name,
          quantity: selectedQuantity,
          price: product.price
        }
      ]);
    }

    // Reset selection
    setSelectedProductId('');
    setSelectedQuantity(1);
  };

  const handleRemoveItem = (index) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleUpdateQuantity = (index, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(index);
      return;
    }

    const updatedItems = [...orderItems];
    updatedItems[index].quantity = newQuantity;
    setOrderItems(updatedItems);
  };

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const validateForm = () => {
    const newErrors = {};

    // Customer name is required
    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'Customer name is required';
    }

    // At least one order item is required
    if (orderItems.length === 0) {
      newErrors.items = 'Please add at least one product to the order';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        store_id: currentStore.id,
        customer_id: formData.customer_id || null,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email || null,
        customer_phone: formData.customer_phone || null,
        payment_method: formData.payment_method,
        payment_status: formData.payment_status,
        notes: formData.notes || null,
        items: orderItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price
        }))
      };

      await ordersAPI.create(orderData);
      onSuccess();
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Information */}
      <div className="border-b pb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>

        {/* Select existing customer */}
        <div className="mb-4">
          <label htmlFor="customer_id" className="block text-sm font-medium text-gray-700 mb-1">
            Select Existing Customer (Optional)
          </label>
          <select
            id="customer_id"
            name="customer_id"
            value={formData.customer_id}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">New Customer / Walk-in</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.name} {customer.email ? `(${customer.email})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Customer details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Customer Name"
            name="customer_name"
            value={formData.customer_name}
            onChange={handleChange}
            placeholder="Enter customer name"
            error={errors.customer_name}
            required
          />
          <Input
            label="Email"
            name="customer_email"
            type="email"
            value={formData.customer_email}
            onChange={handleChange}
            placeholder="customer@example.com"
          />
          <Input
            label="Phone"
            name="customer_phone"
            type="tel"
            value={formData.customer_phone}
            onChange={handleChange}
            placeholder="(123) 456-7890"
          />
        </div>
      </div>

      {/* Order Items */}
      <div className="border-b pb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>

        {/* Add product */}
        <div className="flex gap-2 mb-4">
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Select a product...</option>
            {products.map(product => (
              <option key={product.id} value={product.id}>
                {product.name} - {formatCurrency(product.price)} (Stock: {product.inventory_quantity})
              </option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            value={selectedQuantity}
            onChange={(e) => setSelectedQuantity(parseInt(e.target.value))}
            className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Qty"
          />
          <Button type="button" onClick={handleAddItem} size="sm">
            Add
          </Button>
        </div>

        {errors.items && (
          <p className="text-sm text-red-600 mb-4">{errors.items}</p>
        )}

        {/* Order items list */}
        {orderItems.length > 0 ? (
          <div className="border rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orderItems.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.product_name}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(item.price)}</td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleUpdateQuantity(index, parseInt(e.target.value))}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">
                      {formatCurrency(item.price * item.quantity)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="bg-gray-50 px-4 py-3 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Total:</span>
                <span className="text-lg font-bold text-gray-900">{formatCurrency(calculateSubtotal())}</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">No items added yet</p>
        )}
      </div>

      {/* Payment Information */}
      <div className="border-b pb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <select
              id="payment_method"
              name="payment_method"
              value={formData.payment_method}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="payment_status" className="block text-sm font-medium text-gray-700 mb-1">
              Payment Status
            </label>
            <select
              id="payment_status"
              name="payment_status"
              value={formData.payment_status}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes (Optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Add any notes about this order..."
          rows={3}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Creating Order...' : 'Create Order'}
        </Button>
      </div>
    </form>
  );
};

export default OrderForm;
